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
    "search.subtitle": { es: "Encuentra tu próximo hogar en Las Vegas y alrededores.", en: "Find your next home in Las Vegas and nearby areas." },
    "search.city": { es: "Ciudad", en: "City" },
    "search.cityPlaceholder": { es: "Ej: Las Vegas", en: "e.g., Las Vegas" },
    "search.type": { es: "Tipo", en: "Type" },
    "search.maxPrice": { es: "Precio Máximo", en: "Max Price" },
    "search.maxPricePlaceholder": { es: "Ej: 2000", en: "e.g., 2000" },
    "search.amenities": { es: "Comodidades", en: "Amenities" },
    "search.petFriendly": { es: "Acepta Mascotas", en: "Pet Friendly" },
    "search.parking": { es: "Estacionamiento", en: "Parking" },
    "search.washerDryer": { es: "Lavadora/Secadora", en: "Washer/Dryer" },
    "search.internet": { es: "Internet Incluido", en: "Internet Included" },
    "search.saveSearch": { es: "Guardar Búsqueda", en: "Save search" },
    "search.signInToSave": { es: "Inicia sesión para guardar esta búsqueda.", en: "Sign in to save this search." },
    "search.saveError": { es: "Error al guardar alerta", en: "Error saving alert" },
    "search.saveSuccess": { es: "¡Alerta guardada! Te notificaremos de nuevos anuncios.", en: "Alert saved! We'll notify you about new listings." },
    "search.errorTitle": { es: "Error al cargar anuncios", en: "Error loading listings" },
    "search.retry": { es: "Reintentar", en: "Try again" },
    "search.loading": { es: "Cargando búsqueda...", en: "Loading search..." },
    "search.noResults": { es: "No hay anuncios disponibles en este momento", en: "No listings available at this time" },
    "search.beFirst": { es: "¡Sé el primero en publicar!", en: "Be the first to post!" },
    "search.verified": { es: "Verificado", en: "Verified" },
    "search.unverified": { es: "No Verificado", en: "Unverified" },
    "search.perMonth": { es: "/ mes", en: "/ month" },
    "search.typeRoom": { es: "Habitación", en: "Room" },
    "search.typeApartment": { es: "Apartamento", en: "Apartment" },
    "search.typeHouse": { es: "Casa", en: "House" },
    "search.furnished": { es: "Amueblado", en: "Furnished" },

    // Listing detail
    "listing.verified": { es: "Verificado", en: "Verified" },
    "listing.featured": { es: "Destacado", en: "Featured" },
    "listing.archived": { es: "Archivado", en: "Archived" },
    "listing.deposit": { es: "Depósito", en: "Deposit" },
    "listing.available": { es: "Disponible", en: "Available" },
    "listing.furnished": { es: "Amueblado", en: "Furnished" },
    "listing.description": { es: "Descripción", en: "Description" },
    "listing.location": { es: "Ubicación Aproximada", en: "Approximate Location" },
    "listing.locationMissing": { es: "Ubicación no especificada", en: "Location not specified" },
    "listing.amenities": { es: "Comodidades", en: "Amenities" },
    "listing.reviews": { es: "Reseñas", en: "Reviews" },
    "listing.contact": { es: "Contactar Anfitrión", en: "Contact Host" },
    "listing.save": { es: "Guardar", en: "Save" },
    "listing.saved": { es: "Guardado", en: "Saved" },
    "listing.report": { es: "Reportar Anuncio", en: "Report Listing" },
    "listing.backToResults": { es: "Volver a resultados", en: "Back to results" },
    "listing.publishedBy": { es: "Publicado por", en: "Listed by" },
    "listing.reportSuccess": { es: "Reporte enviado exitosamente. Gracias por ayudarnos a mantener la comunidad segura.", en: "Report sent successfully. Thanks for helping us keep the community safe." },
    "listing.reportError": { es: "Error al enviar reporte:", en: "Error sending report:" },
    "listing.reportTitle": { es: "Reportar Anuncio", en: "Report listing" },
    "listing.reportDescription": { es: "¿Por qué quieres reportar este anuncio? Tu reporte será revisado por el equipo de administración.", en: "Why do you want to report this listing? Your report will be reviewed by the admin team." },
    "listing.reportPlaceholder": { es: "Ej. El anuncio es falso, la información no es correcta, etc.", en: "e.g., The listing is fake, the information is incorrect, etc." },
    "listing.reportSend": { es: "Enviar Reporte", en: "Send report" },
    "listing.reportSending": { es: "Enviando...", en: "Sending..." },
    "listing.reportSignIn": { es: "Inicia sesión para reportar un anuncio.", en: "Sign in to report a listing." },
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
    "listing.loadingImage": { es: "Cargando imagen...", en: "Loading image..." },
    "listing.availableNow": { es: "Inmediata", en: "Immediate" },
    "listing.published": { es: "Publicado", en: "Published" },
    "listing.host": { es: "Anfitrión", en: "Host" },
    "listing.reviewsCount": { es: "opiniones", en: "reviews" },
    "listing.backToSearch": { es: "Volver al buscador", en: "Back to search" },
    "listing.verifiedUser": { es: "Usuario verificado", en: "Verified user" },
    "listing.propertyLabel": { es: "Propiedad", en: "Property" },

    // Dashboard
    "dashboard.welcome": { es: "Bienvenido", en: "Welcome" },
    "dashboard.myListings": { es: "Mis Anuncios", en: "My Listings" },
    "dashboard.favorites": { es: "Favoritos", en: "Favorites" },
    "dashboard.messages": { es: "Mensajes", en: "Messages" },
    "dashboard.stats": { es: "Estadísticas", en: "Statistics" },

    // Admin
    "admin.loading": { es: "Cargando dashboard...", en: "Loading dashboard..." },
    "admin.accessDenied": { es: "Acceso Denegado", en: "Access denied" },
    "admin.noAccess": { es: "No tienes permisos de administrador.", en: "You don't have admin permissions." },
    "admin.backHome": { es: "Volver al inicio", en: "Back to home" },
    "admin.overview": { es: "Resumen", en: "Overview" },
    "admin.requests": { es: "Solicitudes", en: "Requests" },
    "admin.reports": { es: "Reportes", en: "Reports" },
    "admin.listings": { es: "Propiedades", en: "Listings" },
    "admin.users": { es: "Usuarios", en: "Users" },
    "admin.logs": { es: "Logs", en: "Logs" },
    "admin.subtitle": { es: "Control total de la plataforma", en: "Full platform control" },
    "admin.title": { es: "Panel de Administración", en: "Admin Dashboard" },
    "admin.totalUsers": { es: "Usuarios Totales", en: "Total users" },
    "admin.listingsCount": { es: "Propiedades", en: "Listings" },
    "admin.pending": { es: "Pendientes", en: "Pending" },
    "admin.verified": { es: "Verificados", en: "Verified" },
    "admin.requestsCount": { es: "Solicitudes", en: "Requests" },
    "admin.needsAttention": { es: "Requiere atención", en: "Needs attention" },
    "admin.allCaughtUp": { es: "Todo al día", en: "All caught up" },
    "admin.revenue": { es: "Ingresos (Est.)", en: "Revenue (Est.)" },
    "admin.comingSoon": { es: "Próximamente", en: "Coming soon" },
    "admin.recentActivity": { es: "Actividad Reciente", en: "Recent activity" },
    "admin.newUser": { es: "Nuevo usuario registrado", en: "New user registered" },
    "admin.systemStatus": { es: "Estado del Sistema", en: "System status" },
    "admin.database": { es: "Base de Datos", en: "Database" },
    "admin.storage": { es: "Storage", en: "Storage" },
    "admin.appVersion": { es: "Versión App", en: "App version" },
    "admin.noPendingRequests": { es: "No hay solicitudes pendientes", en: "No pending requests" },
    "admin.process": { es: "Procesar", en: "Process" },
    "admin.approve": { es: "Aprobar", en: "Approve" },
    "admin.reject": { es: "Rechazar", en: "Reject" },
    "admin.completed": { es: "Finalizada", en: "Completed" },
    "admin.noReports": { es: "No hay reportes de usuarios", en: "No user reports" },
    "admin.type": { es: "Tipo", en: "Type" },
    "admin.listingId": { es: "ID de Propiedad", en: "Listing ID" },
    "admin.targetId": { es: "ID de Objetivo", en: "Target ID" },
    "admin.resolve": { es: "Resolver", en: "Resolve" },
    "admin.dismiss": { es: "Descartar", en: "Dismiss" },
    "admin.searchListings": { es: "Buscar propiedad por nombre o ciudad...", en: "Search listings by name or city..." },
    "admin.allStatuses": { es: "Todos los estados", en: "All statuses" },
    "admin.listing": { es: "Propiedad", en: "Listing" },
    "admin.status": { es: "Estado", en: "Status" },
    "admin.price": { es: "Precio", en: "Price" },
    "admin.actions": { es: "Acciones", en: "Actions" },
    "admin.verify": { es: "Verificar", en: "Verify" },
    "admin.archive": { es: "Archivar", en: "Archive" },
    "admin.restore": { es: "Restaurar", en: "Restore" },
    "admin.delete": { es: "Eliminar", en: "Delete" },
    "admin.noListings": { es: "No se encontraron propiedades.", en: "No listings found." },
    "admin.searchUsers": { es: "Buscar usuario por nombre o correo...", en: "Search users by name or email..." },
    "admin.unverified": { es: "No Verificado", en: "Unverified" },
    "admin.verifiedLabel": { es: "Verificado", en: "Verified" },
    "admin.unnamedUser": { es: "Usuario sin nombre", en: "Unnamed user" },
    "admin.roleLandlord": { es: "Publicante", en: "Landlord" },
    "admin.roleUser": { es: "Usuario", en: "User" },
    "admin.joined": { es: "Registrado", en: "Joined" },
    "admin.revokeVerification": { es: "Revocar Verificación", en: "Revoke verification" },
    "admin.verifyUser": { es: "Verificar Usuario", en: "Verify user" },
    "admin.noUsers": { es: "No se encontraron usuarios o faltan permisos.", en: "No users found or missing permissions." },
    "admin.date": { es: "Fecha", en: "Date" },
    "admin.action": { es: "Acción", en: "Action" },
    "admin.details": { es: "Detalles", en: "Details" },
    "admin.noActivity": { es: "No hay actividad registrada.", en: "No activity recorded." },
    "admin.deleteListingTitle": { es: "¿Eliminar Propiedad?", en: "Delete listing?" },
    "admin.deleteListingMessage": { es: "Esta acción no se puede deshacer. La propiedad será eliminada permanentemente de la base de datos.", en: "This action cannot be undone. The listing will be permanently removed from the database." },
    "admin.statusPending": { es: "Pendiente", en: "Pending" },
    "admin.statusVerified": { es: "Verificado", en: "Verified" },
    "admin.statusArchived": { es: "Archivado", en: "Archived" },
    "admin.statusUnverified": { es: "No Verificado", en: "Unverified" },

    // Map
    "map.title": { es: "Mapa Interactivo", en: "Interactive Map" },
    "map.allProperties": { es: "Todas las Propiedades", en: "All properties" },
    "map.rooms": { es: "Habitaciones", en: "Rooms" },
    "map.apartments": { es: "Apartamentos", en: "Apartments" },
    "map.houses": { es: "Casas", en: "Houses" },
    "map.maxPrice": { es: "Max Precio:", en: "Max price:" },
    "map.results": { es: "resultados encontrados", en: "results found" },
    "map.errorTitle": { es: "Error al cargar anuncios", en: "Error loading listings" },
    "map.retry": { es: "Reintentar", en: "Try again" },
    "map.viewListings": { es: "Ver Lista", en: "View listings" },
    "map.loading": { es: "Cargando Mapa...", en: "Loading map..." },

    // Messaging
    "messaging.hideChat": { es: "¿Ocultar este chat?", en: "Hide this chat?" },
    "messaging.errorSending": { es: "Error al enviar", en: "Error sending message" },
    "messaging.finishConfirm": { es: "¿Marcar trato como finalizado?", en: "Mark conversation as finished?" },
    "messaging.closed": { es: "Trato finalizado", en: "Conversation closed" },
    "messaging.loading": { es: "Cargando mensajes...", en: "Loading messages..." },
    "messaging.empty": { es: "No hay mensajes.", en: "No messages yet." },
    "messaging.userFallback": { es: "Usuario", en: "User" },
    "messaging.finish": { es: "Finalizar", en: "Finish" },
    "messaging.finished": { es: "Deal Finalizado ✨", en: "Conversation closed ✨" },
    "messaging.typing": { es: "Escribiendo...", en: "Typing..." },
    "messaging.messagePlaceholder": { es: "Mensaje...", en: "Message..." },
    "messaging.send": { es: "Enviar", en: "Send" },
    "messaging.selectChat": { es: "Selecciona un chat", en: "Select a chat" },

    // Login/Register
    "auth.email": { es: "Correo Electrónico", en: "Email" },
    "auth.password": { es: "Contraseña", en: "Password" },
    "auth.login": { es: "Iniciar Sesión", en: "Log In" },
    "auth.register": { es: "Registrarse", en: "Sign Up" },
    "auth.noAccount": { es: "¿No tienes cuenta?", en: "Don't have an account?" },
    "auth.haveAccount": { es: "¿Ya tienes cuenta?", en: "Already have an account?" },

    // FAQ Page
    "faq.title": { es: "Preguntas Frecuentes", en: "Frequently Asked Questions" },
    "faq.q1": { es: "¿Cómo funciona Stay Nevada?", en: "How does Stay Nevada work?" },
    "faq.a1": { es: "Stay Nevada conecta a inquilinos con propietarios en Nevada. Puedes buscar propiedades, contactar directamente a los anfitriones y coordinar visitas.", en: "Stay Nevada connects tenants with property owners in Nevada. You can search properties, contact hosts directly, and coordinate visits." },
    "faq.q2": { es: "¿Es gratis usar la plataforma?", en: "Is the platform free to use?" },
    "faq.a2": { es: "Sí, buscar y contactar propiedades es completamente gratis. Los propietarios pueden publicar anuncios básicos sin costo.", en: "Yes, searching and contacting properties is completely free. Property owners can post basic listings at no cost." },
    "faq.q3": { es: "¿Qué significa 'Verificado'?", en: "What does 'Verified' mean?" },
    "faq.a3": { es: "Las propiedades verificadas han pasado por nuestro proceso de revisión manual donde confirmamos la identidad del propietario y la existencia real de la propiedad.", en: "Verified properties have passed our manual review process where we confirm the owner's identity and the actual existence of the property." },
    "faq.q4": { es: "¿Cómo puedo reportar un anuncio sospechoso?", en: "How can I report a suspicious listing?" },
    "faq.a4": { es: "En cada anuncio encontrarás un botón de 'Reportar'. Úsalo para notificarnos sobre contenido fraudulento o inapropiado.", en: "On each listing you'll find a 'Report' button. Use it to notify us about fraudulent or inappropriate content." },

    // Terms Page
    "terms.title": { es: "Términos de Servicio", en: "Terms of Service" },
    "terms.intro": { es: "Al usar Stay Nevada, aceptas los siguientes términos:", en: "By using Stay Nevada, you agree to the following terms:" },
    "terms.h1": { es: "1. Uso de la Plataforma", en: "1. Platform Usage" },
    "terms.p1": { es: "Stay Nevada es una plataforma de conexión entre inquilinos y propietarios. No somos agentes inmobiliarios ni garantizamos la disponibilidad o veracidad de los anuncios.", en: "Stay Nevada is a connection platform between tenants and property owners. We are not real estate agents and do not guarantee the availability or accuracy of listings." },
    "terms.h2": { es: "2. Responsabilidad del Usuario", en: "2. User Responsibility" },
    "terms.p2": { es: "Los usuarios son responsables de verificar la información de las propiedades antes de realizar cualquier pago o firmar contratos.", en: "Users are responsible for verifying property information before making any payment or signing contracts." },
    "terms.h3": { es: "3. No Discriminación", en: "3. Non-Discrimination" },
    "terms.p3": { es: "Nos adherimos a los principios de la Ley de Vivienda Justa (Fair Housing Act). Está prohibido discriminar por raza, color, religión, sexo, origen nacional, discapacidad o situación familiar.", en: "We adhere to Fair Housing Act principles. Discrimination based on race, color, religion, sex, national origin, disability, or familial status is prohibited." },
    "terms.h4": { es: "4. Pagos y Reembolsos", en: "4. Payments and Refunds" },
    "terms.p4": { es: "Cualquier transacción financiera es responsabilidad exclusiva entre el inquilino y el propietario. Stay Nevada no procesa pagos de rentas.", en: "Any financial transaction is the sole responsibility between tenant and owner. Stay Nevada does not process rent payments." },
    "terms.h5": { es: "5. Limitación de Responsabilidad", en: "5. Limitation of Liability" },
    "terms.p5": { es: "Stay Nevada no se hace responsable por disputas, daños o pérdidas derivadas del uso de la plataforma.", en: "Stay Nevada is not responsible for disputes, damages, or losses arising from platform use." },
    "terms.updated": { es: "Última actualización: Enero 2026", en: "Last updated: January 2026" },

    // Privacy Page
    "privacy.title": { es: "Política de Privacidad", en: "Privacy Policy" },
    "privacy.intro": { es: "En Stay Nevada, valoramos tu privacidad. Esta política describe cómo manejamos tus datos:", en: "At Stay Nevada, we value your privacy. This policy describes how we handle your data:" },
    "privacy.h1": { es: "1. Recolección de Datos", en: "1. Data Collection" },
    "privacy.p1": { es: "Recopilamos información necesaria para el funcionamiento del servicio, como nombre, correo electrónico, dirección de la propiedad (solo para dueños) y registros de comunicación interna entre usuarios.", en: "We collect information necessary for service operation, such as name, email, property address (owners only), and internal communication records between users." },
    "privacy.h2": { es: "2. Uso de la Ubicación y Privacidad", en: "2. Location Usage and Privacy" },
    "privacy.p2": { es: "La ubicación exacta de las propiedades se guarda bajo estrictas medidas de seguridad y solo se revela a interesados que el dueño decida contactar. Al público general solo se muestra un radio aproximado para proteger la identidad del inmueble.", en: "Exact property locations are stored under strict security measures and only revealed to interested parties the owner decides to contact. The general public only sees an approximate radius to protect property identity." },
    "privacy.h3": { es: "3. Seguridad de los Datos", en: "3. Data Security" },
    "privacy.p3": { es: "Utilizamos tecnologías de encriptación y servicios de infraestructura líderes en la industria (Supabase/PostgreSQL) para asegurar que tu información esté protegida contra accesos no autorizados.", en: "We use encryption technologies and industry-leading infrastructure services (Supabase/PostgreSQL) to ensure your information is protected against unauthorized access." },
    "privacy.h4": { es: "4. Tus Derechos", en: "4. Your Rights" },
    "privacy.p4": { es: "Tienes derecho a solicitar el acceso, corrección o eliminación de tus datos personales en cualquier momento a través de tu panel de perfil o contactando a nuestro soporte.", en: "You have the right to request access, correction, or deletion of your personal data at any time through your profile panel or by contacting our support." },
    "privacy.h5": { es: "5. Cookies y Tecnologías de Rastreo", en: "5. Cookies and Tracking Technologies" },
    "privacy.p5": { es: "Utilizamos cookies para mantener tu sesión activa y mejorar tu experiencia de navegación. Puedes desactivarlas en tu navegador, aunque esto puede afectar algunas funciones de la aplicación.", en: "We use cookies to keep your session active and improve your browsing experience. You can disable them in your browser, although this may affect some application functions." },
    "privacy.h6": { es: "6. Analítica y Monitoreo", en: "6. Analytics and Monitoring" },
    "privacy.p6": { es: "Utilizamos Google Analytics y Vercel Analytics para comprender cómo los usuarios interactúan con nuestra plataforma. Estos servicios recopilan datos anónimos sobre el uso del sitio (páginas visitadas, tiempo de permanencia, etc.) para ayudarnos a mejorar la experiencia. Estos datos no se vinculan a tu identidad personal.", en: "We use Google Analytics and Vercel Analytics to understand how users interact with our platform. These services collect anonymous data about site usage (pages visited, time spent, etc.) to help us improve the experience. This data is not linked to your personal identity." },
    "privacy.updated": { es: "Última actualización: Enero 2026", en: "Last updated: January 2026" },

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
    const [language, setLanguageState] = useState<Language>("en");

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
