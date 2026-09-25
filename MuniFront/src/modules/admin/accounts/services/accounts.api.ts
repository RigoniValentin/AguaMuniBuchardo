import { apiRequest } from '@/services/api';
import type {
  AccountListFilters,
  AccountListResult,
  AccountSummaryResponse,
  CreateAdjustmentPayload,
  MovementListFilters,
  MovementListResult,
  ReverseMovementPayload,
} from '../types/accounts.types';

function buildAccountsQuery(filters: Partial<AccountListFilters>): string {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.search) params.set('search', filters.search);
  if (filters.clientType) params.set('clientType', filters.clientType);
  if (filters.clientActive !== undefined) {
    params.set('clientActive', String(filters.clientActive));
  }
  if (filters.balanceStatus) params.set('balanceStatus', filters.balanceStatus);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function buildMovementsQuery(filters: Partial<MovementListFilters>): string {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.direction) params.set('direction', filters.direction);
  if (filters.movementType) params.set('movementType', filters.movementType);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const accountsApi = {
  list: (filters: Partial<AccountListFilters> = {}) =>
    apiRequest<AccountListResult>(`/accounts${buildAccountsQuery(filters)}`),

  getSummary: (clientId: string) =>
    apiRequest<AccountSummaryResponse>(`/accounts/${clientId}/summary`),

  listMovements: (clientId: string, filters: Partial<MovementListFilters> = {}) =>
    apiRequest<MovementListResult>(
      `/accounts/${clientId}/movements${buildMovementsQuery(filters)}`,
    ),

  createAdjustment: (clientId: string, payload: CreateAdjustmentPayload) =>
    apiRequest<{ movement: unknown }>(`/accounts/${clientId}/adjustments`, {
      method: 'POST',
      body: payload,
    }),

  reverseMovement: (movementId: string, payload: ReverseMovementPayload) =>
    apiRequest<{ reversal: unknown }>(`/accounts/movements/${movementId}/reverse`, {
      method: 'POST',
      body: payload,
    }),
};
