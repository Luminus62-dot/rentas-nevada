"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "es" | "en";

interface Translations {
    [key: string]: {
        es: string;
        en: string;
    };
}

const translations: Translations = {
    // Navigation
    "nav.search": { es: "Buscar", en: "Search" },
    "nav.map": { es: "Mapa", en: "Map" },
    "nav.post": { es: "Publicar", en: "Post" },
    "nav.dashboard": { es: "Panel", en: "Dashboard" },
    "nav.login": { es: "Iniciar Sesión", en: "Log In" },
    "nav.register": { es: "Registrarse", en: "Sign Up" },

    // Common
    "common.price": { es: "Precio", en: "Price" },
    "common.month": { es: "mes", en: "month" },
    "common.loading": { es: "Cargando...", en: "Loading..." },
    "common.save": { es: "Guardar", en: "Save" },
    "common.cancel": { es: "Cancelar", en: "Cancel" },
    "common.search": { es: "Buscar", en: "Search" },

    // Property types
    "property.house": { es: "Casa", en: "House" },
    "property.apartment": { es: "Departamento", en: "Apartment" },
    "property.room": { es: "Cuarto", en: "Room" },

    // Footer
    "footer.faq": { es: "FAQ", en: "FAQ" },
    "footer.terms": { es: "Términos", en: "Terms" },
    "footer.privacy": { es: "Privacidad", en: "Privacy" },
    "footer.contact": { es: "Contacto", en: "Contact" },
};

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>("es");

    useEffect(() => {
        const saved = localStorage.getItem("language") as Language;
        if (saved && (saved === "es" || saved === "en")) {
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("language", lang);
    };

    const t = (key: string): string => {
        return translations[key]?.[language] || key;
    };

    return (
        <I18nContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error("useI18n must be used within I18nProvider");
    }
    return context;
}
