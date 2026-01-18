"use client";

// Direct Contact via WhatsApp

export function WhatsAppButton({ phone, listingTitle }: { phone: string, listingTitle?: string }) {
    if (!phone) return null;

    const formattedPhone = phone.replace(/\D/g, ""); // Remove non-digits
    const message = encodeURIComponent(`Hola! Vi tu anuncio "${listingTitle || 'en Rentas Nevada'}" y me interesa.`);
    const wpUrl = `https://wa.me/${formattedPhone}?text=${message}`;

    return (
        <a
            href={wpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-bold py-3 rounded-xl hover:bg-[#128C7E] transition-all shadow-lg hover:shadow-green-500/20 active:scale-95 mb-4"
        >
            <span className="text-xl">💬</span> Contactar por WhatsApp
        </a>
    );
}
