"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { InteractiveBackground } from "@/components/InteractiveBackground";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { Listing, ServiceRequest, ServiceRequestStatus, ListingUpdatePayload } from "@/lib/types";
import { getErrorMessage } from "@/lib/errorHandler";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { AdminStatCard } from "@/components/AdminStats";
import { ConfirmModal } from "@/components/ConfirmModal";

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: "admin" | "user" | "landlord" | "tenant";
  is_verified: boolean;
  created_at?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "requests" | "listings" | "users" | "reports" | "logs">("overview");

  // Data
  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [reports, setReports] = useState<any[]>([]); // Reports State
  const [logs, setLogs] = useState<any[]>([]); // Activity Logs State

  // UI State
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "verified" | "archived">("all");
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; listingId: string | null }>({ isOpen: false, listingId: null });
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function loadAll() {
    setError(null);

    try {
      // 1) validar sesión
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setError(getErrorMessage(userError));
        setLoading(false);
        router.push("/login");
        return;
      }

      const user = userData.user;
      if (!user) {
        router.push("/login");
        return;
      }

      // 2) verificar permisos
      const { data: profile, error: pErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (pErr || !profile) {
        console.error("Error validando admin", pErr);
      }

      const isUserAdmin = profile?.role === "admin";

      if (!isUserAdmin) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      // 3) cargar anuncios
      const { data: listingsData, error: lErr } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (lErr) setError(`Error anuncios: ${getErrorMessage(lErr)}`);
      else setListings((listingsData ?? []) as Listing[]);

      // 4) cargar service requests
      const { data: reqData, error: reqErr } = await supabase
        .from("service_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (reqErr) console.warn("Error solis:", getErrorMessage(reqErr));
      else setRequests((reqData ?? []) as ServiceRequest[]);

      // 5) cargar usuarios (usando RPC seguro para obtener emails)
      const { data: profilesData, error: profErr } = await supabase
        .rpc("get_users_with_email");

      if (profErr) {
        console.warn("Error al cargar usuarios (RPC):", getErrorMessage(profErr));
        // Fallback a tabla normal si falla el RPC (aunque sin emails si RLS bloquea)
        const { data: fallbackData } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
        if (fallbackData) setUsers(fallbackData as Profile[]);
      } else {
        setUsers((profilesData ?? []) as Profile[]);
      }

      // 6) Load Reports
      const { data: reportData, error: repErr } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (repErr) console.warn("Error reports:", getErrorMessage(repErr));
      else setReports(reportData || []);

      // 7) Load Logs
      const { data: logData, error: logErr } = await supabase
        .from("audit_logs")
        .select(`*, profiles:user_id(full_name)`)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!logErr) setLogs(logData || []);

    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // --- ACTIONS ---

  async function toggleFeatured(listingId: string, current: boolean) {
    setProcessingId(listingId);
    try {
      const { error } = await supabase.from("listings").update({ is_featured: !current }).eq("id", listingId);
      if (error) throw error;

      const { data: user } = await supabase.auth.getUser();
      await supabase.rpc('log_action', {
        p_user_id: user.user?.id,
        p_action: 'toggle_featured',
        p_details: { listing_id: listingId, new_state: !current }
      });

      await loadAll();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  }

  async function setVerifiedStatus(listingId: string, status: "none" | "pending" | "verified" | "archived") {
    setProcessingId(listingId + status);
    try {
      const payload: ListingUpdatePayload = { verified_status: status };
      if (status === "verified") payload.verified_at = new Date().toISOString();
      const { error } = await supabase.from("listings").update(payload).eq("id", listingId);
      if (error) throw error;

      const { data: user } = await supabase.auth.getUser();
      await supabase.rpc('log_action', {
        p_user_id: user.user?.id,
        p_action: 'set_verified_status',
        p_details: { listing_id: listingId, status }
      });

      await loadAll();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  }

  async function updateRequestStatus(reqId: string, status: ServiceRequestStatus) {
    try {
      const { error } = await supabase.from("service_requests").update({ status }).eq("id", reqId);
      if (error) throw error;
      await loadAll();
    } catch (err) { setError(getErrorMessage(err)); }
  }

  async function updateReportStatus(reportId: string, status: "resolved" | "dismissed") {
    try {
      const { error } = await supabase.from("reports").update({ status }).eq("id", reportId);
      if (error) throw error;
      await loadAll();
    } catch (err) { setError(getErrorMessage(err)); }
  }

  async function toggleUserVerification(userId: string, currentStatus: boolean) {
    setProcessingId(userId);
    try {
      const { error } = await supabase.from("profiles").update({ is_verified: !currentStatus }).eq("id", userId);
      if (error) throw error;

      const { data: user } = await supabase.auth.getUser();
      await supabase.rpc('log_action', {
        p_user_id: user.user?.id,
        p_action: 'toggle_user_verification',
        p_details: { target_user_id: userId, new_status: !currentStatus }
      });

      await loadAll();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProcessingId(null);
    }
  }

  // --- FILTERS ---
  const getListingStatusLabel = (status: Listing["verified_status"]) => {
    switch (status) {
      case "pending":
        return t("admin.statusPending");
      case "verified":
        return t("admin.statusVerified");
      case "archived":
        return t("admin.statusArchived");
      default:
        return t("admin.statusUnverified");
    }
  };

  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.city?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "all" ? true : l.verified_status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [listings, searchTerm, filterStatus]);

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
    (u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);


  if (loading) return <div className="container-custom py-20 text-center"><div className="animate-pulse text-primary font-medium">{t("admin.loading")}</div></div>;

  if (!isAdmin) {
    return (
      <div className="relative min-h-[60vh] flex items-center justify-center bg-dots-pattern overflow-hidden">
        <InteractiveBackground />
        <Card className="max-w-md w-full text-center p-10 glass border-red-200">
          <div className="text-4xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-2 text-red-600">{t("admin.accessDenied")}</h1>
          <p className="text-muted-foreground mb-6">{t("admin.noAccess")}</p>
          <Link href="/" className="text-primary hover:underline font-medium">{t("admin.backHome")}</Link>
        </Card>
      </div>
    );
  }

  // Stats for Overview
  const totalUsers = users.length;
  const verifiedUsers = users.filter(u => u.is_verified).length;
  const totalListings = listings.length;
  const pendingListings = listings.filter(l => l.verified_status === "pending").length;
  const newRequests = requests.filter(r => r.status === "new").length;

  const pendingReports = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="relative min-h-screen bg-dots-pattern overflow-hidden">
      <InteractiveBackground />
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-float -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] animate-float -z-10" style={{ animationDelay: "5s" }} />

      <div className="container-custom py-8 relative z-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              {t("admin.title")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("admin.subtitle")}</p>
          </div>

          <div className="flex bg-muted/50 p-1 rounded-xl backdrop-blur-sm border border-border/50 overflow-x-auto max-w-full">
            {[
              { id: 'overview', label: t("admin.overview"), icon: '📊' },
              { id: 'requests', label: t("admin.requests"), icon: '🔔', count: newRequests },
              { id: 'reports', label: t("admin.reports"), icon: '🚩', count: pendingReports },
              { id: 'listings', label: t("admin.listings"), icon: '🏠', count: pendingListings },
              { id: 'users', label: t("admin.users"), icon: '👥' },
              { id: 'logs', label: t("admin.logs"), icon: '📜' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setSearchTerm(""); setFilterStatus("all"); }} // Reset filters on tab change
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {tab.count ? (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[10px] min-w-[1.2rem] text-center">{tab.count}</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50/80 dark:bg-red-900/30 border border-red-200 dark:border-red-900 p-4 rounded-xl text-red-700 dark:text-red-300 backdrop-blur-sm shadow-sm animate-slide-up flex items-center gap-3">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="animate-fade-in">

          {/* --- OVERVIEW TAB --- */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <AdminStatCard title={t("admin.totalUsers")} value={totalUsers} icon="👥" color="blue" trend={`+${verifiedUsers} ${t("admin.verified")}`} trendUp={true} />
                <AdminStatCard title={t("admin.listingsCount")} value={totalListings} icon="🏠" color="purple" trend={`${pendingListings} ${t("admin.pending")}`} trendUp={pendingListings === 0} />
                <AdminStatCard title={t("admin.requestsCount")} value={newRequests} icon="🔔" color="orange" trend={newRequests > 0 ? t("admin.needsAttention") : t("admin.allCaughtUp")} trendUp={newRequests === 0} />
                <AdminStatCard title={t("admin.revenue")} value="$0" icon="💰" color="green" trend={t("admin.comingSoon")} trendUp={true} />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="glass p-6">
                  <h3 className="font-semibold mb-4">{t("admin.recentActivity")}</h3>
                  <div className="space-y-4">
                    {users.slice(0, 3).map(u => (
                      <div key={u.id} className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">👤</div>
                        <div>
                          <p className="font-medium">{t("admin.newUser")}</p>
                          <p className="text-muted-foreground text-xs">{u.email}</p>
                        </div>
                        <div className="ml-auto text-xs text-muted-foreground">{new Date(u.created_at || "").toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="glass p-6">
                  <h3 className="font-semibold mb-4">{t("admin.systemStatus")}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm"><span>{t("admin.database")}</span> <Badge variant="success">Online</Badge></div>
                    <div className="flex justify-between text-sm"><span>{t("admin.storage")}</span> <Badge variant="success">Online</Badge></div>
                    <div className="flex justify-between text-sm"><span>{t("admin.appVersion")}</span> <span className="font-mono text-muted-foreground">v1.2.0</span></div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* --- REQUESTS TAB --- */}
          {activeTab === 'requests' && (
            <section className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {requests.length === 0 ? (
                  <div className="col-span-full text-center py-20 text-muted-foreground bg-card/30 rounded-xl border border-dashed border-border">
                    {t("admin.noPendingRequests")} 🎉
                  </div>
                ) : (
                  requests.map((r) => (
                    <Card key={r.id} className="glass hover:shadow-lg transition-all border-border/50">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant={r.status === 'done' ? 'success' : r.status === 'rejected' ? 'danger' : r.status === 'in_progress' ? 'warning' : 'default'}>
                          {r.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="mb-4">
                        <h3 className="font-semibold text-lg capitalize">{r.service_type.replace('_', ' ')}</h3>
                        <p className="text-sm text-muted-foreground">{t("admin.listingId")}: <Link href={`/listing/${r.listing_id}`} className="font-mono bg-muted px-1 rounded hover:text-primary underline">{r.listing_id.substring(0, 8)}...</Link></p>
                      </div>

                      {r.notes && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-3 rounded-lg text-sm mb-4 border border-amber-100 dark:border-amber-900/50">
                          📝 {r.notes}
                        </div>
                      )}

                      <div className="flex gap-2 mt-auto pt-4 border-t border-border/50">
                        {r.status !== 'done' && r.status !== 'rejected' && (
                          <>
                            <button onClick={() => updateRequestStatus(r.id, "in_progress")} className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors" title={t("admin.process")}>⚙️</button>
                            <button onClick={() => updateRequestStatus(r.id, "done")} className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium">{t("admin.approve")}</button>
                            <button onClick={() => updateRequestStatus(r.id, "rejected")} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors" title={t("admin.reject")}>✕</button>
                          </>
                        )}
                        {(r.status === 'done' || r.status === 'rejected') && (
                          <span className="text-sm text-muted-foreground w-full text-center italic">{t("admin.completed")}</span>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </section>
          )}

          {/* --- REPORTS TAB --- */}
          {activeTab === 'reports' && (
            <section className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reports.length === 0 ? (
                  <div className="col-span-full text-center py-20 text-muted-foreground bg-card/30 rounded-xl border border-dashed border-border">
                    {t("admin.noReports")} 🫡
                  </div>
                ) : (
                  reports.map(rep => (
                    <Card key={rep.id} className={`glass hover:shadow-lg transition-all border-l-4 ${rep.status === 'pending' ? 'border-l-red-500' : 'border-l-gray-300'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={rep.status === 'pending' ? 'danger' : 'default'}>
                          {rep.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{new Date(rep.created_at).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-bold text-lg mb-1">{rep.reason}</h3>
                      <p className="text-sm text-foreground/80 mb-2">
                        {t("admin.type")}: <span className="font-mono bg-muted px-1 rounded uppercase text-xs">{rep.target_type}</span>
                      </p>
                      <div className="bg-muted/50 p-2 rounded text-xs font-mono mb-4 text-muted-foreground truncate">
                        {t("admin.targetId")}: {rep.target_id}
                      </div>

                      {rep.status === 'pending' && (
                        <div className="flex gap-2 border-t border-border/50 pt-3">
                          <button
                            onClick={() => updateReportStatus(rep.id, 'resolved')}
                            className="flex-1 py-1.5 bg-green-50 text-green-700 rounded hover:bg-green-100 text-sm font-medium transition-colors"
                          >
                            {t("admin.resolve")}
                          </button>
                          <button
                            onClick={() => updateReportStatus(rep.id, 'dismissed')}
                            className="flex-1 py-1.5 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 text-sm font-medium transition-colors"
                          >
                            {t("admin.dismiss")}
                          </button>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </section>
          )}

          {/* --- LISTINGS TAB --- */}
          {activeTab === 'listings' && (
            <section className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row gap-4 mb-6 bg-card/40 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
                <input
                  type="text"
                  placeholder={`🔍 ${t("admin.searchListings")}`}
                  className="flex-1 px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                  <option value="all">{t("admin.allStatuses")}</option>
                  <option value="pending">{t("admin.statusPending")}</option>
                  <option value="verified">{t("admin.statusVerified")}</option>
                  <option value="archived">{t("admin.statusArchived")}</option>
                </select>
              </div>

              <div className="bg-card/50 glass rounded-xl border border-border/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50 bg-muted/30">
                        <th className="px-6 py-4 text-left font-semibold text-muted-foreground">{t("admin.listing")}</th>
                        <th className="px-6 py-4 text-left font-semibold text-muted-foreground">{t("admin.status")}</th>
                        <th className="px-6 py-4 text-left font-semibold text-muted-foreground">{t("admin.price")}</th>
                        <th className="px-6 py-4 text-center font-semibold text-muted-foreground">{t("admin.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredListings.map((l) => (
                        <tr key={l.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-medium text-base truncate max-w-[200px]" title={l.title}>{l.title}</div>
                            <div className="text-muted-foreground text-xs mt-1">{l.city} • {l.type}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1.5 items-start">
                              <Badge variant={l.verified_status === 'verified' ? 'success' : l.verified_status === 'pending' ? 'warning' : l.verified_status === 'archived' ? 'danger' : 'default'}>
                                {getListingStatusLabel(l.verified_status)}
                              </Badge>
                              {l.is_featured && <Badge variant="warning">Destacado</Badge>}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono font-medium">
                            ${l.price}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2 opacity-100">
                              <button
                                onClick={() => toggleFeatured(l.id, l.is_featured)}
                                disabled={processingId === l.id}
                                className={`p-2 rounded-lg transition-colors border ${l.is_featured ? 'bg-yellow-100 border-yellow-200 text-yellow-700' : 'bg-background border-border text-muted-foreground hover:bg-muted'} ${processingId === l.id ? 'animate-pulse opacity-50' : ''}`}
                                title="Destacar"
                              >
                                {processingId === l.id ? '⏳' : '★'}
                              </button>

                              <div className="flex bg-background border border-border rounded-lg overflow-hidden">
                              <button
                                onClick={() => setVerifiedStatus(l.id, "pending")}
                                disabled={processingId === (l.id + "pending")}
                                className={`px-2 py-1.5 border-r border-border hover:bg-muted ${l.verified_status === 'pending' ? 'bg-yellow-50 text-yellow-700' : ''} ${processingId === (l.id + "pending") ? 'animate-pulse' : ''}`}
                                title={t("admin.statusPending")}
                              >
                                ⏳
                              </button>
                              <button
                                onClick={() => setVerifiedStatus(l.id, "verified")}
                                disabled={processingId === (l.id + "verified")}
                                className={`px-2 py-1.5 hover:bg-muted ${l.verified_status === 'verified' ? 'bg-green-50 text-green-700' : ''} ${processingId === (l.id + "verified") ? 'animate-pulse' : ''}`}
                                title={t("admin.verify")}
                              >
                                ✅
                              </button>
                            </div>

                            {l.verified_status !== 'archived' ? (
                              <button onClick={() => setVerifiedStatus(l.id, 'archived')} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 border border-gray-200" title={t("admin.archive")}>📁</button>
                            ) : (
                              <button onClick={() => setVerifiedStatus(l.id, 'none')} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-200" title={t("admin.restore")}>↺</button>
                            )}

                            <button
                              onClick={() => setConfirmModal({ isOpen: true, listingId: l.id })}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200" title={t("admin.delete")}
                            >
                              🗑️
                            </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredListings.length === 0 && (
                        <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">{t("admin.noListings")}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* --- USERS TAB --- */}
          {activeTab === 'users' && (
            <section className="space-y-4">
              {/* Search Toolbar */}
              <div className="mb-6 bg-card/40 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
                <input
                  type="text"
                  placeholder={`🔍 ${t("admin.searchUsers")}`}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredUsers.map((u) => (
                  <Card key={u.id} className="glass hover:shadow-lg transition-all p-0 flex flex-col overflow-hidden group">
                    <div className="p-5 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-sm ${u.is_verified ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-700' : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500'}`}>
                          {u.full_name ? u.full_name.charAt(0).toUpperCase() : u.email ? u.email.charAt(0).toUpperCase() : "?"}
                        </div>
                        <Badge variant={u.is_verified ? 'success' : 'default'} className="shadow-sm">
                          {u.is_verified ? t("admin.verifiedLabel") : t("admin.unverified")}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="font-bold text-lg truncate" title={u.full_name}>{u.full_name || t("admin.unnamedUser")}</h3>
                        <p className="text-sm text-foreground/80 font-medium truncate flex items-center gap-1.5" title={u.email}>
                          📧 {u.email}
                        </p>

                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border capitalize ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            u.role === 'landlord' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}>
                            {u.role === 'landlord' ? `🏠 ${t("admin.roleLandlord")}` : u.role === 'admin' ? '🛡️ Admin' : `👤 ${t("admin.roleUser")}`}
                          </span>
                        </div>
                      </div>

                      {/* Metadata Section */}
                      <div className="bg-muted/30 -mx-5 -mb-5 mt-2 p-4 border-t border-border/50 text-xs text-muted-foreground space-y-1.5">
                        <div className="flex justify-between">
                          <span>{t("admin.joined")}:</span>
                          <span className="font-mono">{new Date(u.created_at || "").toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center group/id">
                          <span>ID:</span>
                          <span className="font-mono opacity-70 group-hover/id:opacity-100 transition-opacity truncate max-w-[120px]" title={u.id}>{u.id.substring(0, 12)}...</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/10 border-t border-border/50 mt-auto">
                      <button
                        onClick={() => toggleUserVerification(u.id, u.is_verified)}
                        disabled={processingId === u.id}
                        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 ${u.is_verified
                          ? 'bg-background border border-red-200 text-red-600 hover:bg-red-50'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25'
                          } ${processingId === u.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {processingId === u.id ? (
                          <span className="animate-spin">🔄</span>
                        ) : u.is_verified ? (
                          <>🚫 {t("admin.revokeVerification")}</>
                        ) : (
                          <>✅ {t("admin.verifyUser")}</>
                        )}
                      </button>
                    </div>
                  </Card>
                ))}
                {filteredUsers.length === 0 && <p className="col-span-full text-center text-muted-foreground py-10">{t("admin.noUsers")}</p>}
              </div>
            </section>
          )}

          {/* --- LOGS TAB --- */}
          {activeTab === 'logs' && (
            <section className="space-y-4">
              <div className="bg-card/50 glass rounded-xl border border-border/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 border-b border-border/50">
                      <tr>
                        <th className="px-6 py-4 font-semibold text-muted-foreground">{t("admin.date")}</th>
                        <th className="px-6 py-4 font-semibold text-muted-foreground">Admin</th>
                        <th className="px-6 py-4 font-semibold text-muted-foreground">{t("admin.action")}</th>
                        <th className="px-6 py-4 font-semibold text-muted-foreground">{t("admin.details")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground font-mono">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 font-medium italic">
                            {log.profiles?.full_name || 'Admin'}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={log.action.includes('delete') ? 'danger' : 'default'} className="uppercase text-[10px]">
                              {log.action.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-xs text-muted-foreground truncate max-w-xs" title={JSON.stringify(log.details)}>
                            {JSON.stringify(log.details)}
                          </td>
                        </tr>
                      ))}
                      {logs.length === 0 && (
                        <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">{t("admin.noActivity")}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={t("admin.deleteListingTitle")}
        message={t("admin.deleteListingMessage")}
        onConfirm={async () => {
          if (confirmModal.listingId) {
            const { error } = await supabase.from('listings').delete().eq('id', confirmModal.listingId);
            if (!error) loadAll();
          }
          setConfirmModal({ isOpen: false, listingId: null });
        }}
        onCancel={() => setConfirmModal({ isOpen: false, listingId: null })}
      />
    </div>
  );
}
