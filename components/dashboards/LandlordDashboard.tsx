"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Listing } from "@/lib/types";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useToast } from "@/components/ToastContext";
import { MessagingCenter } from "@/components/MessagingCenter";

export function LandlordDashboard({ user }: { user: any }) {
    const [listings, setListings] = useState<Listing[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const { showToast } = useToast();

    // Confirm Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean,
        listingId: string,
        currentStatus: string
    }>({ isOpen: false, listingId: '', currentStatus: '' });

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            // Load Listings
            const { data: listData } = await supabase
                .from("listings")
                .select("*")
                .eq("owner_id", user.id)
                .order("created_at", { ascending: false });

            // Load Leads for these listings
            const { data: leadData } = await supabase
                .from("leads")
                .select("*, listings(title)")
                .order("created_at", { ascending: false });
            // Note: RLS strictly limits this to leads for my own listings? 
            // We need to ensure RLS on 'leads' table allows owners to see leads for their listings.
            // Assuming current RLS works (or we fit it).

            // Load Reviews for these listings
            const { data: revData } = await supabase
                .from("reviews")
                .select("*, listings(title), profiles:reviewer_id(full_name)")
                .eq("landlord_id", user.id)
                .order("created_at", { ascending: false });

            if (listData) setListings(listData as Listing[]);
            if (revData) setReviews(revData);
            if (leadData) {
                // Client-side filter if RLS is loose, but ideally RLS handles it.
                // For now assume API returns all leads relevant to user (checking listing owner_id join in RLS is tricky without helper function).
                // Let's filter by listings owned just in case.
                const myListingIds = listData?.map(l => l.id) || [];
                const myLeads = leadData.filter(l => myListingIds.includes(l.listing_id));
                setLeads(myLeads);
            }

            setLoading(false);
        }
        loadData();
    }, [user.id]);

    const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'reviews' | 'settings' | 'messages'>('overview');
    const [profileForm, setProfileForm] = useState({
        full_name: user?.full_name || '',
        whatsapp: user?.whatsapp || ''
    });
    const [saving, setSaving] = useState(false);

    async function toggleStatus(listingId: string, currentStatus: string) {
        const targetStatus = currentStatus === 'archived' ? 'verified' : 'archived';

        const { error } = await supabase.from('listings').update({ verified_status: targetStatus }).eq('id', listingId);

        if (!error) {
            setListings(prev => prev.map(l => l.id === listingId ? { ...l, verified_status: targetStatus as any } : l));
            showToast(currentStatus === 'archived' ? "Listing reactivated" : "Listing marked as rented", "success");
        } else {
            showToast("Error updating status", "error");
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Landlord dashboard
                    </h1>
                    <p className="text-muted-foreground">Manage your listings and connect with tenants.</p>
                </div>
                <Link href="/post" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg hover:shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95">
                    + Post listing
                </Link>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-border/50 pb-1 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'overview' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:bg-muted'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('properties')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'properties' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:bg-muted'}`}
                >
                    My listings ({listings.length})
                </button>
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'reviews' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:bg-muted'}`}
                >
                    Reviews ({reviews.length})
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'settings' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:bg-muted'}`}
                >
                    Settings
                </button>
                <button
                    onClick={() => setActiveTab('messages')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === 'messages' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-muted-foreground hover:bg-muted'}`}
                >
                    Messages 💬
                </button>
            </div>

            {/* TAB CONTENT: PROPERIES */}
            {activeTab === 'properties' && (
                <div className="grid gap-4 animate-slide-up">
                    {listings.map(l => (
                        <Card key={l.id} className="p-4 flex flex-col md:flex-row gap-4 items-center">
                            <div className="w-full md:w-32 h-32 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                                {l.images && l.images.length > 0 ? (
                                    <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">Image</div>
                                )}
                            </div>
                            <div className="flex-1 w-full text-center md:text-left">
                                <div className="flex flex-col md:flex-row justify-between items-center mb-2">
                                    <h3 className="font-bold text-lg">{l.title}</h3>
                                    <Badge variant={l.verified_status === 'verified' ? 'success' : l.verified_status === 'pending' ? 'warning' : 'default'}>
                                        {l.verified_status === 'verified' ? 'Activa' : l.verified_status === 'archived' ? 'Vendida/Archivada' : l.verified_status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{l.city} • ${l.price}/mes</p>
                                <div className="flex justify-center md:justify-start gap-2 mt-4">
                                    <Link href={`/post?edit=${l.id}`} className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
                                        ✏️ Editar
                                    </Link>
                                    <button
                                        onClick={() => setConfirmModal({
                                            isOpen: true,
                                            listingId: l.id,
                                            currentStatus: l.verified_status
                                        })}
                                        className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${l.verified_status === 'archived' ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                                    >
                                        {l.verified_status === 'archived' ? '♻️ Reactivate' : '🚫 Mark rented'}
                                    </button>
                                    <Link href={`/listing/${l.id}`} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                                        View
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* TAB CONTENT: MESSAGES */}

            {/* TAB CONTENT: REVIEWS */}
            {activeTab === 'reviews' && (
                <div className="space-y-6 animate-slide-up">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Reviews for your listings</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-yellow-500 text-xl font-bold">
                                {reviews.length > 0
                                    ? (reviews.reduce((acc, r) => acc + (r.property_rating + r.landlord_rating) / 2, 0) / reviews.length).toFixed(1)
                                    : "0"}
                            </span>
                            <span className="text-sm text-muted-foreground">Average rating</span>
                        </div>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed border-border rounded-xl">
                            <p className="text-muted-foreground">You haven&apos;t received reviews yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {reviews.map(rev => (
                                <Card key={rev.id} className="p-5 border-border/50 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                                {rev.profiles?.full_name ? rev.profiles.full_name[0] : "?"}
                                            </div>
                                            <div>
                                                <p className="font-bold">{rev.profiles?.full_name || "User"}</p>
                                                <p className="text-xs text-muted-foreground">on {rev.listings?.title}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                                ★ {((rev.property_rating + rev.landlord_rating) / 2).toFixed(1)}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">{new Date(rev.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-foreground/80 leading-relaxed italic">"{rev.comment}"</p>
                                    <div className="mt-4 flex gap-4 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                                        <span>Property: {rev.property_rating}/5</span>
                                        <span>Host: {rev.landlord_rating}/5</span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
            {/* TAB CONTENT: MESSAGES */}
            {activeTab === 'messages' && (
                <div className="animate-slide-up">
                    <MessagingCenter
                        userId={user.id}
                        role="landlord"
                        initialConversationId={selectedConvId}
                        onSelect={setSelectedConvId}
                    />
                </div>
            )}

            {/* TAB CONTENT: SETTINGS */}
            {activeTab === 'settings' && (
                <div className="max-w-2xl mx-auto animate-slide-up">
                    <Card className="p-8">
                        <h2 className="text-xl font-bold mb-6">Mi Perfil</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nombre Completo</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                                    value={profileForm.full_name}
                                    onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">WhatsApp number (with country code)</label>
                                <input
                                    type="text"
                                    placeholder="+52 123 456 7890"
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                                    value={profileForm.whatsapp}
                                    onChange={e => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">This number will be used so interested users can contact you directly.</p>
                            </div>

                            <button
                                onClick={async () => {
                                    setSaving(true);
                                    const { error } = await supabase.from('profiles').update({
                                        full_name: profileForm.full_name,
                                        whatsapp: profileForm.whatsapp
                                    }).eq('id', user.id);
                                    if (!error) showToast("Perfil actualizado", "success");
                                    else showToast("Error al actualizar", "error");
                                    setSaving(false);
                                }}
                                disabled={saving}
                                className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition-all"
                            >
                                {saving ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </div>
                    </Card>
                </div>
            )}
            {activeTab === 'overview' && (
                <>
                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-4 bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900">
                            <div className="text-2xl font-bold text-blue-600">{listings.length}</div>
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Listings</div>
                        </Card>
                        <Card className="p-4 bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900">
                            <div className="text-2xl font-bold text-green-600">{listings.filter(l => l.verified_status === 'verified').length}</div>
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Activas</div>
                        </Card>
                        <Card className="p-4 bg-purple-50/50 border-purple-100 dark:bg-purple-900/10 dark:border-purple-900">
                            <div className="text-2xl font-bold text-purple-600">{leads.length}</div>
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Leads Totales</div>
                        </Card>
                        <Card className="p-4 bg-orange-50/50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-900">
                            <div className="text-2xl font-bold text-orange-600">0</div>
                            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">New messages</div>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* My Listings Preview */}
                        <section>
                            <h2 className="text-lg font-bold mb-4 flex justify-between items-center">
                                🏠 My listings
                                <button onClick={() => setActiveTab('properties')} className="text-sm text-primary font-normal hover:underline">Ver todas</button>
                            </h2>
                            <div className="space-y-4">
                                {listings.slice(0, 3).map(l => (
                                    <Card key={l.id} className="p-4 flex gap-4 hover:shadow-md transition-shadow">
                                        <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0"></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between">
                                                <h3 className="font-semibold truncate">{l.title}</h3>
                                                <Badge variant={l.verified_status === 'verified' ? 'success' : l.verified_status === 'pending' ? 'warning' : 'default'}>
                                                    {l.verified_status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-1">{l.city}</p>
                                            <div className="text-sm font-medium">${l.price}</div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        {/* Recent Leads Preview */}
                        <section>
                            <h2 className="text-lg font-bold mb-4 flex justify-between items-center">
                                📩 Recent messages
                                <button onClick={() => setActiveTab('messages')} className="text-sm text-primary font-normal hover:underline">Ver Inbox</button>
                            </h2>
                            <div className="space-y-3">
                                {leads.slice(0, 5).map(lead => (
                                    <div key={lead.id} className="p-3 bg-card border border-border rounded-xl flex gap-3 group hover:border-primary/50 transition-all">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                            {lead.name ? lead.name[0] : "?"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <p className="font-medium text-sm">{lead.name || "Interesado"}</p>
                                                <span className="text-[10px] text-muted-foreground">{new Date(lead.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">Sobre: {lead.listings?.title}</p>
                                            <p className="text-xs text-foreground/80 mt-1 line-clamp-2">"{lead.message}"</p>

                                            {lead.from_user_id && (
                                                <button
                                                    onClick={async () => {
                                                        const { data } = await supabase
                                                            .from("conversations")
                                                            .select("id")
                                                            .eq("listing_id", lead.listing_id)
                                                            .eq("tenant_id", lead.from_user_id)
                                                            .single();

                                                        if (data) {
                                                            setSelectedConvId(data.id);
                                                            setActiveTab('messages');
                                                        } else {
                                                            showToast("Conversation not found", "error");
                                                        }
                                                    }}
                                                    className="mt-2 text-[10px] font-bold text-primary flex items-center gap-1 hover:underline"
                                                >
                                                    Responder ↩
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {leads.length === 0 && <p className="text-muted-foreground text-sm italic">You don&apos;t have messages yet.</p>}
                            </div>
                        </section>
                    </div>
                </>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.currentStatus === 'archived' ? "Reactivate listing?" : "Mark as rented?"}
                message={confirmModal.currentStatus === 'archived'
                    ? "This listing will appear again in search results."
                    : "This listing will no longer receive new messages from interested users."}
                confirmText={confirmModal.currentStatus === 'archived' ? "Confirm" : "Yes, mark as rented"}
                variant={confirmModal.currentStatus === 'archived' ? 'primary' : 'danger'}
                onConfirm={() => toggleStatus(confirmModal.listingId, confirmModal.currentStatus)}
                onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />
        </div>
    );
}
