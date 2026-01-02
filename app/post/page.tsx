"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getUserId } from "@/lib/getUser";
import { useRouter } from "next/navigation";

export default function PostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [deposit, setDeposit] = useState<number>(0);
  const [type, setType] = useState<"room" | "apartment" | "house">("room");
  const [furnished, setFurnished] = useState(false);
  const [availableFrom, setAvailableFrom] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const userId = await getUserId();
    if (!userId) {
      setError("Debes iniciar sesión para publicar.");
      setLoading(false);
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("listings")
      .insert({
        owner_id: userId,
        title,
        description: description || null,
        price: Number(price),
        deposit: deposit ? Number(deposit) : null,
        type,
        furnished,
        available_from: availableFrom || null,
        city: city || null,
        area: area || null,
        verified_status: "none",
      })
      .select("id")
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push(`/listing/${data.id}`);
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Publicar renta</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Título"
          value={title} onChange={(e)=>setTitle(e.target.value)} required />

        <textarea className="border p-2 w-full" placeholder="Descripción (opcional)"
          value={description} onChange={(e)=>setDescription(e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <input className="border p-2 w-full" type="number" placeholder="Precio / mes"
            value={price} onChange={(e)=>setPrice(Number(e.target.value))} required />
          <input className="border p-2 w-full" type="number" placeholder="Depósito (opcional)"
            value={deposit} onChange={(e)=>setDeposit(Number(e.target.value))} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <select className="border p-2 w-full" value={type} onChange={(e)=>setType(e.target.value as any)}>
            <option value="room">Cuarto</option>
            <option value="apartment">Apartamento</option>
            <option value="house">Casa</option>
          </select>

          <label className="border p-2 w-full flex items-center gap-2">
            <input type="checkbox" checked={furnished} onChange={(e)=>setFurnished(e.target.checked)} />
            Amueblado
          </label>
        </div>

        <input className="border p-2 w-full" type="date"
          value={availableFrom} onChange={(e)=>setAvailableFrom(e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <input className="border p-2 w-full" placeholder="Ciudad"
            value={city} onChange={(e)=>setCity(e.target.value)} />
          <input className="border p-2 w-full" placeholder="Zona (ej. Summerlin)"
            value={area} onChange={(e)=>setArea(e.target.value)} />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button className="bg-black text-white p-2 rounded w-full" disabled={loading}>
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </form>
    </div>
  );
}
