import type { AccountStatus } from '@/modules/admin/accounts/types/accounts.types';
import { formatMinorAsARS } from '@/shared/money';

export interface CitizenBalance {
  status: AccountStatus;
  label: string;
  /** Plain-language phrase shown on the dashboard hero card. */
  friendly: string;
}

/**
 * Convert a citizen's balance into a friendly sentence. The citizen should
 * never have to interpret positive/negative numbers.
 *
 *   balance > 0 → "Tenés una deuda de $X"
 *   balance < 0 → "Tenés $X a favor"
 *   balance = 0 → "Tu cuenta está al día"
 */
export function describeCitizenBalance(balanceMinor: number): CitizenBalance {
  if (!Number.isFinite(balanceMinor)) {
    return {
      status: 'SETTLED',
      label: 'Al día',
      friendly: 'Tu cuenta está al día',
    };
  }
  if (balanceMinor > 0) {
    return {
      status: 'DEBT',
      label: `Debe ${formatMinorAsARS(balanceMinor)}`,
      friendly: `Tenés una deuda de ${formatMinorAsARS(balanceMinor)}`,
    };
  }
  if (balanceMinor < 0) {
    return {
      status: 'CREDIT',
      label: `Saldo a favor ${formatMinorAsARS(Math.abs(balanceMinor))}`,
      friendly: `Tenés ${formatMinorAsARS(Math.abs(balanceMinor))} a favor`,
    };
  }
  return {
    status: 'SETTLED',
    label: 'Al día',
    friendly: 'Tu cuenta está al día',
  };
}