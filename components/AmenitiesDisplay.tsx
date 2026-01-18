"use client";

import React, { useState } from "react";
import { AMENITIES_LIST } from "@/lib/amenitiesData";
import { Badge } from "@/components/Badge";

type AmenitiesDisplayProps = {
    amenities: Record<string, boolean> | null;
};

export function AmenitiesDisplay({ amenities }: AmenitiesDisplayProps) {
    const [showAll, setShowAll] = useState(false);

    if (!amenities) return null;

    const activeAmenities = AMENITIES_LIST.filter((item) => amenities[item.id]);

    if (activeAmenities.length === 0) return null;

    const displayedAmenities = showAll ? activeAmenities : activeAmenities.slice(0, 8);
    const remainingCount = activeAmenities.length - 8;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
                🏡 Amenidades
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {displayedAmenities.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors"
                    >
                        <span className="text-base" role="img" aria-label={item.label}>
                            {item.icon}
                        </span>
                        <span className="text-[12px] font-medium text-foreground/70 leading-tight truncate">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>

            {activeAmenities.length > 8 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-background border border-border rounded-lg text-sm font-bold hover:bg-muted transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    {showAll ? (
                        <>
                            <span>Ver menos</span>
                            <span>↑</span>
                        </>
                    ) : (
                        <>
                            <span>Ver todas las amenidades ({activeAmenities.length})</span>
                            <span>↓</span>
                        </>
                    )}
                </button>
            )}

            {/* Quick Badges for main ones if requested, but above is already cards */}
        </div>
    );
}
