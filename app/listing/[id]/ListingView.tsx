"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import LeadForm from "@/components/LeadForm";
import { Badge } from "@/components/Badge";
import { InteractiveBackground } from "@/components/InteractiveBackground";
import { StarRating } from "@/components/StarRating";
import { ReviewForm } from "@/components/ReviewForm";
import { Listing } from "@/lib/types";
import { AmenitiesDisplay } from "@/components/AmenitiesDisplay";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
    ssr: false,
    loading: () => <div className="h-48 bg-muted animate-pulse rounded-xl flex items-center justify-center">Cargando mapa...</div>
});

export default function ListingView({ listingId }: { listingId: string }) {
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [session, setSession] = useState<any>(null);
    const [hasContacted, setHasContacted] = useState(false);
    const [userReview, setUserReview] = useState<any>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reporting, setReporting] = useState(false);

    // Auto-play Gallery
    useEffect(() => {
        if (!listing?.images || listing.images.length <= 1) return;

        const interval = setInterval(() => {
            setActiveImageIndex(prev => (prev + 1) % listing.images!.length);
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, [listing]);

    useEffect(() => {
        async function fetchListing() {
            try {
                setLoading(true);
                // Load Session
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);

                // Load Listing with Owner Profile
                const { data, error } = await supabase
                    .from("listings")
                    .select("*, profiles:owner_id(full_name, id, is_verified, role, created_at, whatsapp)")
                    .eq("id", listingId)
                    .single();

                if (error) throw error;
                setListing(data as any);

                // 4. Save to Recently Viewed (localStorage)
                if (data) {
                    const historyRaw = localStorage.getItem("recently_viewed");
                    let history = historyRaw ? JSON.parse(historyRaw) : [];
                    // Remove if already exists
                    history = history.filter((item: any) => item.id !== data.id);
                    // Add to front
                    history.unshift({
                        id: data.id,
                        title: data.title,
                        city: data.city,
                        price: data.price,
                        image: data.images?.[0] || null,
                        timestamp: Date.now()
                    });
                    // Keep only last 5
                    localStorage.setItem("recently_viewed", JSON.stringify(history.slice(0, 5)));
                }

                // Load Reviews
                const { data: revs, error: revErr } = await supabase
                    .from("reviews")
                    .select("*, profiles:reviewer_id(full_name)")
                    .eq("listing_id", listingId)
                    .order("created_at", { ascending: false });

                if (!revErr) {
                    setReviews(revs || []);
                    if (session) {
                        const found = revs?.find(r => r.reviewer_id === session.user.id);
                        setUserReview(found);
                    }
                }

                // Check if user contacted
                if (session) {
                    const { data: leads } = await supabase
                        .from("leads")
                        .select("id")
                        .eq("listing_id", listingId)
                        .eq("from_user_id", session.user.id)
                        .limit(1);

                    if (leads && leads.length > 0) setHasContacted(true);

                    // Check favorite status
                    const { data: favs } = await supabase.from("favorites").select("id").eq("listing_id", listingId).eq("user_id", session.user.id);
                    if (favs && favs.length > 0) setIsFavorite(true);
                }

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (listingId) fetchListing();
    }, [listingId]);

    async function handleReport() {
        if (!session) return;
        if (!reportReason.trim()) return;

        setReporting(true);
        try {
            const { error } = await supabase.from("reports").insert({
                reporter_id: session.user.id,
                target_type: "listing",
                target_id: listingId,
                reason: reportReason,
                status: "pending"
            });

            if (error) throw error;
            alert("Reporte enviado exitosamente. Gracias por ayudarnos a mantener la comunidad segura.");
            setShowReportModal(false);
            setReportReason("");
        } catch (err: any) {
            alert("Error al enviar reporte: " + err.message);
        } finally {
            setReporting(false);
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-dots-pattern">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full mb-4"></div>
                <div className="text-primary font-medium">Cargando propiedad...</div>
            </div>
        </div>
    );

    if (error || !listing) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-dots-pattern">
            <h1 className="text-2xl font-bold mb-4 text-red-500">Error</h1>
            <p className="mb-6 text-muted-foreground">{error || "Propiedad no encontrada"}</p>
            <Link href="/search" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                Volver al buscador
            </Link>
        </div>
    );

    const isOwner = session?.user?.id === listing.owner_id;
    const avgProperty = reviews.length ? (reviews.reduce((acc, r) => acc + r.property_rating, 0) / reviews.length).toFixed(1) : null;
    const avgLandlord = reviews.length ? (reviews.reduce((acc, r) => acc + r.landlord_rating, 0) / reviews.length).toFixed(1) : null;

    return (
        <div className="min-h-screen bg-dots-pattern relative overflow-hidden flex flex-col w-full">
            <InteractiveBackground />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 animate-float" />

            <main className="container-custom py-10 flex-grow relative z-10 w-full">
                {/* Breadcrumb & Title */}
                <div className="mb-8 animate-slide-up">
                    <Link href="/search" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">← Volver a resultados</Link>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Badge variant={listing.type === 'house' ? 'default' : listing.type === 'apartment' ? 'success' : 'warning'}>
                                    {listing.type === 'house' ? 'Casa' : listing.type === 'apartment' ? 'Departamento' : 'Cuarto'}
                                </Badge>
                                {listing.verified_status === 'verified' && (
                                    <Badge variant="verified">
                                        <span className="flex items-center gap-1">🛡️ Verificado</span>
                                    </Badge>
                                )}
                                {listing.is_featured && <Badge variant="warning">Destacado</Badge>}
                                {listing.verified_status === 'archived' && <Badge variant="danger">Archivado</Badge>}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{listing.title}</h1>
                            <p className="text-muted-foreground flex items-center gap-2 mb-2">
                                📍 {listing.neighborhood || listing.area || listing.city || "Ubicación no especificada"}
                                {(listing.neighborhood || listing.area) && listing.city && <span className="text-xs opacity-50">• {listing.city}</span>}
                            </p>

                            {/* Owner Info */}
                            {listing.profiles && (
                                <div className="flex items-center gap-2 mb-3 text-sm">
                                    <span className="text-muted-foreground">Publicado por:</span>
                                    <Link href={`/profile/${listing.owner_id}`} className="font-medium text-primary hover:underline flex items-center gap-1">
                                        {listing.profiles.full_name || "Propietario"}
                                        {listing.profiles.is_verified && <span className="text-green-500" title="Verificado">✓</span>}
                                    </Link>
                                </div>
                            )}

                            {/* Ratings Summary */}
                            {reviews.length > 0 && (
                                <div className="flex items-center gap-4 mt-3 text-sm">
                                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-md text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                                        <span>★ {avgProperty} Propiedad</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                        <span>👤 {avgLandlord} Anfitrión</span>
                                    </div>
                                    <span className="text-muted-foreground underline">{reviews.length} opiniones</span>
                                </div>
                            )}
                        </div>

                        <div className="text-right flex flex-col items-end gap-2">
                            <div className="text-3xl font-bold text-primary">${listing.price.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/mes</span></div>
                            {listing.deposit && <div className="text-sm text-muted-foreground">Depósito: ${listing.deposit.toLocaleString()}</div>}

                            {/* Actions */}
                            <div className="mt-2 flex items-center gap-3">
                                {session && (
                                    <button
                                        onClick={async () => {
                                            if (isFavorite) {
                                                await supabase.from("favorites").delete().eq("listing_id", listing.id).eq("user_id", session.user.id);
                                                setIsFavorite(false);
                                            } else {
                                                await supabase.from("favorites").insert({ listing_id: listing.id, user_id: session.user.id });
                                                setIsFavorite(true);
                                            }
                                        }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isFavorite ? 'bg-red-50 text-red-500 border border-red-200' : 'bg-background border border-border hover:bg-muted'}`}
                                    >
                                        {isFavorite ? '❤️ Guardado' : '🤍 Guardar'}
                                    </button>
                                )}

                                <button
                                    onClick={() => session ? setShowReportModal(true) : alert("Inicia sesión para reportar un anuncio.")}
                                    className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                                    title="Reportar Anuncio"
                                >
                                    🚩
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Image & Details */}
                    <div className="lg:col-span-2 space-y-8 animate-fade-in">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="aspect-video bg-muted rounded-2xl border border-border overflow-hidden relative group shadow-sm bg-secondary/10">
                                {listing.images && listing.images.length > 0 ? (
                                    <>
                                        {isImageLoading && (
                                            <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
                                                <span className="text-muted-foreground text-sm">Cargando imagen...</span>
                                            </div>
                                        )}
                                        <Image
                                            src={listing.images[activeImageIndex]}
                                            alt={listing.title}
                                            fill
                                            className={`object-cover transition-all duration-700 group-hover:scale-105 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                                            onLoadingComplete={() => setIsImageLoading(false)}
                                            priority
                                        />
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                        <span className="text-4xl opacity-20">🏠</span>
                                    </div>
                                )}

                                {/* Navigation Arrows */}
                                {listing.images && listing.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveImageIndex(prev => prev === 0 ? listing.images!.length - 1 : prev - 1);
                                            }}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            ←
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveImageIndex(prev => (prev + 1) % listing.images!.length);
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            →
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {listing.images && listing.images.length > 0 && (
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                    {listing.images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImageIndex(i)}
                                            className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border cursor-pointer transition-all ${activeImageIndex === i ? 'border-primary ring-2 ring-primary/20 scale-95 opacity-100' : 'border-border/50 hover:border-primary opacity-70 hover:opacity-100'
                                                }`}
                                        >
                                            <Image
                                                src={img}
                                                alt={`View ${i + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="glass p-6 rounded-2xl relative overflow-hidden">
                            <h2 className="text-xl font-bold mb-4">Descripción</h2>
                            <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                                {listing.description || "Sin descripción detallada."}
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-border/50">
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Disponible</span>
                                    <span className="font-medium">{listing.available_from ? new Date(listing.available_from).toLocaleDateString() : 'Inmediata'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Amueblado</span>
                                    <span className="font-medium">{listing.furnished ? "Sí" : "No"}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Publicado</span>
                                    <span className="font-medium">{new Date(listing.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Map Section - Approximate Area */}
                        {listing.lat && listing.lng && (
                            <div className="glass p-6 rounded-2xl">
                                <h2 className="text-xl font-bold mb-4">Ubicación Aproximada</h2>
                                <div className="h-64 rounded-xl overflow-hidden border border-border">
                                    <LeafletMap
                                        listings={[listing]}
                                        center={[listing.lat, listing.lng]}
                                        zoom={14}
                                        showCircle={true}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-3 italic">
                                    * Por seguridad, solo mostramos el área aproximada de la propiedad. La dirección exacta se proporcionará tras contactar al anfitrión.
                                </p>
                            </div>
                        )}

                        {/* Amenities Section */}
                        <div className="glass p-6 rounded-2xl">
                            <AmenitiesDisplay amenities={listing.amenities} />
                        </div>

                        {/* Trust Section */}
                        {listing.verified_status === 'verified' && (
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 p-6 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
                                <div className="text-4xl">🛡️</div>
                                <div>
                                    <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300">¿Por qué confiar en este anuncio?</h3>
                                    <p className="text-sm text-blue-700/80 dark:text-blue-400/80 leading-relaxed">
                                        Esta propiedad ha pasado por nuestro proceso de verificación manual. Hemos comprobado la identidad del anfitrión y la existencia real del inmueble para garantizarte una búsqueda segura y sin fraudes.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* --- REVIEWS SECTION --- */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                Reseñas
                                {reviews.length > 0 && <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{reviews.length}</span>}
                            </h2>

                            {session && hasContacted && !isOwner && !userReview && (
                                <ReviewForm listingId={listing.id} onSuccess={() => window.location.reload()} />
                            )}

                            {!session && (
                                <div className="p-4 bg-muted/30 border border-dashed border-border rounded-xl text-center">
                                    <Link href="/login?redirect=/listing" className="text-primary hover:underline font-medium">Inicia sesión</Link> para dejar una reseña (requiere haber contactado antes).
                                </div>
                            )}

                            {reviews.length === 0 ? (
                                <p className="text-muted-foreground italic">Aún no hay reseñas para esta propiedad.</p>
                            ) : (
                                <div className="grid gap-4">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="glass p-5 rounded-xl border-l-4 border-l-primary/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold text-sm">{review.profiles?.full_name || "Usuario verificado"}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <StarRating rating={review.property_rating} readOnly size="sm" />
                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Propiedad</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p className="text-sm text-foreground/90 mt-2 italic">"{review.comment}"</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
                        {listing.verified_status !== 'archived' || isOwner ? (
                            <>
                                {listing.profiles?.whatsapp && !isOwner && (
                                    <WhatsAppButton
                                        phone={listing.profiles.whatsapp}
                                        listingTitle={listing.title}
                                    />
                                )}
                                <LeadForm listingId={listing.id} landlordId={listing.owner_id} />
                            </>
                        ) : (
                            <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-xl text-center text-red-600 dark:text-red-400 font-medium">
                                Esta propiedad está archivada y ya no recibe mensajes.
                            </div>
                        )}

                        <div className="glass p-5 rounded-xl text-sm space-y-3 border-l-4 border-l-yellow-400">
                            <h3 className="font-bold text-yellow-600 dark:text-yellow-500 flex items-center gap-2">
                                ⚠️ Consejos de Seguridad
                            </h3>
                            <ul className="space-y-2 text-muted-foreground list-disc pl-4">
                                <li>Nunca envíes dinero sin visitar la propiedad.</li>
                                <li>Verifica la identidad del propietario.</li>
                                <li>Usa el sistema de mensajes de la plataforma.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowReportModal(false)} />
                    <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
                        <h3 className="text-xl font-bold mb-2">Reportar Anuncio</h3>
                        <p className="text-sm text-muted-foreground mb-4">¿Por qué quieres reportar este anuncio? Tu reporte será revisado por el equipo de administración.</p>

                        <textarea
                            className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none mb-4"
                            rows={4}
                            placeholder="Ej. El anuncio es falso, la información no es correcta, etc."
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border border-border hover:bg-muted transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                disabled={reporting || !reportReason.trim()}
                                onClick={handleReport}
                                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {reporting ? "Enviando..." : "Enviar Reporte"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
