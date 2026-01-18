"use client";

import { InteractiveBackground } from "@/components/InteractiveBackground";
import { useI18n } from "@/lib/i18n";

export default function TermsPage() {
    const { t } = useI18n();

    return (
        <div className="min-h-screen bg-dots-pattern relative overflow-hidden py-20">
            <InteractiveBackground />
            <div className="container-custom relative z-10 max-w-3xl glass p-10 rounded-3xl">
                <h1 className="text-3xl font-bold mb-6 text-foreground">{t("terms.title")}</h1>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-4">
                    <p>{t("terms.intro")}</p>
                    <h3 className="text-lg font-bold text-foreground">{t("terms.h1")}</h3>
                    <p>{t("terms.p1")}</p>

                    <h3 className="text-lg font-bold text-foreground">{t("terms.h2")}</h3>
                    <p>{t("terms.p2")}</p>

                    <h3 className="text-lg font-bold text-foreground">{t("terms.h3")}</h3>
                    <p>{t("terms.p3")}</p>

                    <h3 className="text-lg font-bold text-foreground">{t("terms.h4")}</h3>
                    <p>{t("terms.p4")}</p>

                    <h3 className="text-lg font-bold text-foreground">{t("terms.h5")}</h3>
                    <p>{t("terms.p5")}</p>

                    <p className="pt-8 text-xs italic">{t("terms.updated")}</p>
                </div>
            </div>
        </div>
    );
}
