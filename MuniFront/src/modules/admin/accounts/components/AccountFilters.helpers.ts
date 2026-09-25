import type { AccountListFilters } from '../types/accounts.types';
import type { AccountFiltersValue } from './AccountFilters';

export function buildAccountFiltersFromQuery(
  filters: Partial<AccountListFilters>,
): AccountFiltersValue {
  return {
    search: filters.search ?? '',
    ...(filters.clientType ? { clientType: filters.clientType } : {}),
    ...(filters.clientActive !== undefined
      ? { clientActive: filters.clientActive }
      : {}),
    ...(filters.balanceStatus ? { balanceStatus: filters.balanceStatus } : {}),
  };
}
