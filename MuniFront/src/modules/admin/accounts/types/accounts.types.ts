import { formatMinorAsARS } from '@/shared/money';

export type Direction = 'DEBIT' | 'CREDIT';

export type MovementType =
  | 'MANUAL_ADJUSTMENT'
  | 'ORDER_CHARGE'
  | 'PAYMENT'
  | 'REVERSAL'
  | 'OPENING_BALANCE';

export type SourceType = 'MANUAL' | 'ORDER' | 'PAYMENT' | 'SYSTEM' | 'REVERSAL';

export type AccountStatus = 'DEBT' | 'CREDIT' | 'SETTLED';

export type ClientType = 'LOCAL' | 'JUBILADO' | 'NO_LOCAL' | 'AYUDA_SOCIAL';

export interface AccountMovement {
  id: string;
  clientId: string;
  direction: Direction;
  amountMinor: number;
  signedAmountMinor: number;
  movementType: MovementType;
  description: string;
  occurredAt: string;
  sourceType: SourceType;
  sourceId: string | null;
  idempotencyKey: string | null;
  reversesMovementId: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface AccountSummary {
  clientId: string;
  totalDebitsMinor: number;
  totalCreditsMinor: number;
  balanceMinor: number;
  status: AccountStatus;
  lastMovementAt: string | null;
}

export interface AccountSummaryResponse {
  client: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    documentType: string;
    documentNumber: string;
    clientType: ClientType;
    active: boolean;
    hasUserAccount: boolean;
  };
  account: AccountSummary;
}

export interface AccountListItem {
  clientId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  clientType: ClientType;
  active: boolean;
  hasUserAccount: boolean;
  totalDebitsMinor: number;
  totalCreditsMinor: number;
  balanceMinor: number;
  status: AccountStatus;
  lastMovementAt: string | null;
}

export interface AccountPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface AccountListResult {
  items: AccountListItem[];
  pagination: AccountPagination;
}

export interface MovementPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface MovementListResult {
  items: AccountMovement[];
  pagination: MovementPagination;
}

export interface AccountListFilters {
  page: number;
  limit: number;
  search?: string;
  clientType?: ClientType;
  clientActive?: boolean;
  balanceStatus?: AccountStatus;
}

export interface MovementListFilters {
  page: number;
  limit: number;
  direction?: Direction;
  movementType?: MovementType;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateAdjustmentPayload {
  direction: Direction;
  amountMinor: number;
  description: string;
}

export interface ReverseMovementPayload {
  description: string;
}

// ----------------------------------------------------------------------------
// Display helpers (single source of truth for labels & badges)
// ----------------------------------------------------------------------------

export const ACCOUNT_STATUSES: AccountStatus[] = ['DEBT', 'CREDIT', 'SETTLED'];

export const ACCOUNT_STATUS_LABEL: Record<AccountStatus, string> = {
  DEBT: 'Con deuda',
  CREDIT: 'Saldo a favor',
  SETTLED: 'Al día',
};

export const ACCOUNT_STATUS_TONE: Record<
  AccountStatus,
  'danger' | 'success' | 'neutral'
> = {
  DEBT: 'danger',
  CREDIT: 'success',
  SETTLED: 'neutral',
};

export const DIRECTION_LABEL: Record<Direction, string> = {
  DEBIT: 'Cargo',
  CREDIT: 'Crédito',
};

export const MOVEMENT_TYPE_LABEL: Record<MovementType, string> = {
  MANUAL_ADJUSTMENT: 'Ajuste manual',
  ORDER_CHARGE: 'Cargo por pedido',
  PAYMENT: 'Pago',
  REVERSAL: 'Reversión',
  OPENING_BALANCE: 'Saldo inicial',
};

export const BALANCE_STATUS_FILTER_OPTIONS: Array<{
  value: AccountStatus | '';
  label: string;
}> = [
  { value: '', label: 'Todos' },
  { value: 'DEBT', label: 'Con deuda' },
  { value: 'CREDIT', label: 'Saldo a favor' },
  { value: 'SETTLED', label: 'Al día' },
];

export const CLIENT_ACTIVE_FILTER_OPTIONS: Array<{
  value: 'all' | 'active' | 'inactive';
  label: string;
}> = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
];

/**
 * Render the balance for the admin UI. Always hides the raw sign:
 *   balance > 0 → "Debe $X"
 *   balance < 0 → "Saldo a favor $X"
 *   balance = 0 → "Al día"
 */
export interface BalanceDisplay {
  kind: 'DEBT' | 'CREDIT' | 'SETTLED';
  label: string;
  formattedAmount: string;
}

export function describeBalance(balanceMinor: number): BalanceDisplay {
  if (!Number.isFinite(balanceMinor)) {
    return { kind: 'SETTLED', label: 'Al día', formattedAmount: '$0,00' };
  }
  if (balanceMinor > 0) {
    return {
      kind: 'DEBT',
      label: `Debe ${formatMinorAsARS(balanceMinor)}`,
      formattedAmount: formatMinorAsARS(balanceMinor),
    };
  }
  if (balanceMinor < 0) {
    return {
      kind: 'CREDIT',
      label: `Saldo a favor ${formatMinorAsARS(Math.abs(balanceMinor))}`,
      formattedAmount: formatMinorAsARS(Math.abs(balanceMinor)),
    };
  }
  return {
    kind: 'SETTLED',
    label: 'Al día',
    formattedAmount: '$0,00',
  };
}
