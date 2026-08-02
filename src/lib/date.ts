// Parses a `type="date"` input value (YYYY-MM-DD) as local midnight instead of UTC midnight,
// so it round-trips correctly when later formatted in the server/browser's local time zone.
export function parseDateInput(value: string): Date {
  return new Date(`${value}T00:00:00`);
}
