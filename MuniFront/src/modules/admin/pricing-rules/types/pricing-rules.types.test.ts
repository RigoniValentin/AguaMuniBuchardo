import { describe, it, expect } from 'vitest';
import {
  CLIENT_TYPE_LABEL,
  PRICING_SCOPE_LABEL,
  PRICING_SCOPE_OPTIONS,
} from './pricing-rules.types';

describe('pricing-rules.types', () => {
  it('has labels for all client types', () => {
    expect(CLIENT_TYPE_LABEL.LOCAL).toBe('Local');
    expect(CLIENT_TYPE_LABEL.JUBILADO).toBe('Jubilado');
    expect(CLIENT_TYPE_LABEL.NO_LOCAL).toBe('No local');
    expect(CLIENT_TYPE_LABEL.AYUDA_SOCIAL).toBe('Ayuda social');
  });

  it('has labels for all scopes', () => {
    for (const opt of PRICING_SCOPE_OPTIONS) {
      expect(PRICING_SCOPE_LABEL[opt.value]).toBe(opt.label);
    }
  });
});
