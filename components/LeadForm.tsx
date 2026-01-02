"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LeadForm({ listingId }: { listingId: string }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOk(null);
    setError(null);

    // si está logueado, guardamos from_user_id; si no, queda null
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id ?? null;

    const { error } = await supabase.from("leads").insert({
      listing_id: listingId,
      from_user_id: userId,
      name: name || null,
      message,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setName("");
    setMessage("");
    setOk("✅ Mensaje enviado. Pronto te contactarán.");
  }

  return (
    <div className="border rounded p-4 mt-6">
      <h2 className="font-bold text-lg mb-2">Contactar</h2>

      <form onSubmit={submit} className="space-y-3">
        <input
          className="border p-2 w-full rounded"
          placeholder="Tu nombre (opcional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="border p-2 w-full rounded"
          placeholder="Escribe tu mensaje… (Ej: ¿Sigue disponible? ¿Requisitos? ¿Se puede ver hoy?)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {ok && <p className="text-green-700 text-sm">{ok}</p>}

        <button
          className="bg-black text-white p-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar mensaje"}
        </button>
      </form>
    </div>
  );
}
