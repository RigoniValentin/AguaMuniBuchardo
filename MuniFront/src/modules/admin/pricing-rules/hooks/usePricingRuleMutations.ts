import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pricingRulesApi } from '../services/pricing-rules.api';
import { pricingRulesKeys } from './usePricingRules';
import type {
  CreatePricingRulePayload,
  PricingRule,
  UpdatePricingRulePayload,
} from '../types/pricing-rules.types';

export function useCreatePricingRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePricingRulePayload) =>
      pricingRulesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pricingRulesKeys.lists() });
    },
  });
}

export function useUpdatePricingRule(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePricingRulePayload) =>
      pricingRulesApi.update(id, payload),
    onSuccess: (data: { rule: PricingRule }) => {
      qc.invalidateQueries({ queryKey: pricingRulesKeys.lists() });
      qc.setQueryData(pricingRulesKeys.detail(id), data);
    },
  });
}
