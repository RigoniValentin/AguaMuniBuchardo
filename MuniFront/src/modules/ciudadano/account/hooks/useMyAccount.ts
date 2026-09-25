import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiRequest } from '@/services/api';
import type {
  AccountSummaryResponse,
  AccountMovement,
  MovementListFilters,
  MovementListResult,
} from '@/modules/admin/accounts/types/accounts.types';

/**
 * Type alias to express that the citizen receives the SAME shape as staff
 * for /api/accounts/me/summary (the controller reuses the existing DTO).
 */
export type CitizenAccountSummaryResponse = AccountSummaryResponse;

function buildMovementsQuery(filters: Partial<MovementListFilters>): string {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.direction) params.set('direction', filters.direction);
  if (filters.movementType) params.set('movementType', filters.movementType);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const myAccountKeys = {
  all: ['my-account'] as const,
  summary: () => [...myAccountKeys.all, 'summary'] as const,
  movements: () => [...myAccountKeys.all, 'movements'] as const,
  movementList: (filters: Partial<MovementListFilters>) =>
    [...myAccountKeys.movements(), filters] as const,
};

export function useMyAccountSummary(enabled = true) {
  return useQuery({
    queryKey: myAccountKeys.summary(),
    queryFn: () => apiRequest<CitizenAccountSummaryResponse>('/accounts/me/summary'),
    enabled,
    retry: (failureCount, error) => {
      const code = (error as { code?: string } | null)?.code;
      if (code === 'CLIENT_NOT_LINKED' || code === 'VALIDATION_ERROR') return false;
      return failureCount < 2;
    },
  });
}

export function useMyAccountMovements(
  filters: Partial<MovementListFilters> = { page: 1, limit: 5 },
  enabled = true,
) {
  return useQuery({
    queryKey: myAccountKeys.movementList(filters),
    queryFn: () =>
      apiRequest<MovementListResult>(
        `/accounts/me/movements${buildMovementsQuery(filters)}`,
      ),
    enabled,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      const code = (error as { code?: string } | null)?.code;
      if (code === 'CLIENT_NOT_LINKED' || code === 'VALIDATION_ERROR') return false;
      return failureCount < 2;
    },
  });
}

export type { AccountMovement };