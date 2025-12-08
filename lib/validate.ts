export function isPasscode(input: string): boolean {
  return input.length === 6 && /^[a-z0-9]{6}$/.test(input.toLowerCase());
}

export function isValidPhoneNumber(input: string): boolean {
  // Remove all non-digit characters
  const digitsOnly = input.replace(/\D/g, '');
  // Check if exactly 10 digits
  return digitsOnly.length >= 10;
}
