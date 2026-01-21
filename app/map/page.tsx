"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Listing } from "@/lib/types"; // Make sure lat/lng are optional in types if used
import { InteractiveBackground } from "@/components/InteractiveBackground";
import { useI18n } from "@/lib/i18n";

// Dynamically import Map to avoid SSR issues with Leaflet
function MapLoadingFallback() {
    const { t } = useI18n();
    return <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center text-muted-foreground">{t("map.loading")}</div>;
}

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
    ssr: false,
    loading: () => <MapLoadingFallback />
});

export default function MapSearchPage() {
    const router = useRouter();
    const { t } = useI18n();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>("all");
    const [maxPrice, setMaxPrice] = useState<number>(5000);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadListings() {
            setLoading(true);
            setError(null);
            let query = supabase.from("listings").select("*").neq("verified_status", "archived");

            if (filterType !== 'all') {
                query = query.eq('type', filterType);
            }

            query = query.lte('price', maxPrice);

            const { data, error } = await query;
            if (error) {
                setError(error.message);
                setListings([]);
            } else if (data) {
                setListings(data as Listing[]);
            }
            setLoading(false);
        }
        loadListings();
    }, [filterType, maxPrice]);

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-dots-pattern">
            <InteractiveBackground />

            {/* Filters Bar */}
            <div className="bg-background/80 backdrop-blur-md border-b border-border p-4 z-10 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        {t("map.title")}
                    </h1>
                    <div className="h-6 w-px bg-border hidden md:block"></div>

                    {/* Type Filter */}
                    <select
                        className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">{t("map.allProperties")}</option>
                        <option value="room">{t("map.rooms")}</option>
                        <option value="apartment">{t("map.apartments")}</option>
                        <option value="house">{t("map.houses")}</option>
                    </select>

                    {/* Price Filter */}
                    <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5">
                        <span className="text-sm text-muted-foreground">{t("map.maxPrice")}</span>
                        <input
                            type="range"
                            min="500"
                            max="10000"
                            step="100"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            className="w-32 accent-primary"
                        />
                        <span className="text-sm font-bold min-w-[60px]">${maxPrice}</span>
                    </div>
                </div>

                <div className="text-sm text-muted-foreground">
                    {listings.length} {t("map.results")}
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
                <div className="absolute inset-0">
                    {error ? (
                        <div className="h-full w-full flex flex-col items-center justify-center bg-background/60 text-center p-6">
                            <p className="text-sm text-red-600 font-medium">{t("map.errorTitle")}</p>
                            <p className="text-xs text-muted-foreground mt-2">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                            >
                                {t("map.retry")}
                            </button>
                        </div>
                    ) : (
                        <LeafletMap listings={listings} showCircle={true} />
                    )}
                </div>

                {/* Floating List Toggle (Mobile/Desktop split view could land here) */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
                    <button
                        onClick={() => router.push("/search")}
                        className="bg-foreground text-background px-6 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
                    >
                        <span>📋</span> {t("map.viewListings")}
                    </button>
                </div>
            </div>
        </div>
    );
}
