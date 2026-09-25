import { Badge } from '@/components/Badge/Badge';

interface PricingRuleStatusBadgeProps {
  active: boolean;
}

export function PricingRuleStatusBadge({ active }: PricingRuleStatusBadgeProps) {
  if (active) {
    return <Badge tone="success">Activa</Badge>;
  }
  return <Badge tone="neutral">Inactiva</Badge>;
}
