"use client";

import React from "react";
import { AMENITY_CATEGORIES, AMENITIES_LIST } from "@/lib/amenitiesData";

type AmenitiesSelectorProps = {
    selectedAmenities: Record<string, boolean>;
    onChange: (amenities: Record<string, boolean>) => void;
};

export function AmenitiesSelector({ selectedAmenities, onChange }: AmenitiesSelectorProps) {
    const toggleAmenity = (id: string) => {
        onChange({
            ...selectedAmenities,
            [id]: !selectedAmenities[id],
        });
    };

    return (
        <div className="space-y-8">
            <div className="border-b border-border/50 pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    ✨ Amenities & Services
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Select every feature your property offers to help tenants find you.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {AMENITY_CATEGORIES.map((category) => (
                    <div key={category.id} className="space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary/70 flex items-center gap-2">
                            <span className="text-base">{category.icon}</span>
                            {category.label}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {AMENITIES_LIST.filter((item) => item.categoryId === category.id).map((item) => (
                                <label
                                    key={item.id}
                                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md border cursor-pointer transition-all hover:bg-muted/50 ${selectedAmenities[item.id]
                                        ? "border-primary/40 bg-primary/5 shadow-sm"
                                        : "border-transparent bg-transparent hover:border-border/30"
                                        }`}
                                >
                                    <div className="relative flex items-center justify-center shrink-0">
                                        <input
                                            type="checkbox"
                                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-border bg-background transition-all checked:border-primary checked:bg-primary"
                                            checked={!!selectedAmenities[item.id]}
                                            onChange={() => toggleAmenity(item.id)}
                                        />
                                        <svg
                                            className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                        <span className="text-sm shrink-0">{item.icon}</span>
                                        <span className={`text-[13px] font-medium truncate ${selectedAmenities[item.id] ? "text-foreground" : "text-muted-foreground"
                                            }`}>
                                            {item.label}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
