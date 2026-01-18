"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Listing } from "@/lib/types";
import { useToast } from "@/components/ToastContext";
import { MessagingCenter } from "@/components/MessagingCenter";

export function TenantDashboard({ user }: { user: any }) {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'messages'>('overview');
    const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
    const [profileForm, setProfileForm] = useState({
        full_name: user?.full_name || '',
        whatsapp: user?.whatsapp || ''
    });
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        async function loadData() {
            setLoading(true);

            // Load History from localStorage (Client-side only)
            const historyRaw = localStorage.getItem("recently_viewed");
            if (historyRaw) setHistory(JSON.parse(historyRaw));

            // Load Favorites with Listing details
            const { data, error } = await supabase
                .from("favorites")
                .select("*, listings:listing_id(*)")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) console.error("Error loading favorites:", error);
            else setFavorites(data || []);

            // Load Alerts
            const { data: alertsData, error: alertsErr } = await supabase
                .from("search_alerts")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (!alertsErr) setAlerts(alertsData || []);

            // Load My Reviews
            const { data: revData } = await supabase
                .from("reviews")
                .select("*, listings(title)")
                .eq("reviewer_id", user.id)
                .order("created_at", { ascending: false });

            if (revData) setReviews(revData);

            setLoading(false);
        }
        loadData();
    }, [user.id]);

    async function removeFavorite(favId: string) {
        const { error } = await supabase.from("favorites").delete().eq("id", favId);
        if (!error) {
            setFavorites(prev => prev.filter(f => f.id !== favId));
            showToast("Favorito eliminado", "success");
        }
    }

    async function removeAlert(alertId: string) {
        const { error } = await supabase.from("search_alerts").delete().eq("id", alertId);
        if (!error) {
            setAlerts(prev => prev.filter(a => a.id !== alertId));
            showToast("Alerta eliminada", "success");
        }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header / Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/50 pb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Mi Espacio
                    </h1>
                    <p className="text-muted-foreground">Hola, {user.full_name?.split(' ')[0] || "Inquilino"}. Gestiona tus intereses.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    >
                        🏠 Resumen
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    >
                        ⚙️ Perfil
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'messages' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    >
                        💬 Mensajes
                    </button>
                </div>
            </div>

            {activeTab === 'messages' && (
                <div className="animate-slide-up">
                    <MessagingCenter
                        userId={user.id}
                        role="tenant"
                        initialConversationId={selectedConvId}
                        onSelect={setSelectedConvId}
                    />
                </div>
            )}

            {activeTab === 'settings' ? (
                <div className="max-w-xl mx-auto animate-slide-up">
                    <Card className="p-8">
                        <h2 className="text-xl font-bold mb-6">Ajustes de Perfil</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={profileForm.full_name}
                                    onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">WhatsApp</label>
                                <input
                                    type="text"
                                    placeholder="+52..."
                                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={profileForm.whatsapp}
                                    onChange={e => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                                />
                                <p className="text-[10px] text-muted-foreground mt-1 text-center italic">Esto ayuda a que los propietarios confíen más en tu perfil.</p>
                            </div>
                            <button
                                onClick={async () => {
                                    setSaving(true);
                                    const { error } = await supabase.from('profiles').update({
                                        full_name: profileForm.full_name,
                                        whatsapp: profileForm.whatsapp
                                    }).eq('id', user.id);
                                    if (!error) showToast("Perfil actualizado", "success");
                                    else showToast("Error al guardar", "error");
                                    setSaving(false);
                                }}
                                disabled={saving}
                                className="w-full bg-primary text-white py-3 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95"
                            >
                                {saving ? "Guardando..." : "Guardar Cambios"}
                            </button>
                        </div>
                    </Card>
                </div>
            ) : (
                <>
                    {/* Favorites Grid */}
                    <section>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            ❤️ Favoritos Guardados
                            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{favorites.length}</span>
                        </h2>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-xl"></div>)}
                            </div>
                        ) : favorites.length === 0 ? (
                            <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
                                <div className="text-4xl mb-4">🏠</div>
                                <h3 className="text-lg font-medium mb-2">No tienes favoritos aún</h3>
                                <p className="text-muted-foreground mb-6">Explora las rentas y guarda las que te gusten.</p>
                                <Link href="/search" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">Explorar Propiedades</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {favorites.map((fav) => {
                                    const listing = fav.listings;
                                    if (!listing) return null;
                                    return (
                                        <Card key={fav.id} className="group hover:shadow-lg transition-all border-border/50 overflow-hidden relative">
                                            <div className="h-40 bg-secondary/30 relative">
                                                {listing.images && listing.images.length > 0 ? (
                                                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/30">
                                                        🏠
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold truncate pr-4">{listing.title}</h3>
                                                    <Badge variant={listing.type === 'house' ? 'default' : 'success'}>{listing.type}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-3">{listing.city}</p>
                                                <div className="flex items-center justify-between mt-auto">
                                                    <span className="font-bold text-lg text-primary">${listing.price}</span>
                                                    <div className="flex gap-2">
                                                        <Link href={`/listing/${listing.id}`} className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg text-xs font-medium transition-colors">
                                                            Ver
                                                        </Link>
                                                        <button
                                                            onClick={() => removeFavorite(fav.id)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Eliminar de favoritos"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Search Alerts */}
                    <section className="pt-8 border-t border-border/50">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            🔔 Mis Alertas de Búsqueda
                            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{alerts.length}</span>
                        </h2>

                        {alerts.length === 0 ? (
                            <p className="text-muted-foreground text-sm italic">No has guardado ninguna alerta de búsqueda todavía.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {alerts.map((alert) => (
                                    <div key={alert.id} className="bg-card border border-border rounded-xl p-4 flex justify-between items-center group hover:border-primary/30 transition-colors shadow-sm">
                                        <div>
                                            <div className="flex flex-wrap gap-2 mb-1">
                                                {alert.criteria.city && <Badge variant="default" className="text-[10px]">📍 {alert.criteria.city}</Badge>}
                                                {alert.criteria.type && alert.criteria.type !== 'all' && <Badge variant="success" className="text-[10px] capitalize">{alert.criteria.type}</Badge>}
                                                {alert.criteria.maxPrice && <Badge variant="warning" className="text-[10px]">💰 Máx ${alert.criteria.maxPrice}</Badge>}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground">Creada el {new Date(alert.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <Link
                                                href={`/search?city=${alert.criteria.city || ''}&type=${alert.criteria.type || 'all'}&maxPrice=${alert.criteria.maxPrice || ''}`}
                                                className="text-xs font-bold text-primary hover:underline px-2 py-1"
                                            >
                                                Ver Resultados
                                            </Link>
                                            <button onClick={() => removeAlert(alert.id)} className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100">🗑️</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Vistos Recientemente Section */}
                    <section className="pt-8 border-t border-border/50">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                🕒 Vistos Recientemente
                                <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{history.length}</span>
                            </h2>
                            <button onClick={() => { localStorage.removeItem("recently_viewed"); setHistory([]); }} className="text-xs text-muted-foreground hover:text-red-500">Limpiar</button>
                        </div>

                        {history.length === 0 ? (
                            <p className="text-muted-foreground text-sm italic">No has visto propiedades recientemente.</p>
                        ) : (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {history.map((item) => (
                                    <Link key={item.id} href={`/listing/${item.id}`} className="min-w-[200px] group">
                                        <Card className="overflow-hidden border-border/40 group-hover:border-primary/30 transition-all">
                                            <div className="h-24 bg-muted overflow-hidden">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-sm">🏠</div>
                                                )}
                                            </div>
                                            <div className="p-3">
                                                <h4 className="font-bold text-xs truncate group-hover:text-primary transition-colors">{item.title}</h4>
                                                <div className="flex justify-between items-center mt-1">
                                                    <span className="text-[10px] text-muted-foreground">{item.city}</span>
                                                    <span className="text-xs font-bold">${item.price}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* My Reviews Section */}
                    <section className="pt-8 border-t border-border/50 pb-10">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            ✍️ Mis Reseñas
                            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{reviews.length}</span>
                        </h2>

                        {reviews.length === 0 ? (
                            <p className="text-muted-foreground text-sm italic">No has dejado reseñas todavía.</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {reviews.map(rev => (
                                    <Card key={rev.id} className="p-4 border-border/40 hover:border-primary/20 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-sm">Reseña: <span className="text-primary">{rev.listings?.title}</span></h3>
                                            <div className="flex items-center gap-1 text-yellow-500 font-bold text-xs">★ {((rev.property_rating + rev.landlord_rating) / 2).toFixed(1)}</div>
                                        </div>
                                        <p className="text-xs text-foreground/80 italic mb-2">"{rev.comment}"</p>
                                        <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                            <span>{new Date(rev.created_at).toLocaleDateString()}</span>
                                            <span>P: {rev.property_rating} | A: {rev.landlord_rating}</span>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
