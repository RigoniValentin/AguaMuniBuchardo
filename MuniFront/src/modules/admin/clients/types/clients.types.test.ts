import { describe, it, expect } from 'vitest';
import {
  CLIENT_TYPE_LABEL,
  CLIENT_TYPE_TONE,
  formatAddress,
} from './clients.types';

describe('client type metadata', () => {
  it('maps LOCAL to Local label and success tone', () => {
    expect(CLIENT_TYPE_LABEL.LOCAL).toBe('Local');
    expect(CLIENT_TYPE_TONE.LOCAL).toBe('success');
  });

  it('maps NO_LOCAL to No local label and warning tone', () => {
    expect(CLIENT_TYPE_LABEL.NO_LOCAL).toBe('No local');
    expect(CLIENT_TYPE_TONE.NO_LOCAL).toBe('warning');
  });

  it('maps JUBILADO to Jubilado label and info tone', () => {
    expect(CLIENT_TYPE_LABEL.JUBILADO).toBe('Jubilado');
    expect(CLIENT_TYPE_TONE.JUBILADO).toBe('info');
  });

  it('maps AYUDA_SOCIAL to Ayuda social label and primary tone', () => {
    expect(CLIENT_TYPE_LABEL.AYUDA_SOCIAL).toBe('Ayuda social');
    expect(CLIENT_TYPE_TONE.AYUDA_SOCIAL).toBe('primary');
  });
});

describe('formatAddress', () => {
  it('includes street and number', () => {
    const result = formatAddress({
      street: 'Av. San Martín',
      number: '123',
      locality: 'Buchardo',
    });
    expect(result).toContain('Av. San Martín 123');
    expect(result).toContain('Buchardo');
  });

  it('omits floor/apartment when not provided', () => {
    const result = formatAddress({
      street: 'Belgrano',
      number: '456',
      locality: 'Buchardo',
    });
    expect(result).not.toContain('Piso');
    expect(result).not.toContain('null');
  });

  it('includes floor and apartment when present', () => {
    const result = formatAddress({
      street: 'Belgrano',
      number: '456',
      floor: '2',
      apartment: 'B',
      locality: 'Buchardo',
    });
    expect(result).toContain('Piso 2');
    expect(result).toContain('B');
  });

  it('includes neighborhood when provided', () => {
    const result = formatAddress({
      street: 'Belgrano',
      number: '456',
      neighborhood: 'Centro',
      locality: 'Buchardo',
    });
    expect(result).toContain('Centro');
  });
});
