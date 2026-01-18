"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import { Listing } from "@/lib/types"; // Make sure lat/lng are optional in types if used
import { InteractiveBackground } from "@/components/InteractiveBackground";

// Dynamically import Map to avoid SSR issues with Leaflet
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center text-muted-foreground">Cargando Mapa...</div>
});

export default function MapSearchPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>("all");
    const [maxPrice, setMaxPrice] = useState<number>(5000);

    useEffect(() => {
        async function loadListings() {
            setLoading(true);
            let query = supabase.from("listings").select("*").neq("verified_status", "archived");

            if (filterType !== 'all') {
                query = query.eq('type', filterType);
            }

            query = query.lte('price', maxPrice);

            const { data, error } = await query;
            if (!error && data) {
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
                        Mapa Interactivo
                    </h1>
                    <div className="h-6 w-px bg-border hidden md:block"></div>

                    {/* Type Filter */}
                    <select
                        className="bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">Todas las Propiedades</option>
                        <option value="room">Habitaciones</option>
                        <option value="apartment">Apartamentos</option>
                        <option value="house">Casas</option>
                    </select>

                    {/* Price Filter */}
                    <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-1.5">
                        <span className="text-sm text-muted-foreground">Max Precio:</span>
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
                    {listings.length} resultados encontrados
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
                <div className="absolute inset-0">
                    <LeafletMap listings={listings} showCircle={true} />
                </div>

                {/* Floating List Toggle (Mobile/Desktop split view could land here) */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
                    <button className="bg-foreground text-background px-6 py-3 rounded-full font-bold shadow-xl hover:scale-105 transition-transform flex items-center gap-2">
                        <span>📋</span> Ver Lista
                    </button>
                </div>
            </div>
        </div>
    );
}
