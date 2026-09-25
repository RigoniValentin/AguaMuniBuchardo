import { apiRequest } from '@/services/api';
import type {
  Client,
  ClientListFilters,
  ClientListResult,
  CreateClientPayload,
  UpdateClientPayload,
} from '../types/clients.types';

function buildQuery(filters: Partial<ClientListFilters>): string {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.search) params.set('search', filters.search);
  if (filters.clientType) params.set('clientType', filters.clientType);
  if (filters.active !== undefined) params.set('active', String(filters.active));
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const clientsApi = {
  list: (filters: Partial<ClientListFilters> = {}) =>
    apiRequest<ClientListResult>(`/clients${buildQuery(filters)}`),

  get: (id: string) => apiRequest<{ client: Client }>(`/clients/${id}`),

  create: (payload: CreateClientPayload) =>
    apiRequest<{ client: Client }>('/clients', {
      method: 'POST',
      body: payload,
    }),

  update: (id: string, payload: UpdateClientPayload) =>
    apiRequest<{ client: Client }>(`/clients/${id}`, {
      method: 'PATCH',
      body: payload,
    }),
};
