"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { Listing } from "@/lib/types";
import { getErrorMessage } from "@/lib/errorHandler";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { useToast } from "@/components/ToastContext";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const { showToast } = useToast();

  // Filters
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [type, setType] = useState<string>(searchParams.get("type") || "all");
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get("maxPrice") || "");
  const [petFriendly, setPetFriendly] = useState(false);
  const [parking, setParking] = useState(false);
  const [washerDryer, setWasherDryer] = useState(false);
  const [internet, setInternet] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      let query = supabase
        .from("listings")
        .select("*")
        .neq("verified_status", "archived");

      if (city) query = query.ilike("city", `%${city}%`);
      if (type !== "all") query = query.eq("type", type);
      if (maxPrice) query = query.lte("price", Number(maxPrice));

      if (petFriendly) query = query.contains("amenities", { pet_friendly: true });
      if (parking) query = query.contains("amenities", { estacionamiento_incluido: true });
      if (washerDryer) query = query.contains("amenities", { lavadora_secadora_unidad: true });
      if (internet) query = query.contains("amenities", { internet_incluido: true });

      const { data, error: fetchError } = await query
        .order("created_at", { ascending: false })
        .limit(50);

      if (fetchError) {
        setError(getErrorMessage(fetchError));
        return;
      }

      setItems(data as Listing[] || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      load();
    }, 300);
    return () => clearTimeout(timer);
  }, [city, type, maxPrice, petFriendly, parking, washerDryer, internet]);

  async function saveAlert() {
    if (!session) {
      showToast("Inicia sesión para guardar esta búsqueda.", "error");
      return;
    }

    const { error } = await supabase.from("search_alerts").insert({
      user_id: session.user.id,
      criteria: { city, type, maxPrice }
    });

    if (error) {
      showToast("Error al guardar alerta", "error");
    } else {
      showToast("¡Alerta guardada! Te notificaremos de nuevos anuncios.", "success");
    }
  }

  if (loading) {
    return (
      <div className="container-custom py-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-muted rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-10 flex justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-lg text-center max-w-md">
          <p className="font-bold text-red-700 dark:text-red-400">Error al cargar anuncios</p>
          <p className="text-sm mt-2 text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 rounded hover:bg-red-200 transition-colors text-sm font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8 space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Explora Propiedades</h1>
          <p className="text-muted-foreground">Encuentra tu próximo hogar en Las Vegas y alrededores.</p>
        </div>

        {/* Filters Bar */}
        <div className="bg-card/50 p-4 rounded-xl border border-border flex flex-wrap gap-4 items-end justify-center backdrop-blur-sm">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-muted-foreground ml-1">CIUDAD</span>
            <input
              type="text"
              placeholder="Ej: Las Vegas"
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm w-40 focus:ring-2 focus:ring-primary/20 outline-none"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-muted-foreground ml-1">TIPO</span>
            <select
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm w-40 focus:ring-2 focus:ring-primary/20 outline-none"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="room">Habitación</option>
              <option value="apartment">Apartamento</option>
              <option value="house">Casa</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-muted-foreground ml-1">PRECIO MAX</span>
            <input
              type="number"
              placeholder="Ej: 2000"
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm w-32 focus:ring-2 focus:ring-primary/20 outline-none"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>

          <button
            onClick={saveAlert}
            className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 border border-primary/20"
          >
            🔔 Guardar Búsqueda
          </button>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setPetFriendly(!petFriendly)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${petFriendly ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
          >
            🐾 Pet-friendly
          </button>
          <button
            onClick={() => setParking(!parking)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${parking ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
          >
            🚗 Estacionamiento
          </button>
          <button
            onClick={() => setWasherDryer(!washerDryer)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${washerDryer ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
          >
            🧺 Lavadora/Secadora
          </button>
          <button
            onClick={() => setInternet(!internet)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${internet ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
          >
            🌐 Internet Incluido
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link key={item.id} href={`/listing/${item.id}`} className="group">
            <Card className="h-full hover:shadow-lg transition-all duration-300 border-transparent hover:border-primary/20 bg-card overflow-hidden flex flex-col">

              {/* Image Display */}
              <div className="h-48 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground/30 font-medium text-4xl select-none">
                    🏠
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">{item.title}</h2>
                  <Badge variant={item.verified_status === "verified" ? "success" : "default"} className="ml-2 shrink-0">
                    {item.verified_status === "verified" ? "Verificado" : "N/Verificado"}
                  </Badge>
                </div>

                <div className="text-2xl font-bold mb-1 text-primary">
                  ${item.price} <span className="text-sm font-normal text-muted-foreground">/ mes</span>
                </div>

                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <span className="truncate">{(item.city ?? "Las Vegas")} {(item.area ? `• ${item.area}` : "")}</span>
                </div>

                <div className="mt-auto flex gap-2 pt-4 border-t border-border/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  <span>{item.type === 'room' ? 'Habitación' : item.type === 'apartment' ? 'Apartamento' : 'Casa'}</span>
                  {item.furnished && (
                    <>
                      <span>•</span>
                      <span>Amueblado</span>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {items.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-xl text-muted-foreground">No hay anuncios disponibles en este momento.</p>
            <Link href="/post" className="text-primary hover:underline mt-2 inline-block">¡Sé el primero en publicar!</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-primary">Cargando búsqueda...</div></div>}>
      <SearchPageContent />
    </Suspense>
  );
}
