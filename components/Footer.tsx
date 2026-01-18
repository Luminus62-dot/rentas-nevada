"use client";

import { useI18n } from "@/lib/i18n";

export default function Footer() {
    const { t } = useI18n();

    return (
        <footer className="border-t border-border bg-muted/50 mt-auto">
            <div className="container-custom py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Stay Nevada. {t("footer.rights")}.
                    </div>

                    <div className="flex gap-6 text-sm font-medium text-muted-foreground">
                        <a href="/faq" className="hover:text-foreground transition-colors">{t("footer.faq")}</a>
                        <a href="/terms" className="hover:text-foreground transition-colors">{t("footer.terms")}</a>
                        <a href="/privacy" className="hover:text-foreground transition-colors">{t("footer.privacy")}</a>
                        <a href="mailto:support@staynevada.us" className="hover:text-foreground transition-colors">{t("footer.contact")}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
