import { Badge } from '@/components/Badge/Badge';

interface ClientStatusBadgeProps {
  active: boolean;
}

export function ClientStatusBadge({ active }: ClientStatusBadgeProps) {
  if (active) {
    return <Badge tone="success">Activo</Badge>;
  }
  return <Badge tone="neutral">Inactivo</Badge>;
}
