"use client";

import { InteractiveBackground } from "@/components/InteractiveBackground";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-dots-pattern relative overflow-hidden py-20">
            <InteractiveBackground />
            <div className="container-custom relative z-10 max-w-3xl glass p-10 rounded-3xl">
                <h1 className="text-3xl font-bold mb-6 text-foreground">Términos de Servicio</h1>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-4">
                    <p>Bienvenido a Rentas Nevada. Al usar nuestra plataforma, aceptas los siguientes términos:</p>
                    <h3 className="text-lg font-bold text-foreground">1. Uso de la Plataforma</h3>
                    <p>Rentas Nevada es un buscador de propiedades. No somos responsables de los acuerdos realizados entre inquilinos y dueños. El uso de la plataforma es bajo su propio riesgo.</p>

                    <h3 className="text-lg font-bold text-foreground">2. Veracidad de la Información</h3>
                    <p>Los anunciantes son responsables de la veracidad de la información publicada. El uso de información falsa o engañosa puede resultar en la suspensión permanente de la cuenta sin previo aviso.</p>

                    <h3 className="text-lg font-bold text-foreground">3. Compromiso de No Discriminación</h3>
                    <p>Rentas Nevada se adhiere a los principios de igualdad de vivienda. Los usuarios aceptan no discriminar a inquilinos potenciales por motivos de raza, color, religión, sexo, discapacidad, estado familiar u origen nacional.</p>

                    <h3 className="text-lg font-bold text-foreground">4. Pagos y Servicios de Verificación</h3>
                    <p>Las tarifas pagadas por servicios de verificación o anuncios destacados no son reembolsables una vez procesadas, incluso si el anuncio es eliminado por violar los términos de servicio.</p>

                    <h3 className="text-lg font-bold text-foreground">5. Limitación de Responsabilidad</h3>
                    <p>En ningún caso Rentas Nevada será responsable por daños indirectos, incidentales o consecuentes derivados de transacciones realizadas fuera de nuestra plataforma.</p>
                    <p className="pt-8 text-xs italic">Última actualización: Enero 2026</p>
                </div>
            </div>
        </div>
    );
}
