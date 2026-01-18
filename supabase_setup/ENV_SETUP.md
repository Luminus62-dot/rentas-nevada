# Configuración de Variables de Entorno

## Variables Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Supabase Configuration
# Obtén estos valores desde tu proyecto en https://supabase.com/dashboard

# URL de tu proyecto Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url

# Clave anónima pública de Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Cómo obtener los valores

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **Settings** → **API**
3. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Nota de Seguridad

⚠️ **NUNCA** expongas la `service_role_key` en el cliente. Solo úsala en el servidor si es absolutamente necesario.

## Verificación

Si las variables no están configuradas correctamente, la aplicación mostrará un error claro al iniciar indicando qué variable falta.