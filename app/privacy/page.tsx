"use client";

import { InteractiveBackground } from "@/components/InteractiveBackground";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-dots-pattern relative overflow-hidden py-20">
            <InteractiveBackground />
            <div className="container-custom relative z-10 max-w-3xl glass p-10 rounded-3xl">
                <h1 className="text-3xl font-bold mb-6 text-foreground">Política de Privacidad</h1>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-4">
                    <p>En Rentas Nevada, valoramos tu privacidad. Esta política describe cómo manejamos tus datos:</p>
                    <h3 className="text-lg font-bold text-foreground">1. Recolección de Datos</h3>
                    <p>Recopilamos información necesaria para el funcionamiento del servicio, como nombre, correo electrónico, dirección de la propiedad (solo para dueños) y registros de comunicación interna entre usuarios.</p>

                    <h3 className="text-lg font-bold text-foreground">2. Uso de la Ubicación y Privacidad</h3>
                    <p>La ubicación exacta de las propiedades se guarda bajo estrictas medidas de seguridad y solo se revela a interesados que el dueño decida contactar. Al público general solo se muestra un radio aproximado para proteger la identidad del inmueble.</p>

                    <h3 className="text-lg font-bold text-foreground">3. Seguridad de los Datos</h3>
                    <p>Utilizamos tecnologías de encriptación y servicios de infraestructura líderes en la industria (Supabase/PostgreSQL) para asegurar que tu información esté protegida contra accesos no autorizados.</p>

                    <h3 className="text-lg font-bold text-foreground">4. Tus Derechos</h3>
                    <p>Tienes derecho a solicitar el acceso, corrección o eliminación de tus datos personales en cualquier momento a través de tu panel de perfil o contactando a nuestro soporte.</p>

                    <h3 className="text-lg font-bold text-foreground">5. Cookies y Tecnologías de Rastreo</h3>
                    <p>Utilizamos cookies para mantener tu sesión activa y mejorar tu experiencia de navegación. Puedes desactivarlas en tu navegador, aunque esto puede afectar algunas funciones de la aplicación.</p>

                    <h3 className="text-lg font-bold text-foreground">6. Analítica y Monitoreo</h3>
                    <p>Utilizamos Google Analytics y Vercel Analytics para comprender cómo los usuarios interactúan con nuestra plataforma. Estos servicios recopilan datos anónimos sobre el uso del sitio (páginas visitadas, tiempo de permanencia, etc.) para ayudarnos a mejorar la experiencia. Estos datos no se vinculan a tu identidad personal.</p>
                    <p className="pt-8 text-xs italic">Última actualización: Enero 2026</p>
                </div>
            </div>
        </div>
    );
}
