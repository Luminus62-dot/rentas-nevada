"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { Listing } from "@/lib/types";

export default function SearchPage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) setItems(data as Listing[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <Link key={item.id} href={`/listing/${item.id}`} className="border rounded p-4">
          <h2 className="font-bold">{item.title}</h2>
          <p className="mt-1">${item.price} / mes</p>
          <p className="text-sm text-gray-600">
            {(item.city ?? "")} {(item.area ? `• ${item.area}` : "")}
          </p>
          <p className="text-sm mt-2">
            {item.verified_status === "verified" ? "✅ Verificado" : "⏳ No verificado"}
          </p>
        </Link>
      ))}
      {items.length === 0 && <p>No hay anuncios todavía.</p>}
    </div>
  );
}
