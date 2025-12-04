export function filterPasscode(input: string): string {
  return input.toLowerCase().replace(/[^a-z]/g, '').slice(0, 6);
}
