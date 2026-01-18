"use client";

import { InteractiveBackground } from "@/components/InteractiveBackground";

export default function FAQPage() {
    const faqs = [
        {
            question: "¿Cómo puedo publicar una propiedad?",
            answer: "Para publicar, debes crear una cuenta e ir a la sección 'Publicar Propiedad'. Completa los datos y tu anuncio estará listo.",
        },
        {
            question: "¿Qué es la verificación de propiedad?",
            answer: "La verificación asegura que la propiedad existe y que el anunciante es legítimo. Esto aumenta la confianza de los inquilinos y destaca tu anuncio.",
        },
        {
            question: "¿Mis datos están protegidos?",
            answer: "Sí, solo compartimos la información necesaria para el contacto inicial. Tu dirección exacta nunca se muestra al público general.",
        },
        {
            question: "¿Cómo contacto a un anfitrión?",
            answer: "Puedes enviar un mensaje directo a través de la plataforma o usar el botón de WhatsApp si está disponible en el anuncio.",
        },
    ];

    return (
        <div className="min-h-screen bg-dots-pattern relative overflow-hidden py-20">
            <InteractiveBackground />
            <div className="container-custom relative z-10 max-w-3xl">
                <h1 className="text-4xl font-bold mb-8 text-center text-foreground">Preguntas Frecuentes</h1>
                <div className="space-y-6">
                    {faqs.map((faq, i) => (
                        <div key={i} className="glass p-6 rounded-2xl shadow-sm border border-border/50">
                            <h3 className="text-lg font-bold mb-2 text-primary">{faq.question}</h3>
                            <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
