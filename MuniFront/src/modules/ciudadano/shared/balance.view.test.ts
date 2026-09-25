import { describe, it, expect } from 'vitest';
import {
  describeCitizenBalance,
} from '@/modules/ciudadano/shared/balance.view';

describe('describeCitizenBalance', () => {
  it('positive balance → DEBT + "Tenés una deuda de $X"', () => {
    const r = describeCitizenBalance(1_000_000);
    expect(r.status).toBe('DEBT');
    expect(r.label).toMatch(/Debe/);
    expect(r.friendly).toMatch(/Tenés una deuda de/);
  });

  it('negative balance → CREDIT + "Tenés $X a favor"', () => {
    const r = describeCitizenBalance(-500_000);
    expect(r.status).toBe('CREDIT');
    expect(r.label).toMatch(/Saldo a favor/);
    expect(r.friendly).toMatch(/a favor/);
  });

  it('zero balance → SETTLED + "Tu cuenta está al día"', () => {
    const r = describeCitizenBalance(0);
    expect(r.status).toBe('SETTLED');
    expect(r.friendly).toBe('Tu cuenta está al día');
  });

  it('falls back to SETTLED for non-finite input', () => {
    const r = describeCitizenBalance(Number.NaN);
    expect(r.status).toBe('SETTLED');
    expect(r.friendly).toBe('Tu cuenta está al día');
  });
});