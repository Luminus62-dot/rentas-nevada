
export default function Footer() {
    return (
        <footer className="border-t border-border bg-muted/50 mt-auto">
            <div className="container-custom py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Rentas Nevada. Todos los derechos reservados.
                    </div>

                    <div className="flex gap-6 text-sm font-medium text-muted-foreground">
                        <a href="/faq" className="hover:text-foreground transition-colors">FAQ</a>
                        <a href="/terms" className="hover:text-foreground transition-colors">Términos</a>
                        <a href="/privacy" className="hover:text-foreground transition-colors">Privacidad</a>
                        <a href="mailto:soporte@rentasnevada.com" className="hover:text-foreground transition-colors">Contacto</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
