"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { Listing } from "@/lib/types";

type ServiceRequest = {
  id: string;
  listing_id: string;
  owner_id: string;
  service_type: string;
  status: string;
  notes: string | null;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [listings, setListings] = useState<Listing[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadAll() {
    setError(null);

    // 1) validar sesión
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      router.push("/login");
      return;
    }

    // 2) verificar role admin
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (pErr || !profile) {
      setError("No pude leer tu perfil. Revisa RLS/policies.");
      setLoading(false);
      return;
    }

    if (profile.role !== "admin") {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);

    // 3) cargar anuncios
    const { data: listingsData, error: lErr } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (lErr) setError(lErr.message);
    setListings((listingsData ?? []) as Listing[]);

    // 4) cargar service requests (si existe tabla)
    const { data: reqData } = await supabase
      .from("service_requests")
      .select("id, listing_id, owner_id, service_type, status, notes, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    setRequests((reqData ?? []) as ServiceRequest[]);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleFeatured(listingId: string, current: boolean) {
    setError(null);
    const { error } = await supabase
      .from("listings")
      .update({ is_featured: !current })
      .eq("id", listingId);

    if (error) setError(error.message);
    await loadAll();
  }

  async function setVerifiedStatus(listingId: string, status: "none" | "pending" | "verified") {
    setError(null);
    const payload: any = { verified_status: status };
    if (status === "verified") payload.verified_at = new Date().toISOString();

    const { error } = await supabase
      .from("listings")
      .update(payload)
      .eq("id", listingId);

    if (error) setError(error.message);
    await loadAll();
  }

  async function updateRequestStatus(reqId: string, status: string) {
    setError(null);
    const { error } = await supabase
      .from("service_requests")
      .update({ status })
      .eq("id", reqId);

    if (error) setError(error.message);
    await loadAll();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) return <p>Cargando admin...</p>;

  if (!isAdmin) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="mt-2">
          No tienes permisos de admin.
        </p>
        <button onClick={logout} className="mt-4 border p-2 rounded">
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Panel Admin</h1>
        <button onClick={logout} className="border p-2 rounded">
          Cerrar sesión
        </button>
      </div>

      {error && (
        <div className="mt-4 border border-red-300 bg-red-50 p-3 rounded text-red-700">
          {error}
        </div>
      )}

      {/* LISTINGS */}
      <section className="mt-8">
        <h2 className="text-xl font-bold">Anuncios</h2>
        <div className="mt-3 grid gap-3">
          {listings.map((l) => (
            <div key={l.id} className="border rounded p-3">
              <div className="flex justify-between gap-4">
                <div>
                  <div className="font-bold">{l.title}</div>
                  <div className="text-sm text-gray-600">
                    ${l.price}/mes • {l.type} • {(l.city ?? "")} {(l.area ? `• ${l.area}` : "")}
                  </div>
                  <div className="text-sm mt-1">
                    Estado:{" "}
                    <b>
                      {l.verified_status === "verified"
                        ? "✅ verified"
                        : l.verified_status === "pending"
                        ? "⏳ pending"
                        : "none"}
                    </b>
                    {"  "}• Destacado: <b>{l.is_featured ? "⭐ Sí" : "No"}</b>
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[190px]">
                  <button
                    className="border p-2 rounded"
                    onClick={() => toggleFeatured(l.id, l.is_featured)}
                  >
                    {l.is_featured ? "Quitar destacado" : "Marcar destacado"}
                  </button>

                  <div className="flex gap-2">
                    <button
                      className="border p-2 rounded w-full"
                      onClick={() => setVerifiedStatus(l.id, "none")}
                    >
                      none
                    </button>
                    <button
                      className="border p-2 rounded w-full"
                      onClick={() => setVerifiedStatus(l.id, "pending")}
                    >
                      pending
                    </button>
                    <button
                      className="border p-2 rounded w-full"
                      onClick={() => setVerifiedStatus(l.id, "verified")}
                    >
                      verified
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {listings.length === 0 && <p>No hay anuncios.</p>}
        </div>
      </section>

      {/* SERVICE REQUESTS */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">Solicitudes de servicio</h2>
        <p className="text-sm text-gray-600">
          (verification / featured / posted_by_us)
        </p>

        <div className="mt-3 grid gap-3">
          {requests.map((r) => (
            <div key={r.id} className="border rounded p-3">
              <div className="text-sm text-gray-600">
                {new Date(r.created_at).toLocaleString()}
              </div>

              <div className="mt-1">
                <b>Servicio:</b> {r.service_type} • <b>Status:</b> {r.status}
              </div>

              <div className="text-sm mt-1">
                <b>Listing:</b> {r.listing_id}
              </div>

              {r.notes && <div className="mt-2">{r.notes}</div>}

              <div className="mt-3 flex gap-2">
                <button className="border p-2 rounded" onClick={() => updateRequestStatus(r.id, "in_progress")}>
                  In progress
                </button>
                <button className="border p-2 rounded" onClick={() => updateRequestStatus(r.id, "done")}>
                  Done
                </button>
                <button className="border p-2 rounded" onClick={() => updateRequestStatus(r.id, "rejected")}>
                  Rejected
                </button>
              </div>
            </div>
          ))}
          {requests.length === 0 && <p>No hay solicitudes todavía.</p>}
        </div>
      </section>
    </div>
  );
}
