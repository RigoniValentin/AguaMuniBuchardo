import { apiRequest } from '@/services/api';
import type {
  CreatePricingRulePayload,
  PricingRule,
  PricingRuleListFilters,
  PricingRuleListResult,
  UpdatePricingRulePayload,
} from '../types/pricing-rules.types';

function buildQuery(filters: Partial<PricingRuleListFilters>): string {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.clientType) params.set('clientType', filters.clientType);
  if (filters.scope) params.set('scope', filters.scope);
  if (filters.productType) params.set('productType', filters.productType);
  if (filters.productId) params.set('productId', filters.productId);
  if (filters.active !== undefined) params.set('active', String(filters.active));
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const pricingRulesApi = {
  list: (filters: Partial<PricingRuleListFilters> = {}) =>
    apiRequest<PricingRuleListResult>(`/pricing/rules${buildQuery(filters)}`),

  get: (id: string) => apiRequest<{ rule: PricingRule }>(`/pricing/rules/${id}`),

  create: (payload: CreatePricingRulePayload) =>
    apiRequest<{ rule: PricingRule }>('/pricing/rules', {
      method: 'POST',
      body: payload,
    }),

  update: (id: string, payload: UpdatePricingRulePayload) =>
    apiRequest<{ rule: PricingRule }>(`/pricing/rules/${id}`, {
      method: 'PATCH',
      body: payload,
    }),
};
