/**
 * Utilities for consistent error handling
 */

/**
 * Converts Supabase errors into user-friendly messages
 */
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return "An unknown error occurred";
  }

  // Si es un string, devolverlo directamente
  if (typeof error === "string") {
    return error;
  }

  // Si es un objeto Error
  if (error instanceof Error) {
    const message = error.message;

    // Friendly messages for common Supabase errors
    if (message.includes("Invalid login credentials")) {
      return "Incorrect email or password";
    }

    if (message.includes("User already registered")) {
      return "This email is already registered";
    }

    if (message.includes("Email rate limit exceeded")) {
      return "Too many attempts. Please wait a few minutes";
    }

    if (message.includes("Password should be at least")) {
      return "Password must be at least 6 characters";
    }

    if (message.includes("duplicate key value")) {
      return "This record already exists";
    }

    if (message.includes("violates foreign key constraint")) {
      return "Reference error: related record does not exist";
    }

    if (message.includes("violates not-null constraint")) {
      return "Missing required fields";
    }

    if (message.includes("JWT")) {
      return "Session expired. Please sign in again";
    }

    if (message.includes("network") || message.includes("fetch")) {
      return "Connection error. Please check your internet and try again";
    }

    // Si no hay un mensaje amigable, devolver el mensaje original
    return message;
  }

  // Si es un objeto con propiedad message
  if (typeof error === "object" && "message" in error) {
    return getErrorMessage((error as { message: unknown }).message);
  }

  return "An unexpected error occurred";
}

/**
 * Safely handles async operation errors
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
      console.error("Unhandled error:", errorMessage, error);
    }
    return null;
  }
}

/**
 * Checks if an error is a Supabase error
 */
export function isSupabaseError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  return "message" in error && "code" in error;
}

/**
 * Gets the Supabase error code if present
 */
export function getErrorCode(error: unknown): string | null {
  if (isSupabaseError(error)) {
    return (error as { code?: string }).code || null;
  }
  return null;
}
