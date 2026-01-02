"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (userId) {
      await supabase.from("profiles").insert({
        id: userId,
        full_name: fullName,
        role: "landlord",
      });
    }

    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold mb-4">Crear cuenta</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Nombre"
          value={fullName} onChange={(e)=>setFullName(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Email"
          value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Password" type="password"
          value={password} onChange={(e)=>setPassword(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="bg-black text-white p-2 rounded w-full" disabled={loading}>
          {loading ? "Creando..." : "Registrarme"}
        </button>
      </form>
    </div>
  );
}
