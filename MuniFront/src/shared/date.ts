/**
 * Format an ISO date string as DD/MM/YYYY in es-AR locale.
 * Shared between multiple citizen pages.
 */
export function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}
