import { Badge } from '@/components/Badge/Badge';
import {
  ACCOUNT_STATUS_LABEL,
  ACCOUNT_STATUS_TONE,
  type AccountStatus,
} from '../types/accounts.types';

interface AccountStatusBadgeProps {
  status: AccountStatus;
}

export function AccountStatusBadge({ status }: AccountStatusBadgeProps) {
  return <Badge tone={ACCOUNT_STATUS_TONE[status]}>{ACCOUNT_STATUS_LABEL[status]}</Badge>;
}
