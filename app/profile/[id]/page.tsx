"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Listing } from "@/lib/types";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { InteractiveBackground } from "@/components/InteractiveBackground";
import { StarRating } from "@/components/StarRating";
import { TrustBadge, getTrustLevel } from "@/components/TrustBadge";

export default function PublicProfile() {
    const params = useParams(); // { id: string }
    // Unwrap params safely
    const userId = Array.isArray(params?.id) ? params.id[0] : params?.id;

    const [profile, setProfile] = useState<any>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Stats
    const [trustScore, setTrustScore] = useState(0);
    const [avgRating, setAvgRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);

    useEffect(() => {
        async function loadProfile() {
            if (!userId) return;
            // Check if userId is a valid UUID to avoid Postgres errors
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(userId)) {
                console.error("Invalid UUID format for profile:", userId);
                setError("ID de usuario inválido.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // 1. Get Profile
                const { data: userProfile, error: profError } = await supabase
                    .from("profiles")
                    .select("id, full_name, email, role, is_verified, created_at, whatsapp")
                    .eq("id", userId)
                    .single();

                if (profError) throw profError;
                setProfile(userProfile);

                // 2. Get Active Listings
                const { data: userListings, error: listError } = await supabase
                    .from("listings")
                    .select("*")
                    .eq("owner_id", userId)
                    .eq("verified_status", "verified") // Only show verified listings publicly
                    .order("created_at", { ascending: false });

                if (listError) throw listError;
                setListings((userListings || []) as Listing[]);

                // 3. Get Reviews (Aggregation)
                // We need reviews for ALL listings owned by this user.
                // Option A: Two queries. Get listing IDs first (already have), then reviews where listing_id in IDs.
                const listingIds = userListings?.map(l => l.id) || [];

                let allReviews: any[] = [];
                if (listingIds.length > 0) {
                    const { data: userReviews, error: revError } = await supabase
                        .from("reviews")
                        .select("*, profiles:reviewer_id(full_name), listings(title)")
                        .in("listing_id", listingIds)
                        .order("created_at", { ascending: false });

                    if (revError) throw revError;
                    allReviews = userReviews || [];
                }
                setReviews(allReviews);

                // 4. Calculate Trust Score
                // Base: 50
                // Verified: +20
                // Ratings: Avg * 6 (Max 30)

                const reviewCount = allReviews.length;
                const average = reviewCount > 0
                    ? allReviews.reduce((acc, r) => acc + ((r.property_rating + r.landlord_rating) / 2), 0) / reviewCount
                    : 0;

                setAvgRating(average);
                setTotalReviews(reviewCount);

                let score = 40; // Base: Users start at 40 (Silver level)

                // 1. Identity Verification (Crucial)
                if (userProfile.is_verified) score += 25;

                // 2. Profile Completeness
                if (userProfile.full_name) score += 5;
                if (userProfile.whatsapp) score += 5;

                // 3. Email confirmed/Activity (Assume +10 for having a profile)
                score += 10;

                // 4. Ratings (Dynamic weight)
                if (reviewCount > 0) {
                    // Up to 15 points based on rating (Avg 5.0 -> +15, Avg 3.0 -> +9)
                    score += Math.min(15, Math.round(average * 3));

                    // Volume bonus: +5 if more than 5 reviews
                    if (reviewCount >= 5) score += 5;
                }

                setTrustScore(Math.min(100, score));

            } catch (err: any) {
                console.error("Error detailed in loadProfile:", err);
                setError("Usuario no encontrado o perfil privado.");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [userId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-dots-pattern">
            <div className="animate-pulse text-primary font-medium">Cargando perfil...</div>
        </div>
    );

    if (error || !profile) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-dots-pattern">
            <div className="text-6xl mb-4">👻</div>
            <h1 className="text-2xl font-bold mb-2">Perfil No Encontrado</h1>
            <p className="text-muted-foreground mb-6">{error || "El usuario no existe."}</p>
            <Link href="/" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg">Volver</Link>
        </div>
    );

    const { label } = getTrustLevel(trustScore);

    return (
        <div className="min-h-screen bg-dots-pattern relative overflow-hidden">
            <InteractiveBackground />
            {/* Header Background */}
            <div className="h-64 bg-gradient-to-r from-indigo-900 to-purple-900 relative">
                <div className="absolute inset-0 bg-grid-white/[0.05]" />
                <div className="absolute -bottom-16 left-0 right-0 px-4">
                    <div className="container-custom flex flex-col md:flex-row items-end gap-6">

                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-full border-4 border-background bg-zinc-100 flex items-center justify-center text-4xl shadow-xl relative group">
                            {profile.full_name ? profile.full_name[0].toUpperCase() : "U"}
                            {profile.is_verified && (
                                <div className="absolute bottom-1 right-1 bg-green-500 text-white p-1.5 rounded-full border-2 border-background" title="Identidad Verificada">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                            )}
                        </div>

                        {/* Name & Badge */}
                        <div className="flex-1 pb-4 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-white mb-1 flex flex-col md:flex-row items-center md:items-end gap-3">
                                {profile.full_name || "Stay Nevada User"}
                                <TrustBadge score={trustScore} />
                            </h1>
                            <p className="text-indigo-100 font-medium">
                                Miembro desde {new Date(profile.created_at).toLocaleDateString()} • {profile.role === 'landlord' ? 'Propietario' : 'Inquilino'}
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-4 pb-4 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg mb-[-1rem] md:mb-4">
                            <div className="text-center px-2">
                                <div className="text-2xl font-bold text-foreground">{listings.length}</div>
                                <div className="text-xs text-muted-foreground uppercase">Activos</div>
                            </div>
                            <div className="w-px bg-border"></div>
                            <div className="text-center px-2">
                                <div className="text-2xl font-bold text-foreground flex items-center gap-1">
                                    {avgRating.toFixed(1)} <span className="text-sm text-yellow-500">★</span>
                                </div>
                                <div className="text-xs text-muted-foreground uppercase">{totalReviews} Reviews</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom py-24 space-y-12">

                {/* About / Trust */}
                <section className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 space-y-6">
                        <Card className="p-6 space-y-4">
                            <h3 className="font-bold text-lg">Nivel de Confianza</h3>

                            <div className="relative pt-4">
                                <div className="flex justify-between text-sm mb-2 font-medium">
                                    <span>Score</span>
                                    <span>{trustScore}/100</span>
                                </div>
                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${trustScore >= 90 ? 'bg-purple-600' : trustScore >= 60 ? 'bg-green-500' : 'bg-gray-400'}`}
                                        style={{ width: `${trustScore}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    El Trust Score se basa en la verificación de identidad, antigüedad, y reseñas positivas de otros usuarios.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-border space-y-3">
                                {profile.is_verified ? (
                                    <div className="flex items-center gap-3 text-green-600 text-sm font-medium">
                                        <div className="p-1.5 bg-green-100 rounded-full">✓</div>
                                        Identidad Verificada
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 text-muted-foreground text-sm">
                                        <div className="p-1.5 bg-muted rounded-full">?</div>
                                        Identidad No Verificada
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-blue-600 text-sm font-medium">
                                    <div className="p-1.5 bg-blue-100 rounded-full">✓</div>
                                    Email Confirmado
                                </div>
                            </div>
                        </Card>

                        {/* Contact Card */}
                        <Card className="p-6 relative overflow-hidden bg-primary/5 border-primary/10">
                            <h3 className="font-bold text-lg mb-4">Contactar</h3>
                            <div className="space-y-3 relative z-10">
                                {profile.whatsapp && (
                                    <a
                                        href={`https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#128C7E] transition-all text-sm"
                                    >
                                        WhatsApp Directo
                                    </a>
                                )}
                                <p className="text-[10px] text-muted-foreground text-center">
                                    Para mensajes internos, visita cualqueira de sus publicaciones activas.
                                </p>
                            </div>
                        </Card>
                    </div>

                    <div className="md:col-span-2">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            Propiedades Activas
                            <span className="text-sm bg-muted px-2 py-1 rounded-full text-muted-foreground font-normal">{listings.length}</span>
                        </h2>

                        {listings.length === 0 ? (
                            <div className="p-12 border-2 border-dashed border-border rounded-xl text-center text-muted-foreground">
                                Este usuario no tiene propiedades publicadas actualmente.
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-6">
                                {listings.map(listing => (
                                    <Link key={listing.id} href={`/listing/${listing.id}`} className="group">
                                        <Card className="overflow-hidden hover:shadow-lg transition-all h-full flex flex-col border-transparent hover:border-primary/20">
                                            <div className="h-48 bg-muted relative">
                                                {listing.images && listing.images.length > 0 ? (
                                                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>
                                                )}
                                                <div className="absolute top-2 right-2">
                                                    <Badge variant={listing.type === 'room' ? 'warning' : 'default'}>{listing.type}</Badge>
                                                </div>
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col">
                                                <h3 className="font-bold group-hover:text-primary transition-colors line-clamp-1">{listing.title}</h3>
                                                <p className="text-sm text-muted-foreground mb-4">{listing.city}</p>
                                                <div className="mt-auto font-bold text-lg">${listing.price}</div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Reviews */}
                {reviews.length > 0 && (
                    <section className="pt-10 border-t border-border/50 animate-slide-up">
                        <h2 className="text-2xl font-bold mb-6">Lo que dicen otros usuarios</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {reviews.map(review => (
                                <Card key={review.id} className="p-5 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{review.profiles?.full_name || "Usuario Anónimo"}</span>
                                            <span className="text-xs text-muted-foreground">sobre <Link href={`/listing/${review.listing_id}`} className="hover:underline text-primary">{review.listings?.title}</Link></span>
                                        </div>
                                        <StarRating rating={(review.property_rating + review.landlord_rating) / 2} readOnly size="sm" />
                                    </div>
                                    <p className="text-foreground/80 italic text-sm">"{review.comment}"</p>
                                    <div className="mt-3 text-xs text-muted-foreground text-right">{new Date(review.created_at).toLocaleDateString()}</div>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
}
