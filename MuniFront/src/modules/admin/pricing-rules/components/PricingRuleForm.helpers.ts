import type { PricingRule } from '../types/pricing-rules.types';
import type { PricingRuleFormValues } from './PricingRuleForm.schema';
import type {
  CreatePricingRulePayload,
  UpdatePricingRulePayload,
} from '../types/pricing-rules.types';

export function defaultPricingRuleFormValues(
  rule?: PricingRule,
): PricingRuleFormValues {
  return {
    name: rule?.name ?? '',
    clientType: rule?.clientType ?? 'LOCAL',
    scope: rule?.scope ?? 'ALL_PRODUCTS',
    productType: rule?.productType ?? undefined,
    productId: rule?.productId ?? '',
    adjustmentValue: rule?.adjustmentValue ?? 0,
    priority: rule?.priority ?? 0,
    active: rule?.active ?? true,
  };
}

export function toPricingRulePayload(
  values: PricingRuleFormValues,
): CreatePricingRulePayload | UpdatePricingRulePayload {
  const base: CreatePricingRulePayload = {
    name: values.name.trim(),
    clientType: values.clientType,
    scope: values.scope,
    adjustmentValue: values.adjustmentValue,
    priority: values.priority,
    active: values.active,
    adjustmentType: 'PERCENTAGE',
  };
  if (values.scope === 'PRODUCT_TYPE' && values.productType) {
    base.productType = values.productType;
  }
  if (values.scope === 'PRODUCT' && values.productId) {
    base.productId = values.productId;
  }
  return base;
}
