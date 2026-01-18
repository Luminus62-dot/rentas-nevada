/**
 * Utilidades de validación para formularios
 */

export function validateEmail(email: string): string | null {
  if (!email || email.trim() === "") {
    return "El email es requerido";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "El email no tiene un formato válido";
  }

  return null;
}

export function validatePassword(password: string): string | null {
  if (!password || password.trim() === "") {
    return "La contraseña es requerida";
  }

  if (password.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres";
  }

  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim() === "") {
    return `${fieldName} es requerido`;
  }
  return null;
}

export function validatePositiveNumber(
  value: number | string,
  fieldName: string,
  allowZero: boolean = false
): string | null {
  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) {
    return `${fieldName} debe ser un número válido`;
  }

  if (allowZero && num < 0) {
    return `${fieldName} no puede ser negativo`;
  }

  if (!allowZero && num <= 0) {
    return `${fieldName} debe ser mayor a 0`;
  }

  return null;
}

export function validateDate(dateString: string, fieldName: string, allowPast: boolean = false): string | null {
  if (!dateString || dateString.trim() === "") {
    return null; // Fechas opcionales
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return `${fieldName} no es una fecha válida`;
  }

  if (!allowPast) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return `${fieldName} no puede ser una fecha pasada`;
    }
  }

  return null;
}

export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string
): string | null {
  if (value && value.trim().length < minLength) {
    return `${fieldName} debe tener al menos ${minLength} caracteres`;
  }
  return null;
}

export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string
): string | null {
  if (value && value.trim().length > maxLength) {
    return `${fieldName} no puede tener más de ${maxLength} caracteres`;
  }
  return null;
}