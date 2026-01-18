/**
 * Utilidades para manejo consistente de errores
 */

/**
 * Convierte errores de Supabase en mensajes amigables para el usuario
 */
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return "Ocurrió un error desconocido";
  }

  // Si es un string, devolverlo directamente
  if (typeof error === "string") {
    return error;
  }

  // Si es un objeto Error
  if (error instanceof Error) {
    const message = error.message;

    // Mensajes amigables para errores comunes de Supabase
    if (message.includes("Invalid login credentials")) {
      return "Email o contraseña incorrectos";
    }

    if (message.includes("User already registered")) {
      return "Este email ya está registrado";
    }

    if (message.includes("Email rate limit exceeded")) {
      return "Demasiados intentos. Por favor espera unos minutos";
    }

    if (message.includes("Password should be at least")) {
      return "La contraseña debe tener al menos 6 caracteres";
    }

    if (message.includes("duplicate key value")) {
      return "Este registro ya existe";
    }

    if (message.includes("violates foreign key constraint")) {
      return "Error de referencia: el registro relacionado no existe";
    }

    if (message.includes("violates not-null constraint")) {
      return "Faltan campos requeridos";
    }

    if (message.includes("JWT")) {
      return "Sesión expirada. Por favor inicia sesión nuevamente";
    }

    if (message.includes("network") || message.includes("fetch")) {
      return "Error de conexión. Por favor verifica tu internet e intenta nuevamente";
    }

    // Si no hay un mensaje amigable, devolver el mensaje original
    return message;
  }

  // Si es un objeto con propiedad message
  if (typeof error === "object" && "message" in error) {
    return getErrorMessage((error as { message: unknown }).message);
  }

  return "Ocurrió un error inesperado";
}

/**
 * Maneja errores de operaciones async de forma segura
 */
export async function handleAsyncError<T>(
  operation: () => Promise<T>,
  onError?: (error: string) => void
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    if (onError) {
      onError(errorMessage);
    } else {
      console.error("Error no manejado:", errorMessage, error);
    }
    return null;
  }
}

/**
 * Verifica si un error es un error de Supabase
 */
export function isSupabaseError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  return "message" in error && "code" in error;
}

/**
 * Obtiene el código de error de Supabase si existe
 */
export function getErrorCode(error: unknown): string | null {
  if (isSupabaseError(error)) {
    return (error as { code?: string }).code || null;
  }
  return null;
}