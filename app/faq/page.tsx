"use client";

import { InteractiveBackground } from "@/components/InteractiveBackground";
import { useI18n } from "@/lib/i18n";

export default function FAQPage() {
    const { t } = useI18n();

    return (
        <div className="min-h-screen bg-dots-pattern relative overflow-hidden py-20">
            <InteractiveBackground />
            <div className="container-custom relative z-10 max-w-3xl glass p-10 rounded-3xl">
                <h1 className="text-3xl font-bold mb-6 text-foreground">{t("faq.title")}</h1>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-foreground">{t("faq.q1")}</h3>
                        <p>{t("faq.a1")}</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-foreground">{t("faq.q2")}</h3>
                        <p>{t("faq.a2")}</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-foreground">{t("faq.q3")}</h3>
                        <p>{t("faq.a3")}</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-foreground">{t("faq.q4")}</h3>
                        <p>{t("faq.a4")}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
