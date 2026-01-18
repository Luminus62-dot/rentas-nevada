# Rentas Nevada - Plataforma de Bienes Raíces

Plataforma moderna y premium para la publicación y gestión de rentas y bienes raíces. Desarrollada con **Next.js 16**, **Supabase** y **Tailwind CSS**.

## ✨ Características Principales

### 🎨 Diseño "Clean Premium"
- **UI de Alta Gama**: Interfaz minimalista con efectos de cristal (glassmorphism), fondos interactivos y tipografía refinada (Inter).
- **Modo Oscuro/Claro**: Soporte nativo para temas preferidos por el usuario.
- **Micro-interacciones**: Animaciones suaves, efectos de hover y feedback visual instantáneo.

### 👥 Gestión de Usuarios
- **Autenticación Robusta**: Registro e inicio de sesión seguro vía Supabase.
- **Roles de Usuario**:
  - **Inquilino (Tenant)**: Busca y contacta propiedades.
  - **Propietario (Landlord)**: Publica y gestiona sus listados.
  - **Administrador**: Control total de la plataforma.
- **Verificación de Identidad**: Sistema de verificación manual para aumentar la confianza en la plataforma.
- **Dashboard Personal**: Panel para ver listados propios, leads recibidos y estado de cuenta.

### 🏠 Gestión de Propiedades
- **Publicación Avanzada**: Flujo de creación de anuncios con carga de imágenes y validación.
- **Búsqueda y Filtros**: Explorador de propiedades con filtros por precio, ubicación y tipo.
- **Detalle de Propiedad**: Página de producto rica con galería de imágenes, mapa y formulario de contacto (Lead Form).
- **Estados de Anuncio**:
  - `Pendiente`: Esperando aprobación.
  - `Verificado`: Visible para todos.
  - `Archivado`: Oculto temporalmente por el usuario o admin.

### 🛡️ Panel de Administración (Admin V2)
Un centro de comando profesional para los administradores del sitio (`/admin`).
- **Dashboard de Estadísticas**: Vista general en tiempo real de usuarios, propiedades y solicitudes.
- **Gestión de Usuarios**:
  - Lista completa de usuarios con búsqueda inteligente.
  - Visualización de datos sensibles (Email, ID, Fecha de registro).
  - Herramienta de verificación de identidad con un clic.
- **Gestión de Contenido**:
  - Moderación de anuncios (Aprobar, Rechazar, Archivar).
  - Destacar propiedades premium.
- **Solicitudes de Servicio**: Sistema de tickets para gestionar peticiones de verificación o soporte.

## 🛠️ Tecnologías

- **Frontend**: Next.js 16 (App Router), React 19.
- **Estilos**: Tailwind CSS v4, Framer Motion (conceptos base).
- **Backend/DB**: Supabase (PostgreSQL, Auth, Storage, RLS).
- **Seguridad**: Row Level Security (RLS) y funciones RPC seguras para datos administrativos.

## 🚀 Instalación y Configuración

1.  **Clonar el repositorio**
2.  **Configurar Variables de Entorno** (`.env.local`)
    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_anonima
    ```
3.  **Instalar dependencias**
    ```bash
    npm install
    ```
4.  **Iniciar servidor de desarrollo**
    ```bash
    npm run dev
    ```

## 🔐 Políticas de Seguridad
El sistema utiliza **RLS (Row Level Security)** para garantizar que:
- Los usuarios solo pueden editar su propio perfil y propiedades.
- Los datos sensibles (emails) solo son accesibles por el Administrador mediante funciones seguras.
- Las propiedades "Archivadas" o "Pendientes" no son visibles en el feed público.
