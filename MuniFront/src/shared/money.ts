/**
 * Frontend money helpers.
 *
 * The backend always returns integers in MINOR units (cents in ARS).
 * This module is the only place in the frontend that handles currency.
 * Use `Intl.NumberFormat` with locale 'es-AR' for display.
 */

export const MINOR_UNITS_PER_MAJOR = 100;

const ARS_FORMATTER = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const PERCENT_FORMATTER = new Intl.NumberFormat('es-AR', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Convert integer minor units to a formatted ARS currency string.
 * Example: 1000000 -> "$ 10.000,00".
 */
export function formatMinorAsARS(minor: number): string {
  if (!Number.isFinite(minor)) return ARS_FORMATTER.format(0);
  return ARS_FORMATTER.format(minor / MINOR_UNITS_PER_MAJOR);
}

/**
 * Convert integer minor units to major units (float, for editing).
 */
export function toMajorUnits(minor: number): number {
  return minor / MINOR_UNITS_PER_MAJOR;
}

/**
 * Parse a user-entered ARS string into integer minor units.
 *
 * Accepts:
 *   "12500"        -> 12500 (interpreted as MAJOR units? see below)
 *
 * Because prices are always displayed in MAJOR units to the user, the canonical
 * parser interprets an empty/non-numeric value and returns NaN, but the
 * `parseArsToMinor` function expects MAJOR units input (e.g. 12500 -> 1250000).
 */
export function parseArsToMinor(ars: number | string): number {
  const num = typeof ars === 'string' ? Number(ars.replace(',', '.')) : ars;
  if (!Number.isFinite(num)) return Number.NaN;
  return Math.round(num * MINOR_UNITS_PER_MAJOR);
}

/**
 * Format an integer percentage as a localized percentage string.
 * Example: -50 -> "-50%", 0 -> "0%", 33.5 handled by caller via Math.round.
 */
export function formatPercentage(percentage: number): string {
  if (!Number.isFinite(percentage)) return PERCENT_FORMATTER.format(0);
  return PERCENT_FORMATTER.format(percentage / 100);
}

/**
 * Format a minor amount plus its sign for diagnostic purposes.
 */
export function formatMinorWithSign(minor: number): string {
  const formatted = formatMinorAsARS(Math.abs(minor));
  if (minor > 0) return `+${formatted}`;
  if (minor < 0) return `-${formatted}`;
  return formatted;
}

const ARS_INPUT_UNITS = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
const ARS_INPUT_TEENS = [
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince',
  'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
];
const ARS_INPUT_TENS = [
  '', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta',
  'sesenta', 'setenta', 'ochenta', 'noventa',
];
const ARS_INPUT_VEINTI = [
  '', 'ventiuno', 'ventidós', 'ventitrés', 'venticuatro',
  'venticinco', 'ventiséis', 'ventisiete', 'ventiocho', 'ventinueve',
];
const ARS_INPUT_HUNDREDS = [
  '', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos',
  'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos',
];

function below1000ToWords(n: number): string {
  if (n <= 0) return '';
  if (n === 100) return 'cien';
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  let out = ARS_INPUT_HUNDREDS[hundreds];
  if (hundreds > 0 && rest > 0) out += ' ';
  if (rest > 0) {
    if (rest < 10) {
      out += ARS_INPUT_UNITS[rest];
    } else if (rest < 20) {
      out += ARS_INPUT_TEENS[rest - 10];
    } else if (rest < 30) {
      out += ARS_INPUT_VEINTI[rest - 20];
    } else {
      const t = Math.floor(rest / 10);
      const u = rest % 10;
      out += ARS_INPUT_TENS[t];
      if (u > 0) out += ' y ' + ARS_INPUT_UNITS[u];
    }
  }
  return out;
}

function numberToSpanishWords(n: number): string {
  if (n === 0) return 'cero';
  let remaining = Math.floor(n);
  const parts: string[] = [];

  if (remaining >= 1_000_000_000) {
    const count = Math.floor(remaining / 1_000_000_000);
    remaining = remaining % 1_000_000_000;
    if (count === 1) parts.push('mil millones');
    else parts.push(`${below1000ToWords(count)} mil millones`);
  }
  if (remaining >= 1_000_000) {
    const count = Math.floor(remaining / 1_000_000);
    remaining = remaining % 1_000_000;
    if (count === 1) parts.push('un millón');
    else parts.push(`${below1000ToWords(count)} millones`);
  }
  if (remaining >= 1000) {
    const count = Math.floor(remaining / 1000);
    remaining = remaining % 1000;
    if (count === 1) parts.push('mil');
    else parts.push(`${below1000ToWords(count)} mil`);
  }
  if (remaining > 0) parts.push(below1000ToWords(remaining));

  return parts.join(' ').trim();
}

/**
 * Convert an ARS major-unit amount into Spanish words with `/100` cents.
 * Example: 1500.5 -> "Mil quinientos pesos con 50/100".
 */
export function arsToWords(major: number): string {
  if (!Number.isFinite(major) || major < 0) return '';
  const cents = Math.round((major - Math.floor(major)) * 100);
  const pesos = Math.floor(major);
  const centsStr = String(cents).padStart(2, '0');
  const pesosWords = numberToSpanishWords(pesos);
  if (pesos === 1) {
    return `Un peso con ${centsStr}/100`;
  }
  const phrase = `${pesosWords} pesos con ${centsStr}/100`;
  return phrase.charAt(0).toUpperCase() + phrase.slice(1);
}

/**
 * Normalize raw user input for an ARS amount field:
 * keeps digits and a single optional decimal separator (comma), max 2 decimals.
 * Empty string is preserved.
 */
export function normalizeArsInput(raw: string): string {
  if (raw === '') return '';
  const cleaned = raw.replace(/[^\d.,]/g, '');
  const firstComma = cleaned.indexOf(',');
  if (firstComma !== -1) {
    const intPart = cleaned.slice(0, firstComma).replace(/[.,]/g, '');
    const decPart = cleaned.slice(firstComma + 1).replace(/[.,]/g, '').slice(0, 2);
    return intPart === '' ? `,${decPart}` : `${intPart},${decPart}`;
  }
  return cleaned.replace(/\./g, '');
}

/**
 * Format a normalized ARS input string for display:
 *   "1500"   -> "1.500"
 *   "1500,"  -> "1.500,"
 *   "1500,5" -> "1.500,5"
 *   "1234567" -> "1.234.567"
 *   ""        -> ""
 */
export function formatArsDisplay(normalized: string): string {
  if (normalized === '') return '';
  const i = normalized.indexOf(',');
  let intPart: string;
  let decPart: string;
  if (i === -1) {
    intPart = normalized;
    decPart = '';
  } else {
    intPart = normalized.slice(0, i);
    decPart = normalized.slice(i + 1);
  }
  if (intPart === '' && decPart === '') return '';
  const intFmt = intPart === ''
    ? '0'
    : intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (i === -1) return intFmt;
  if (decPart === '') return `${intFmt},`;
  return `${intFmt},${decPart}`;
}
