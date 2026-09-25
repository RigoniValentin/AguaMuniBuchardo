import { describeBalance } from './accounts.types';

describe('accounts.types — describeBalance', () => {
  it('renders positive balance as "Debe $X"', () => {
    expect(describeBalance(500_000).kind).toBe('DEBT');
    // Intl.NumberFormat('es-AR', currency) inserts a NBSP (\u00A0) between "$" and the amount.
    expect(describeBalance(500_000).label).toMatch(
      /^Debe \$\u00A05\.000,00$/,
    );
  });

  it('renders negative balance as "Saldo a favor $X"', () => {
    expect(describeBalance(-250_000).kind).toBe('CREDIT');
    expect(describeBalance(-250_000).label).toMatch(
      /^Saldo a favor \$\u00A02\.500,00$/,
    );
  });

  it('renders zero balance as "Al día"', () => {
    expect(describeBalance(0).kind).toBe('SETTLED');
    expect(describeBalance(0).label).toBe('Al día');
  });

  it('falls back to SETTLED for non-finite input', () => {
    expect(describeBalance(Number.NaN).kind).toBe('SETTLED');
    expect(describeBalance(Number.POSITIVE_INFINITY).kind).toBe('SETTLED');
  });
});
