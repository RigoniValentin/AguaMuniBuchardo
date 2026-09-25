import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { clientsApi } from '../services/clients.api';
import type { ClientListFilters } from '../types/clients.types';

export const clientsKeys = {
  all: ['clients'] as const,
  lists: () => [...clientsKeys.all, 'list'] as const,
  list: (filters: Partial<ClientListFilters>) =>
    [...clientsKeys.lists(), filters] as const,
  details: () => [...clientsKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientsKeys.details(), id] as const,
};

export function useClients(filters: Partial<ClientListFilters>) {
  return useQuery({
    queryKey: clientsKeys.list(filters),
    queryFn: () => clientsApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: clientsKeys.detail(id ?? ''),
    queryFn: () => clientsApi.get(id as string),
    enabled: Boolean(id),
  });
}
