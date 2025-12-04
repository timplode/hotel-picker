export function isPasscode(input: string): boolean {
  return input.length === 6 && /^[a-z]{6}$/.test(input.toLowerCase());
}
