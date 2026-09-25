import type { PricingRuleListFilters } from '../types/pricing-rules.types';

export interface PricingRuleFilterValues {
  clientType: PricingRuleListFilters['clientType'] | '';
  scope: PricingRuleListFilters['scope'] | '';
  active: 'all' | 'true' | 'false';
}

export const EMPTY_PRICING_RULE_FILTERS: PricingRuleFilterValues = {
  clientType: '',
  scope: '',
  active: 'all',
};

export function buildPricingRuleFiltersFromQuery(
  filters: Partial<PricingRuleListFilters>,
): PricingRuleFilterValues {
  let active: PricingRuleFilterValues['active'] = 'all';
  if (filters.active === true) active = 'true';
  else if (filters.active === false) active = 'false';
  return {
    clientType: filters.clientType ?? '',
    scope: filters.scope ?? '',
    active,
  };
}
