"use client";

import { useI18n } from "@/lib/i18n";

export default function LanguageSwitcher() {
    const { language, setLanguage } = useI18n();

    return (
        <button
            onClick={() => setLanguage(language === "es" ? "en" : "es")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium"
            title={language === "es" ? "Switch to English" : "Switch to Spanish"}
        >
            <span className="text-lg">{language === "es" ? "🇺🇸" : "🇲🇽"}</span>
            <span className="hidden sm:inline">{language === "es" ? "EN" : "ES"}</span>
        </button>
    );
}
