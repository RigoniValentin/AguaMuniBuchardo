import { describe, it, expect } from 'vitest';
import {
  CITIZEN_CLIENT_TYPE_LABEL,
  formatCitizenAddress,
} from '@/modules/ciudadano/shared/client.types';

describe('client.types — display helpers', () => {
  it('renders all client types as friendly labels', () => {
    expect(CITIZEN_CLIENT_TYPE_LABEL.LOCAL).toBe('Local');
    expect(CITIZEN_CLIENT_TYPE_LABEL.JUBILADO).toBe('Jubilado');
    expect(CITIZEN_CLIENT_TYPE_LABEL.NO_LOCAL).toBe('No local');
    expect(CITIZEN_CLIENT_TYPE_LABEL.AYUDA_SOCIAL).toBe('Ayuda social');
  });

  it('formats address with all components', () => {
    const result = formatCitizenAddress({
      street: 'Av. San Martín',
      number: '123',
      floor: '2',
      apartment: 'B',
      neighborhood: 'Centro',
      locality: 'Buchardo',
      postalCode: 'X5000',
      references: null,
    });
    expect(result).toContain('Av. San Martín 123');
    expect(result).toContain('Centro');
    expect(result).toContain('Buchardo');
  });

  it('handles empty optional address parts', () => {
    const result = formatCitizenAddress({
      street: 'Belgrano',
      number: '999',
      floor: null,
      apartment: null,
      neighborhood: null,
      locality: 'Buchardo',
      postalCode: null,
      references: null,
    });
    expect(result).toBe('Belgrano 999, Buchardo');
  });
});