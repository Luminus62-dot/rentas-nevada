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
    "nav.logout": { es: "Cerrar Sesión", en: "Log Out" },
    "nav.profile": { es: "Mi Perfil", en: "My Profile" },
    "nav.admin": { es: "Admin", en: "Admin" },
    "nav.myListings": { es: "Mis Anuncios", en: "My Listings" },
    "nav.favorites": { es: "Favoritos", en: "Favorites" },
    "nav.messages": { es: "Mensajes", en: "Messages" },

    // Common
    "common.price": { es: "Precio", en: "Price" },
    "common.month": { es: "mes", en: "month" },
    "common.loading": { es: "Cargando...", en: "Loading..." },
    "common.save": { es: "Guardar", en: "Save" },
    "common.cancel": { es: "Cancelar", en: "Cancel" },
    "common.search": { es: "Buscar", en: "Search" },
    "common.filter": { es: "Filtrar", en: "Filter" },
    "common.results": { es: "resultados", en: "results" },
    "common.contact": { es: "Contactar", en: "Contact" },
    "common.details": { es: "Ver Detalles", en: "View Details" },
    "common.edit": { es: "Editar", en: "Edit" },
    "common.delete": { es: "Eliminar", en: "Delete" },
    "common.submit": { es: "Enviar", en: "Submit" },
    "common.back": { es: "Volver", en: "Back" },
    "common.yes": { es: "Sí", en: "Yes" },
    "common.no": { es: "No", en: "No" },

    // Property types
    "property.house": { es: "Casa", en: "House" },
    "property.apartment": { es: "Departamento", en: "Apartment" },
    "property.room": { es: "Cuarto", en: "Room" },
    "property.all": { es: "Todos", en: "All" },

    // Home page
    "home.title": { es: "Encuentra tu hogar en Nevada", en: "Find Your Home in Nevada" },
    "home.subtitle": { es: "Miles de propiedades verificadas esperándote", en: "Thousands of verified properties waiting for you" },
    "home.cta": { es: "Buscar Propiedades", en: "Search Properties" },
    "home.post": { es: "Publicar Propiedad", en: "Post Property" },
    "home.featured": { es: "Propiedades Destacadas", en: "Featured Properties" },

    // Search page
    "search.title": { es: "Buscar Propiedades", en: "Search Properties" },
    "search.city": { es: "Ciudad", en: "City" },
    "search.type": { es: "Tipo", en: "Type" },
    "search.maxPrice": { es: "Precio Máximo", en: "Max Price" },
    "search.amenities": { es: "Comodidades", en: "Amenities" },
    "search.petFriendly": { es: "Acepta Mascotas", en: "Pet Friendly" },
    "search.parking": { es: "Estacionamiento", en: "Parking" },
    "search.noResults": { es: "No hay anuncios disponibles en este momento", en: "No listings available at this time" },
    "search.beFirst": { es: "¡Sé el primero en publicar!", en: "Be the first to post!" },

    // Listing detail
    "listing.verified": { es: "Verificado", en: "Verified" },
    "listing.featured": { es: "Destacado", en: "Featured" },
    "listing.archived": { es: "Archivado", en: "Archived" },
    "listing.deposit": { es: "Depósito", en: "Deposit" },
    "listing.available": { es: "Disponible", en: "Available" },
    "listing.furnished": { es: "Amueblado", en: "Furnished" },
    "listing.description": { es: "Descripción", en: "Description" },
    "listing.location": { es: "Ubicación Aproximada", en: "Approximate Location" },
    "listing.amenities": { es: "Comodidades", en: "Amenities" },
    "listing.reviews": { es: "Reseñas", en: "Reviews" },
    "listing.contact": { es: "Contactar Anfitrión", en: "Contact Host" },
    "listing.save": { es: "Guardar", en: "Save" },
    "listing.saved": { es: "Guardado", en: "Saved" },
    "listing.report": { es: "Reportar Anuncio", en: "Report Listing" },
    "listing.backToResults": { es: "Volver a resultados", en: "Back to results" },
    "listing.publishedBy": { es: "Publicado por", en: "Published by" },
    "listing.noDescription": { es: "Sin descripción detallada", en: "No detailed description" },
    "listing.locationNote": { es: "Por seguridad, solo mostramos el área aproximada de la propiedad. La dirección exacta se proporcionará tras contactar al anfitrión.", en: "For security, we only show the approximate area of the property. The exact address will be provided after contacting the host." },
    "listing.safetyTips": { es: "Consejos de Seguridad", en: "Safety Tips" },
    "listing.neverSendMoney": { es: "Nunca envíes dinero sin visitar la propiedad", en: "Never send money without visiting the property" },
    "listing.verifyIdentity": { es: "Verifica la identidad del propietario", en: "Verify the owner's identity" },
    "listing.useMessaging": { es: "Usa el sistema de mensajes de la plataforma", en: "Use the platform's messaging system" },
    "listing.trustBadge": { es: "¿Por qué confiar en este anuncio?", en: "Why trust this listing?" },
    "listing.trustText": { es: "Esta propiedad ha pasado por nuestro proceso de verificación manual. Hemos comprobado la identidad del anfitrión y la existencia real del inmueble para garantizarte una búsqueda segura y sin fraudes.", en: "This property has passed our manual verification process. We have verified the host's identity and the actual existence of the property to guarantee you a safe and fraud-free search." },
    "listing.noReviews": { es: "Aún no hay reseñas para esta propiedad", en: "No reviews yet for this property" },
    "listing.loginToReview": { es: "para dejar una reseña (requiere haber contactado antes)", en: "to leave a review (requires prior contact)" },
    "listing.archivedMessage": { es: "Esta propiedad está archivada y ya no recibe mensajes", en: "This property is archived and no longer receives messages" },
    "listing.notFound": { es: "Propiedad no encontrada", en: "Property not found" },
    "listing.error": { es: "Error", en: "Error" },
    "listing.loadingProperty": { es: "Cargando propiedad...", en: "Loading property..." },

    // Dashboard
    "dashboard.welcome": { es: "Bienvenido", en: "Welcome" },
    "dashboard.myListings": { es: "Mis Anuncios", en: "My Listings" },
    "dashboard.favorites": { es: "Favoritos", en: "Favorites" },
    "dashboard.messages": { es: "Mensajes", en: "Messages" },
    "dashboard.stats": { es: "Estadísticas", en: "Statistics" },

    // Login/Register
    "auth.email": { es: "Correo Electrónico", en: "Email" },
    "auth.password": { es: "Contraseña", en: "Password" },
    "auth.login": { es: "Iniciar Sesión", en: "Log In" },
    "auth.register": { es: "Registrarse", en: "Sign Up" },
    "auth.noAccount": { es: "¿No tienes cuenta?", en: "Don't have an account?" },
    "auth.haveAccount": { es: "¿Ya tienes cuenta?", en: "Already have an account?" },

    // Footer
    "footer.faq": { es: "FAQ", en: "FAQ" },
    "footer.terms": { es: "Términos", en: "Terms" },
    "footer.privacy": { es: "Privacidad", en: "Privacy" },
    "footer.contact": { es: "Contacto", en: "Contact" },
    "footer.rights": { es: "Todos los derechos reservados", en: "All rights reserved" },
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
