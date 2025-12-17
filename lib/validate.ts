export function isPasscode(input: string): boolean {
  return input.length === 6 && /^[a-z0-9]{6}$/.test(input.toLowerCase());
}

export function isValidPhoneNumber(input: string): boolean {
  // Remove all non-digit characters
  const digitsOnly = input.replace(/\D/g, '');
  // Check if exactly 10 digits
  return digitsOnly.length >= 10;
}

export function isValidEmail(input: string): boolean {
  // Basic email validation using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input.trim());
}

export function isMinLength2(input: string): boolean {
  // Validate text is at least 2 characters long
  return input.trim().length >= 2;
}
