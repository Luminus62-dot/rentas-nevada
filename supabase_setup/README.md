# Documentación de Configuración (Supabase & Setup)

Esta carpeta contiene los scripts SQL y manuales necesarios para configurar la base de datos y el entorno del proyecto "Rentas Nevada".

## Scripts SQL

| Archivo | Descripción |
| :--- | :--- |
| `admin_policy_update.sql` | Actualiza y refina las políticas RLS para garantizar el acceso correcto de administradores. |
| `admin_user_policies.sql` | Políticas iniciales para permitir a los administradores ver y gestionar todos los perfiles. |
| `delete_auth_user.sql` | Script de utilidad para la eliminación segura de usuarios desde la tabla de autenticación. |
| `fix_admin_role.sql` | Corrige manualmente el rol de usuarios específicos para asignar privilegios de administrador. |
| `fix_rls_recursion.sql` | Resuelve errores de recursión infinita en las políticas RLS de Supabase. |
| `get_users_admin.sql` | Función SQL que permite al panel de administración listar usuarios evitando limitaciones de RLS. |
| `schema_dashboards.sql` | Define las tablas de `favorites` (Favoritos) y `reports` (Reportes). |
| `schema_reviews.sql` | Define la estructura para el sistema de Reseñas y Calificaciones. |
| `schema_storage.sql` | Configura el bucket de Storage para fotos de propiedades y añade la columna `images` a `listings`. |
| `schema_update.sql` | Actualizaciones generales a la tabla de `listings` (propiedades). |
| `schema_verified_users.sql` | Añade el campo `is_verified` a la tabla de perfiles para el flujo de verificación. |

## Documentación de Entorno

- `ENV_SETUP.md`: Guía paso a paso para configurar las variables de entorno (`.env.local`).
- `REVISION.md`: Registro detallado de la auditoría de estilos, componentes y funcionalidades del proyecto.
