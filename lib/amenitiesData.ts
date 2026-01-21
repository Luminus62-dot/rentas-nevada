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
    { id: "generales", label: "General (Basic)", icon: "🏡" },
    { id: "cocina", label: "Kitchen", icon: "🍽️" },
    { id: "lavanderia", label: "Laundry", icon: "🧺" },
    { id: "dormitorios", label: "Bedrooms & Bathrooms", icon: "🛏️" },
    { id: "exterior", label: "Outdoor & Open Spaces", icon: "🌿" },
    { id: "estacionamiento", label: "Parking", icon: "🚗" },
    { id: "complejo", label: "Community Amenities", icon: "🏢" },
    { id: "seguridad", label: "Security", icon: "🔐" },
    { id: "mascotas", label: "Pets", icon: "🐶" },
    { id: "smart_home", label: "Smart Home / Tech", icon: "🧠" },
    { id: "accesibilidad", label: "Accessibility", icon: "♿" },
    { id: "politicas", label: "Policies & Extras", icon: "📄" },
];

export const AMENITIES_LIST: AmenityItem[] = [
    // Generales
    { id: "aire_acondicionado", label: "Air conditioning", icon: "❄️", categoryId: "generales" },
    { id: "calefaccion", label: "Heating", icon: "🔥", categoryId: "generales" },
    { id: "internet_incluido", label: "Internet included", icon: "🌐", categoryId: "generales" },
    { id: "cable_tv", label: "Cable / TV", icon: "📺", categoryId: "generales" },
    { id: "electricidad_incluida", label: "Electricity included", icon: "⚡", categoryId: "generales" },
    { id: "agua_incluida", label: "Water included", icon: "💧", categoryId: "generales" },
    { id: "gas_incluido", label: "Gas included", icon: "⛽", categoryId: "generales" },
    { id: "amueblado", label: "Furnished", icon: "🛋️", categoryId: "generales" },
    { id: "sin_amueblar", label: "Unfurnished", icon: "📦", categoryId: "generales" },
    { id: "entrada_privada", label: "Private entrance", icon: "🔑", categoryId: "generales" },
    { id: "unidad_primer_piso", label: "First-floor unit", icon: "⬇️", categoryId: "generales" },
    { id: "acceso_sin_escaleras", label: "No-stairs access", icon: "🚪", categoryId: "generales" },
    { id: "ventanas_grandes", label: "Large windows / good lighting", icon: "☀️", categoryId: "generales" },
    { id: "techos_altos", label: "High ceilings", icon: "🏘️", categoryId: "generales" },

    // Cocina
    { id: "cocina_equipada", label: "Equipped kitchen", icon: "🍳", categoryId: "cocina" },
    { id: "refrigerador", label: "Refrigerator", icon: "🧊", categoryId: "cocina" },
    { id: "estufa_horno", label: "Stove / Oven", icon: "🔥", categoryId: "cocina" },
    { id: "microondas", label: "Microwave", icon: "⏲️", categoryId: "cocina" },
    { id: "lavavajillas", label: "Dishwasher", icon: "🧼", categoryId: "cocina" },
    { id: "triturador_basura", label: "Garbage disposal", icon: "🌪️", categoryId: "cocina" },
    { id: "encimeras_granito", label: "Granite / quartz countertops", icon: "💎", categoryId: "cocina" },
    { id: "gabinetes_modernos", label: "Modern cabinets", icon: "📂", categoryId: "cocina" },
    { id: "isla_cocina", label: "Kitchen island", icon: "🏝️", categoryId: "cocina" },
    { id: "despensa", label: "Pantry", icon: "🥫", categoryId: "cocina" },

    // Lavandería
    { id: "lavadora", label: "Washer", icon: "🧺", categoryId: "lavanderia" },
    { id: "secadora", label: "Dryer", icon: "💨", categoryId: "lavanderia" },
    { id: "lavadora_secadora_unidad", label: "In-unit washer & dryer", icon: "🔄", categoryId: "lavanderia" },
    { id: "lavanderia_compartida", label: "Shared laundry", icon: "👥", categoryId: "lavanderia" },
    { id: "conexiones_lavadora_secadora", label: "Washer/dryer hookups", icon: "🔌", categoryId: "lavanderia" },

    // Dormitorios & Baños
    { id: "walk_in_closet", label: "Walk-in closet", icon: "🚶", categoryId: "dormitorios" },
    { id: "closet_amplio", label: "Large closet", icon: "👕", categoryId: "dormitorios" },
    { id: "bano_privado", label: "Private bathroom", icon: "🚿", categoryId: "dormitorios" },
    { id: "doble_lavabo", label: "Double vanity", icon: "🚰", categoryId: "dormitorios" },
    { id: "tina", label: "Bathtub", icon: "🛁", categoryId: "dormitorios" },
    { id: "ducha_walk_in", label: "Walk-in shower", icon: "🚿", categoryId: "dormitorios" },
    { id: "jacuzzi_hidromasaje", label: "Jacuzzi / whirlpool tub", icon: "🧼", categoryId: "dormitorios" },
    { id: "vanity_moderno", label: "Modern vanity", icon: "🪞", categoryId: "dormitorios" },

    // Exterior
    { id: "balcon", label: "Balcony", icon: "🖼️", categoryId: "exterior" },
    { id: "patio", label: "Patio", icon: "🪑", categoryId: "exterior" },
    { id: "jardin", label: "Garden", icon: "🌳", categoryId: "exterior" },
    { id: "terraza", label: "Terrace", icon: "🌅", categoryId: "exterior" },
    { id: "area_bbq", label: "BBQ area", icon: "🍖", categoryId: "exterior" },
    { id: "vista_ciudad", label: "City view", icon: "🏙️", categoryId: "exterior" },
    { id: "vista_montana", label: "Mountain view", icon: "⛰️", categoryId: "exterior" },
    { id: "vista_strip", label: "Strip / skyline view (Vegas 😎)", icon: "🎰", categoryId: "exterior" },

    // Estacionamiento
    { id: "estacionamiento_incluido", label: "Parking included", icon: "🅿️", categoryId: "estacionamiento" },
    { id: "garaje_privado", label: "Private garage", icon: "🚗", categoryId: "estacionamiento" },
    { id: "garaje_cubierto", label: "Covered garage", icon: "🏠", categoryId: "estacionamiento" },
    { id: "estacionamiento_asignado", label: "Assigned parking", icon: "🆔", categoryId: "estacionamiento" },
    { id: "estacionamiento_visitantes", label: "Guest parking", icon: "👋", categoryId: "estacionamiento" },
    { id: "carga_ev", label: "EV charging", icon: "🔌", categoryId: "estacionamiento" },

    // Complejo
    { id: "piscina", label: "Pool", icon: "🏊", categoryId: "complejo" },
    { id: "jacuzzi_complejo", label: "Jacuzzi", icon: "🛁", categoryId: "complejo" },
    { id: "gimnasio", label: "Gym", icon: "💪", categoryId: "complejo" },
    { id: "casa_club", label: "Clubhouse", icon: "🏘️", categoryId: "complejo" },
    { id: "area_juegos", label: "Playground", icon: "🧸", categoryId: "complejo" },
    { id: "cancha_deportiva", label: "Sports court", icon: "🏀", categoryId: "complejo" },
    { id: "salon_eventos", label: "Event hall", icon: "🎉", categoryId: "complejo" },
    { id: "areas_verdes", label: "Green areas", icon: "🍃", categoryId: "complejo" },
    { id: "elevador", label: "Elevator", icon: "🛗", categoryId: "complejo" },
    { id: "acceso_discapacitados", label: "Accessible access", icon: "♿", categoryId: "complejo" },

    // Seguridad
    { id: "comunidad_cerrada", label: "Gated community", icon: "🏘️", categoryId: "seguridad" },
    { id: "acceso_controlado", label: "Controlled access", icon: "🛂", categoryId: "seguridad" },
    { id: "camaras_seguridad", label: "Security cameras", icon: "📹", categoryId: "seguridad" },
    { id: "seguridad_24_7", label: "24/7 security", icon: "👮", categoryId: "seguridad" },
    { id: "intercomunicador", label: "Intercom", icon: "📞", categoryId: "seguridad" },
    { id: "puerta_reforzada", label: "Reinforced door", icon: "🛡️", categoryId: "seguridad" },

    // Mascotas
    { id: "pet_friendly", label: "Pet-friendly", icon: "🐾", categoryId: "mascotas" },
    { id: "se_aceptan_perros", label: "Dogs allowed", icon: "🐕", categoryId: "mascotas" },
    { id: "se_aceptan_gatos", label: "Cats allowed", icon: "🐈", categoryId: "mascotas" },
    { id: "parque_mascotas", label: "Pet park", icon: "🌳", categoryId: "mascotas" },
    { id: "sin_mascotas", label: "No pets", icon: "🚫", categoryId: "mascotas" },

    // Smart Home
    { id: "cerradura_inteligente", label: "Smart lock", icon: "🔐", categoryId: "smart_home" },
    { id: "termostato_inteligente", label: "Smart thermostat", icon: "🌡️", categoryId: "smart_home" },
    { id: "camaras_exterior", label: "Exterior cameras", icon: "📹", categoryId: "smart_home" },
    { id: "iluminacion_inteligente", label: "Smart lighting", icon: "💡", categoryId: "smart_home" },
    { id: "timbre_inteligente", label: "Smart doorbell", icon: "🔔", categoryId: "smart_home" },
    { id: "fibra_internet", label: "Fiber internet prewire", icon: "🚀", categoryId: "smart_home" },

    // Accesibilidad
    { id: "acceso_silla_ruedas", label: "Wheelchair access", icon: "♿", categoryId: "accesibilidad" },
    { id: "puertas_amplias", label: "Wide doors", icon: "🚪", categoryId: "accesibilidad" },
    { id: "bano_accesible", label: "Accessible bathroom", icon: "🚿", categoryId: "accesibilidad" },
    { id: "rampas", label: "Ramps", icon: "♿", categoryId: "accesibilidad" },

    // Políticas
    { id: "contrato_flexible", label: "Flexible lease", icon: "📝", categoryId: "politicas" },
    { id: "rentas_corto_plazo", label: "Short-term rentals", icon: "🗓️", categoryId: "politicas" },
    { id: "rentas_largo_plazo", label: "Long-term rentals", icon: "🏢", categoryId: "politicas" },
    { id: "incluye_mantenimiento", label: "Maintenance included", icon: "🛠️", categoryId: "politicas" },
    { id: "incluye_hoa", label: "HOA included", icon: "💰", categoryId: "politicas" },
    { id: "incluye_basura", label: "Trash included", icon: "🗑️", categoryId: "politicas" },
    { id: "seccion_8_aceptada", label: "Section 8 accepted", icon: "📜", categoryId: "politicas" },
    { id: "no_fumar", label: "No smoking", icon: "🚭", categoryId: "politicas" },
];
