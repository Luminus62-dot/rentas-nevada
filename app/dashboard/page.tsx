"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { Listing } from "@/lib/types";

type Lead = {
  id: string;
  listing_id: string;
  name: string | null;
  message: string;
  created_at: string;
};
type ServiceType = "verification" | "featured" | "posted_by_us";


export default function DashboardPage() {
  const router = useRouter();
  const [items, setItems] = useState<Listing[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        router.push("/login");
        return;
      }

      // Mis anuncios
      const { data: listingsData } = await supabase
        .from("listings")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      const listings = (listingsData ?? []) as Listing[];
      setItems(listings);

      // Leads recibidos (por RLS solo te deja ver los tuyos)
      const { data: leadsData } = await supabase
        .from("leads")
        .select("id, listing_id, name, message, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      setLeads((leadsData ?? []) as Lead[]);
      setLoading(false);
    }

    load();
  }, [router]);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) return <p>Cargando...</p>;

  // helper: titulo del anuncio por id
  const titleById = new Map(items.map((x) => [x.id, x.title]));

  async function requestService(listingId: string, serviceType: string) {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    await supabase.from("service_requests").insert({
      listing_id: listingId,
      owner_id: user.id,
      service_type: serviceType,
      status: "new",
    });

    alert("✅ Solicitud enviada.");
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button onClick={logout} className="border p-2 rounded">
          Cerrar sesión
        </button>
      </div>

      <section className="mt-6">
        <h2 className="text-xl font-bold">Mis anuncios</h2>
        <div className="mt-3 grid gap-3">
          {items.map((x) => (
  <div key={x.id} className="border rounded p-3">
    <Link href={`/listing/${x.id}`} className="block">
      <b>{x.title}</b> — ${x.price}/mes
      <div className="text-sm mt-1">
        {x.verified_status === "verified" ? "✅ Verificado" : "⏳ No verificado"}
      </div>
    </Link>

    {/* BOTONES DE SERVICIOS */}
    <div className="mt-3 flex flex-wrap gap-2">
      <button
        className="border px-3 py-1 rounded text-sm"
        onClick={() => requestService(x.id, "verification")}
      >
        Solicitar verificación
      </button>

      <button
        className="border px-3 py-1 rounded text-sm"
        onClick={() => requestService(x.id, "featured")}
      >
        Solicitar destacado
      </button>

      <button
        className="border px-3 py-1 rounded text-sm"
        onClick={() => requestService(x.id, "posted_by_us")}
      >
        Publicación por nosotros
      </button>
    </div>
  </div>
))}

          {items.length === 0 && (
            <p>
              No tienes anuncios aún.{" "}
              <Link className="underline" href="/post">
                Publica uno
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Mensajes recibidos</h2>
        <div className="mt-3 grid gap-3">
          {leads.map((l) => (
            <div key={l.id} className="border rounded p-3">
              <div className="text-sm text-gray-600">
                Anuncio:{" "}
                <Link className="underline" href={`/listing/${l.listing_id}`}>
                  {titleById.get(l.listing_id) ?? l.listing_id}
                </Link>
              </div>
              <div className="mt-2">
                <b>{l.name ?? "Interesado"}</b>
              </div>
              <div className="mt-1 whitespace-pre-wrap">{l.message}</div>
              <div className="mt-2 text-xs text-gray-500">
                {new Date(l.created_at).toLocaleString()}
              </div>
            </div>
          ))}
          {leads.length === 0 && <p>No has recibido mensajes todavía.</p>}
        </div>
        
      </section>
    </div>
  );
}