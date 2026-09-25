import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { pricingRulesApi } from '../services/pricing-rules.api';
import type { PricingRuleListFilters } from '../types/pricing-rules.types';

export const pricingRulesKeys = {
  all: ['pricing', 'rules'] as const,
  lists: () => [...pricingRulesKeys.all, 'list'] as const,
  list: (filters: Partial<PricingRuleListFilters>) =>
    [...pricingRulesKeys.lists(), filters] as const,
  details: () => [...pricingRulesKeys.all, 'detail'] as const,
  detail: (id: string) => [...pricingRulesKeys.details(), id] as const,
};

export function usePricingRules(filters: Partial<PricingRuleListFilters>) {
  return useQuery({
    queryKey: pricingRulesKeys.list(filters),
    queryFn: () => pricingRulesApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function usePricingRule(id: string | undefined) {
  return useQuery({
    queryKey: pricingRulesKeys.detail(id ?? ''),
    queryFn: () => pricingRulesApi.get(id as string),
    enabled: Boolean(id),
  });
}
