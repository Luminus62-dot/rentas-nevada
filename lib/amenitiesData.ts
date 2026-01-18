export type AmenityCategory = {
    id: string;
    label: string;
    icon: string;
};

export type AmenityItem = {
    id: string;
    label: string;
    icon: string;
    categoryId: string;
};

export const AMENITY_CATEGORIES: AmenityCategory[] = [
    { id: "generales", label: "Generales (Básicas)", icon: "🏡" },
    { id: "cocina", label: "Cocina", icon: "🍽️" },
    { id: "lavanderia", label: "Lavandería", icon: "🧺" },
    { id: "dormitorios", label: "Dormitorios & Baños", icon: "🛏️" },
    { id: "exterior", label: "Exterior & Espacios Abiertos", icon: "🌿" },
    { id: "estacionamiento", label: "Estacionamiento", icon: "🚗" },
    { id: "complejo", label: "Amenidades del Complejo", icon: "🏢" },
    { id: "seguridad", label: "Seguridad", icon: "🔐" },
    { id: "mascotas", label: "Mascotas", icon: "🐶" },
    { id: "smart_home", label: "Smart Home / Tecnología", icon: "🧠" },
    { id: "accesibilidad", label: "Accesibilidad", icon: "♿" },
    { id: "politicas", label: "Políticas & Extras", icon: "📄" },
];

export const AMENITIES_LIST: AmenityItem[] = [
    // Generales
    { id: "aire_acondicionado", label: "Aire acondicionado", icon: "❄️", categoryId: "generales" },
    { id: "calefaccion", label: "Calefacción", icon: "🔥", categoryId: "generales" },
    { id: "internet_incluido", label: "Internet incluido", icon: "🌐", categoryId: "generales" },
    { id: "cable_tv", label: "Cable / TV", icon: "📺", categoryId: "generales" },
    { id: "electricidad_incluida", label: "Electricidad incluida", icon: "⚡", categoryId: "generales" },
    { id: "agua_incluida", label: "Agua incluida", icon: "💧", categoryId: "generales" },
    { id: "gas_incluido", label: "Gas incluido", icon: "⛽", categoryId: "generales" },
    { id: "amueblado", label: "Amueblado", icon: "🛋️", categoryId: "generales" },
    { id: "sin_amueblar", label: "Sin amueblar", icon: "📦", categoryId: "generales" },
    { id: "entrada_privada", label: "Entrada privada", icon: "🔑", categoryId: "generales" },
    { id: "unidad_primer_piso", label: "Unidad en primer piso", icon: "⬇️", categoryId: "generales" },
    { id: "acceso_sin_escaleras", label: "Acceso sin escaleras", icon: "🚪", categoryId: "generales" },
    { id: "ventanas_grandes", label: "Ventanas grandes / buena iluminación", icon: "☀️", categoryId: "generales" },
    { id: "techos_altos", label: "Techos altos", icon: "🏘️", categoryId: "generales" },

    // Cocina
    { id: "cocina_equipada", label: "Cocina equipada", icon: "🍳", categoryId: "cocina" },
    { id: "refrigerador", label: "Refrigerador", icon: "🧊", categoryId: "cocina" },
    { id: "estufa_horno", label: "Estufa / Horno", icon: "🔥", categoryId: "cocina" },
    { id: "microondas", label: "Microondas", icon: "⏲️", categoryId: "cocina" },
    { id: "lavavajillas", label: "Lavavajillas", icon: "🧼", categoryId: "cocina" },
    { id: "triturador_basura", label: "Triturador de basura", icon: "🌪️", categoryId: "cocina" },
    { id: "encimeras_granito", label: "Encimeras de granito / cuarzo", icon: "💎", categoryId: "cocina" },
    { id: "gabinetes_modernos", label: "Gabinetes modernos", icon: "📂", categoryId: "cocina" },
    { id: "isla_cocina", label: "Isla de cocina", icon: "🏝️", categoryId: "cocina" },
    { id: "despensa", label: "Despensa", icon: "🥫", categoryId: "cocina" },

    // Lavandería
    { id: "lavadora", label: "Lavadora", icon: "🧺", categoryId: "lavanderia" },
    { id: "secadora", label: "Secadora", icon: "💨", categoryId: "lavanderia" },
    { id: "lavadora_secadora_unidad", label: "Lavadora y secadora en la unidad", icon: "🔄", categoryId: "lavanderia" },
    { id: "lavanderia_compartida", label: "Lavandería compartida", icon: "👥", categoryId: "lavanderia" },
    { id: "conexiones_lavadora_secadora", label: "Conexiones para lavadora/secadora", icon: "🔌", categoryId: "lavanderia" },

    // Dormitorios & Baños
    { id: "walk_in_closet", label: "Walk-in closet", icon: "🚶", categoryId: "dormitorios" },
    { id: "closet_amplio", label: "Closet amplio", icon: "👕", categoryId: "dormitorios" },
    { id: "bano_privado", label: "Baño privado", icon: "🚿", categoryId: "dormitorios" },
    { id: "doble_lavabo", label: "Doble lavabo", icon: "🚰", categoryId: "dormitorios" },
    { id: "tina", label: "Tina", icon: "🛁", categoryId: "dormitorios" },
    { id: "ducha_walk_in", label: "Ducha tipo walk-in", icon: "🚿", categoryId: "dormitorios" },
    { id: "jacuzzi_hidromasaje", label: "Jacuzzi / tina de hidromasaje", icon: "🧼", categoryId: "dormitorios" },
    { id: "vanity_moderno", label: "Vanity moderno", icon: "🪞", categoryId: "dormitorios" },

    // Exterior
    { id: "balcon", label: "Balcón", icon: "🖼️", categoryId: "exterior" },
    { id: "patio", label: "Patio", icon: "🪑", categoryId: "exterior" },
    { id: "jardin", label: "Jardín", icon: "🌳", categoryId: "exterior" },
    { id: "terraza", label: "Terraza", icon: "🌅", categoryId: "exterior" },
    { id: "area_bbq", label: "Área para BBQ", icon: "🍖", categoryId: "exterior" },
    { id: "vista_ciudad", label: "Vista a la ciudad", icon: "🏙️", categoryId: "exterior" },
    { id: "vista_montana", label: "Vista a la montaña", icon: "⛰️", categoryId: "exterior" },
    { id: "vista_strip", label: "Vista al strip / skyline (Vegas 😎)", icon: "🎰", categoryId: "exterior" },

    // Estacionamiento
    { id: "estacionamiento_incluido", label: "Estacionamiento incluido", icon: "🅿️", categoryId: "estacionamiento" },
    { id: "garaje_privado", label: "Garaje privado", icon: "🚗", categoryId: "estacionamiento" },
    { id: "garaje_cubierto", label: "Garaje cubierto", icon: "🏠", categoryId: "estacionamiento" },
    { id: "estacionamiento_asignado", label: "Estacionamiento asignado", icon: "🆔", categoryId: "estacionamiento" },
    { id: "estacionamiento_visitantes", label: "Estacionamiento para visitantes", icon: "👋", categoryId: "estacionamiento" },
    { id: "carga_ev", label: "Carga para autos eléctricos (EV)", icon: "🔌", categoryId: "estacionamiento" },

    // Complejo
    { id: "piscina", label: "Piscina", icon: "🏊", categoryId: "complejo" },
    { id: "jacuzzi_complejo", label: "Jacuzzi", icon: "🛁", categoryId: "complejo" },
    { id: "gimnasio", label: "Gimnasio", icon: "💪", categoryId: "complejo" },
    { id: "casa_club", label: "Casa club", icon: "🏘️", categoryId: "complejo" },
    { id: "area_juegos", label: "Área de juegos", icon: "🧸", categoryId: "complejo" },
    { id: "cancha_deportiva", label: "Cancha deportiva", icon: "🏀", categoryId: "complejo" },
    { id: "salon_eventos", label: "Salón de eventos", icon: "🎉", categoryId: "complejo" },
    { id: "areas_verdes", label: "Áreas verdes", icon: "🍃", categoryId: "complejo" },
    { id: "elevador", label: "Elevador", icon: "🛗", categoryId: "complejo" },
    { id: "acceso_discapacitados", label: "Acceso para discapacitados", icon: "♿", categoryId: "complejo" },

    // Seguridad
    { id: "comunidad_cerrada", label: "Comunidad cerrada", icon: "🏘️", categoryId: "seguridad" },
    { id: "acceso_controlado", label: "Acceso controlado", icon: "🛂", categoryId: "seguridad" },
    { id: "camaras_seguridad", label: "Cámaras de seguridad", icon: "📹", categoryId: "seguridad" },
    { id: "seguridad_24_7", label: "Seguridad 24/7", icon: "👮", categoryId: "seguridad" },
    { id: "intercomunicador", label: "Intercomunicador", icon: "📞", categoryId: "seguridad" },
    { id: "puerta_reforzada", label: "Puerta reforzada", icon: "🛡️", categoryId: "seguridad" },

    // Mascotas
    { id: "pet_friendly", label: "Pet-friendly", icon: "🐾", categoryId: "mascotas" },
    { id: "se_aceptan_perros", label: "Se aceptan perros", icon: "🐕", categoryId: "mascotas" },
    { id: "se_aceptan_gatos", label: "Se aceptan gatos", icon: "🐈", categoryId: "mascotas" },
    { id: "parque_mascotas", label: "Parque para mascotas", icon: "🌳", categoryId: "mascotas" },
    { id: "sin_mascotas", label: "Sin mascotas", icon: "🚫", categoryId: "mascotas" },

    // Smart Home
    { id: "cerradura_inteligente", label: "Cerradura inteligente", icon: "🔐", categoryId: "smart_home" },
    { id: "termostato_inteligente", label: "Termostato inteligente", icon: "🌡️", categoryId: "smart_home" },
    { id: "camaras_exterior", label: "Cámaras (exterior)", icon: "📹", categoryId: "smart_home" },
    { id: "iluminacion_inteligente", label: "Iluminación inteligente", icon: "💡", categoryId: "smart_home" },
    { id: "timbre_inteligente", label: "Timbre inteligente", icon: "🔔", categoryId: "smart_home" },
    { id: "fibra_internet", label: "Preinstalación para internet fibra", icon: "🚀", categoryId: "smart_home" },

    // Accesibilidad
    { id: "acceso_silla_ruedas", label: "Acceso para silla de ruedas", icon: "♿", categoryId: "accesibilidad" },
    { id: "puertas_amplias", label: "Puertas amplias", icon: "🚪", categoryId: "accesibilidad" },
    { id: "bano_accesible", label: "Baño accesible", icon: "🚿", categoryId: "accesibilidad" },
    { id: "rampas", label: "Rampas", icon: "♿", categoryId: "accesibilidad" },

    // Políticas
    { id: "contrato_flexible", label: "Contrato flexible", icon: "📝", categoryId: "politicas" },
    { id: "rentas_corto_plazo", label: "Rentas a corto plazo", icon: "🗓️", categoryId: "politicas" },
    { id: "rentas_largo_plazo", label: "Rentas a largo plazo", icon: "🏢", categoryId: "politicas" },
    { id: "incluye_mantenimiento", label: "Incluye mantenimiento", icon: "🛠️", categoryId: "politicas" },
    { id: "incluye_hoa", label: "Incluye HOA", icon: "💰", categoryId: "politicas" },
    { id: "incluye_basura", label: "Incluye basura", icon: "🗑️", categoryId: "politicas" },
    { id: "seccion_8_aceptada", label: "Sección 8 aceptada", icon: "📜", categoryId: "politicas" },
    { id: "no_fumar", label: "No fumar", icon: "🚭", categoryId: "politicas" },
];
