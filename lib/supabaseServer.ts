import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Missing environment variable: NEXT_PUBLIC_SUPABASE_URL. " +
    "Please check your .env.local file."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
    "Please check your .env.local file."
  );
}

/**
 * Crea un cliente de Supabase para usar en Server Components.
 * Este cliente maneja correctamente las cookies y la sesión del usuario.
 * 
 * IMPORTANTE: Este cliente debe crearse dentro de cada Server Component
 * o Server Action, no como una exportación global, porque `cookies()` 
 * debe llamarse en el contexto correcto del request.
 * 
 * @example
 * ```tsx
 * export default async function MyServerComponent() {
 *   const supabase = await createSupabaseServerClient();
 *   const { data } = await supabase.from('table').select();
 *   // ...
 * }
 * ```
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: any) {
        try {
          cookiesToSet.forEach(({ name, value, options }: any) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // La llamada a `set` puede fallar si se llama después de que
          // se haya enviado la respuesta. Esto es normal en algunos casos.
        }
      },
    },
  });
}
