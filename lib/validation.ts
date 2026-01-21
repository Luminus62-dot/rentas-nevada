/**
 * Form validation utilities
 */

export function validateEmail(email: string): string | null {
  if (!email || email.trim() === "") {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Email format is invalid";
  }

  return null;
}

export function validatePassword(password: string): string | null {
  if (!password || password.trim() === "") {
    return "Password is required";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }

  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim() === "") {
    return `${fieldName} is required`;
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
    return `${fieldName} must be a valid number`;
  }

  if (allowZero && num < 0) {
    return `${fieldName} cannot be negative`;
  }

  if (!allowZero && num <= 0) {
    return `${fieldName} must be greater than 0`;
  }

  return null;
}

export function validateDate(dateString: string, fieldName: string, allowPast: boolean = false): string | null {
  if (!dateString || dateString.trim() === "") {
    return null; // Optional dates
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return `${fieldName} is not a valid date`;
  }

  if (!allowPast) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return `${fieldName} cannot be a past date`;
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
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
}

export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string
): string | null {
  if (value && value.trim().length > maxLength) {
    return `${fieldName} cannot exceed ${maxLength} characters`;
  }
  return null;
}
