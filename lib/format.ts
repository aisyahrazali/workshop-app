/** Formats a price stored in sen as Malaysian Ringgit, e.g. 850 → "RM 8.50". */
export function formatMYR(cents: number): string {
  return `RM ${(cents / 100).toFixed(2)}`;
}
