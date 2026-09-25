import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { accountsApi } from '../services/accounts.api';
import type {
  AccountListFilters,
  MovementListFilters,
} from '../types/accounts.types';

export const accountsKeys = {
  all: ['accounts'] as const,
  lists: () => [...accountsKeys.all, 'list'] as const,
  list: (filters: Partial<AccountListFilters>) =>
    [...accountsKeys.lists(), filters] as const,
  summaries: () => [...accountsKeys.all, 'summary'] as const,
  summary: (clientId: string) => [...accountsKeys.summaries(), clientId] as const,
  movements: () => [...accountsKeys.all, 'movements'] as const,
  movementList: (clientId: string, filters: Partial<MovementListFilters>) =>
    [...accountsKeys.movements(), clientId, filters] as const,
};

export function useAccounts(filters: Partial<AccountListFilters>) {
  return useQuery({
    queryKey: accountsKeys.list(filters),
    queryFn: () => accountsApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAccountSummary(clientId: string | undefined) {
  return useQuery({
    queryKey: accountsKeys.summary(clientId ?? ''),
    queryFn: () => accountsApi.getSummary(clientId as string),
    enabled: Boolean(clientId),
  });
}

export function useAccountMovements(
  clientId: string | undefined,
  filters: Partial<MovementListFilters> = { page: 1, limit: 20 },
) {
  return useQuery({
    queryKey: accountsKeys.movementList(clientId ?? '', filters),
    queryFn: () => accountsApi.listMovements(clientId as string, filters),
    enabled: Boolean(clientId),
    placeholderData: keepPreviousData,
  });
}
