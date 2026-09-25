import { Badge } from '@/components/Badge/Badge';
import {
  PRICING_SCOPE_LABEL,
  type PricingRule,
} from '../types/pricing-rules.types';

interface PricingRuleTargetProps {
  rule: PricingRule;
}

export function PricingRuleTarget({ rule }: PricingRuleTargetProps) {
  const scopeLabel = PRICING_SCOPE_LABEL[rule.scope];
  if (rule.scope === 'ALL_PRODUCTS') {
    return <span>{scopeLabel}</span>;
  }
  if (rule.scope === 'PRODUCT_TYPE' && rule.productType) {
    return (
      <span>
        {scopeLabel}: <Badge tone="info">{rule.productType}</Badge>
      </span>
    );
  }
  if (rule.scope === 'PRODUCT' && rule.productId) {
    return (
      <span>
        {scopeLabel}: <code>{rule.productId.slice(-6)}</code>
      </span>
    );
  }
  return <span>{scopeLabel}</span>;
}
