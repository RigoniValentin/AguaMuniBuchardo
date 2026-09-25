import { Badge } from '@/components/Badge/Badge';

interface ProductStatusBadgeProps {
  active: boolean;
}

export function ProductStatusBadge({ active }: ProductStatusBadgeProps) {
  if (active) {
    return <Badge tone="success">Activo</Badge>;
  }
  return <Badge tone="neutral">Inactivo</Badge>;
}
