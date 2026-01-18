"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { validateRequired, validateMinLength, validateMaxLength } from "@/lib/validation";
import { getErrorMessage } from "@/lib/errorHandler";
import { Card } from "@/components/Card";

export default function LeadForm({ listingId, landlordId }: { listingId: string, landlordId: string }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setOk(null);
    setError(null);
    setMessageError(null);
    setNameError(null);

    // Validar campos
    const messageValidation =
      validateRequired(message, "El mensaje") ||
      validateMinLength(message, 10, "El mensaje") ||
      validateMaxLength(message, 1000, "El mensaje");

    if (messageValidation) { setMessageError(messageValidation); return; }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id ?? null;
      setIsLoggedIn(!!userId);

      // 1. Insert into old leads table (for notifications/legacy)
      const { error: insertError } = await supabase.from("leads").insert({
        listing_id: listingId,
        from_user_id: userId,
        name: name || user?.user_metadata?.full_name || "Interesado",
        message,
      });

      // 2. If logged in, also start a Conversation
      if (userId && landlordId && userId !== landlordId) {
        // Find or Create Conversation
        const { data: conv, error: convErr } = await supabase
          .from("conversations")
          .select("id")
          .eq("listing_id", listingId)
          .eq("tenant_id", userId)
          .single();

        let conversationId = conv?.id;

        if (!conversationId) {
          const { data: newConv, error: createErr } = await supabase
            .from("conversations")
            .insert({ listing_id: listingId, tenant_id: userId, landlord_id: landlordId })
            .select("id")
            .single();

          if (!createErr) conversationId = newConv.id;
        }

        if (conversationId) {
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            sender_id: userId,
            content: message
          });
        }
      }

      if (insertError) {
        setError(getErrorMessage(insertError));
      } else {
        setName("");
        setMessage("");
        setOk("✅ Mensaje enviado con éxito.");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (err: string | null) =>
    `w-full px-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${err ? "border-red-500" : "border-border"}`;

  return (
    <Card className="mt-8 border-none shadow-xl bg-card/80 backdrop-blur-sm">
      <div className="p-6">
        <h2 className="font-bold text-xl mb-1">Contactar al Anunciante</h2>
        <p className="text-sm text-muted-foreground mb-6">Envía un mensaje directo para obtener más información.</p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <input
              className={inputClass(nameError)}
              type="text"
              placeholder="Tu nombre (opcional)"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(null);
              }}
            />
            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
          </div>

          <div>
            <textarea
              className={inputClass(messageError)}
              placeholder="Hola, me interesa tu propiedad. ¿Sigue disponible?"
              value={message}
              rows={4}
              onChange={(e) => {
                setMessage(e.target.value);
                if (messageError) setMessageError(null);
              }}
            />
            <div className="flex justify-between mt-1">
              {messageError && <p className="text-red-500 text-xs">{messageError}</p>}
              <p className="text-xs text-muted-foreground ml-auto">{message.length}/1000</p>
            </div>
          </div>

          {error && <p className="bg-red-50 text-red-600 p-3 rounded-md text-sm my-2">{error}</p>}
          {ok && (
            <div className="bg-green-50 border border-green-100 p-4 rounded-xl my-4 animate-in fade-in zoom-in duration-300">
              <p className="text-green-700 text-sm font-medium">{ok}</p>
              {isLoggedIn && (
                <Link href="/dashboard" className="mt-2 text-xs text-green-800 font-bold hover:underline inline-block">
                  Ir a Mis Mensajes 💬
                </Link>
              )}
            </div>
          )}

          <button
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition-all shadow-md active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar mensaje"}
          </button>
        </form>
      </div>
    </Card>
  );
}
