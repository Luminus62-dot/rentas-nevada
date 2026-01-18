"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Listing } from "@/lib/types";

// Fix Leaflet Default Icon Issue in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
    listings?: Listing[];
    center?: [number, number];
    zoom?: number;
    showCircle?: boolean; // If true, show approximate circle instead of marker
    isPicker?: boolean;   // If true, allow user to click and pick location
    onLocationSelect?: (lat: number, lng: number) => void;
}

// Helper to update map center when props change
function MapController({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

// Click listener for location pickers
function LocationPicker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function LeafletMap({
    listings = [],
    center = [36.1699, -115.1398],
    zoom = 12,
    showCircle = false,
    isPicker = false,
    onLocationSelect
}: MapProps) {
    // Las Vegas Coordinates Default
    const vegasDefault: [number, number] = [36.1699, -115.1398];

    // Create custom icon with price
    const createPriceIcon = (price: number) => {
        return L.divIcon({
            className: "bg-transparent",
            html: `<div class="bg-primary text-primary-foreground font-bold px-2 py-1 rounded shadow-md text-xs border border-white whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform">$${price}</div>`,
            iconSize: [40, 20],
            iconAnchor: [20, 10],
        });
    };

    return (
        <div className="h-full w-full rounded-xl overflow-hidden border border-border shadow-lg relative z-0">
            <MapContainer center={center || vegasDefault} zoom={zoom} scrollWheelZoom={true} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {center && <MapController center={center} />}

                {isPicker && onLocationSelect && (
                    <LocationPicker onSelect={onLocationSelect} />
                )}

                {listings.map((l) => {
                    const lat = l.lat;
                    const lng = l.lng;

                    if (!lat || !lng) return null;

                    if (showCircle) {
                        return (
                            <Circle
                                key={l.id}
                                center={[lat, lng]}
                                radius={250} // 250 meters approx
                                pathOptions={{
                                    fillColor: "var(--primary)",
                                    color: "var(--primary)",
                                    weight: 1,
                                    fillOpacity: 0.2
                                }}
                            >
                                <Popup>
                                    <div className="min-w-[200px] p-1">
                                        <div className="font-bold text-sm mb-1">{l.title}</div>
                                        <div className="text-xs text-muted-foreground mb-2">
                                            {l.neighborhood || l.city}
                                        </div>
                                        <div className="aspect-video relative bg-muted rounded mb-2 overflow-hidden">
                                            {l.images?.[0] ? (
                                                <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xl">🏠</div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center pt-1">
                                            <span className="font-bold text-primary">${l.price}</span>
                                            <Link
                                                href={`/listing/${l.id}`}
                                                className="text-xs font-medium text-primary hover:underline"
                                            >
                                                Ver Detalles →
                                            </Link>
                                        </div>
                                    </div>
                                </Popup>
                            </Circle>
                        )
                    }

                    return (
                        <Marker key={l.id} position={[lat, lng]} icon={createPriceIcon(l.price)}>
                            <Popup>
                                <div className="min-w-[200px] p-1">
                                    <div className="font-bold text-sm mb-1">{l.title}</div>
                                    <div className="text-xs text-muted-foreground mb-2">
                                        {l.neighborhood || l.city}
                                    </div>
                                    <div className="aspect-video relative bg-muted rounded mb-2 overflow-hidden">
                                        {l.images?.[0] ? (
                                            <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl">🏠</div>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="font-bold text-primary">${l.price}</span>
                                        <Link
                                            href={`/listing/${l.id}`}
                                            className="text-xs font-medium text-primary hover:underline"
                                        >
                                            Ver Detalles →
                                        </Link>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}

                {/* Single Marker for Picker Mode */}
                {isPicker && center && (
                    <Marker position={center} />
                )}
            </MapContainer>
        </div>
    );
}
