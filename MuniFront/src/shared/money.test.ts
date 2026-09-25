import { describe, it, expect } from 'vitest';
import {
  formatMinorAsARS,
  parseArsToMinor,
  formatPercentage,
  formatArsDisplay,
  normalizeArsInput,
  arsToWords,
} from './money';

describe('money helpers', () => {
  it('formats minor units as ARS', () => {
    expect(formatMinorAsARS(1_000_000)).toMatch(/10\.000,00/);
    expect(formatMinorAsARS(0)).toMatch(/0,00/);
    expect(formatMinorAsARS(-5000)).toContain('-');
  });

  it('parses ARS input into minor units', () => {
    expect(parseArsToMinor(12500)).toBe(1_250_000);
    expect(parseArsToMinor('12500')).toBe(1_250_000);
    expect(parseArsToMinor('12500.50')).toBe(1_250_050);
    expect(parseArsToMinor('12500,50')).toBe(1_250_050);
    expect(parseArsToMinor('not-a-number')).toBeNaN();
  });

  it('formats percentage', () => {
    expect(formatPercentage(0)).toMatch(/0\s?%/);
    expect(formatPercentage(50)).toMatch(/-?50\s?%/);
    expect(formatPercentage(-50)).toMatch(/-\s?50\s?%/);
    expect(formatPercentage(40)).toMatch(/40\s?%/);
  });
});

describe('formatArsDisplay', () => {
  it('formats with thousands separators', () => {
    expect(formatArsDisplay('')).toBe('');
    expect(formatArsDisplay('1')).toBe('1');
    expect(formatArsDisplay('1500')).toBe('1.500');
    expect(formatArsDisplay('1250000')).toBe('1.250.000');
    expect(formatArsDisplay('1234567')).toBe('1.234.567');
  });

  it('preserves a single optional comma and the partial decimal portion', () => {
    expect(formatArsDisplay('1500,')).toBe('1.500,');
    expect(formatArsDisplay('1500,5')).toBe('1.500,5');
    expect(formatArsDisplay('1500,50')).toBe('1.500,50');
  });
});

describe('normalizeArsInput', () => {
  it('strips non numeric chars and caps decimals to 2', () => {
    expect(normalizeArsInput('')).toBe('');
    expect(normalizeArsInput('1.500,50')).toBe('1500,50');
    expect(normalizeArsInput('1,234')).toBe('1,23');
    expect(normalizeArsInput('15.000')).toBe('15000');
    expect(normalizeArsInput('1,2,3')).toBe('1,23');
    expect(normalizeArsInput('abc 12 34')).toBe('1234');
  });
});

describe('arsToWords', () => {
  it('renders common amounts in Spanish with cents over 100', () => {
    expect(arsToWords(0)).toBe('Cero pesos con 00/100');
    expect(arsToWords(1)).toBe('Un peso con 00/100');
    expect(arsToWords(1.5)).toBe('Un peso con 50/100');
    expect(arsToWords(1500)).toMatch(/Mil quinientos pesos con 00\/100/);
    expect(arsToWords(1500.5)).toMatch(/Mil quinientos pesos con 50\/100/);
    expect(arsToWords(1234567.89)).toMatch(/Un millón doscientos treinta y cuatro mil quinientos sesenta y siete pesos con 89\/100/);
  });

  it('returns empty for invalid or negative values', () => {
    expect(arsToWords(NaN)).toBe('');
    expect(arsToWords(-1)).toBe('');
  });
});
