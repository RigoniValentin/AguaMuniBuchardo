export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVERSED';
export type PaymentMethod = 'BANK_TRANSFER' | 'BANK_DEPOSIT' | 'OTHER';

export interface PaymentReceiptMeta {
  originalName: string;
  mimeType: string;
  size: number;
}

export interface CitizenPayment {
  id: string;
  amountMinor: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  note: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  reversedAt: string | null;
  reversalReason: string | null;
  createdAt: string;
  receipt: PaymentReceiptMeta;
}

export interface AdminPaymentClient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  clientType: 'LOCAL' | 'JUBILADO' | 'NO_LOCAL' | 'AYUDA_SOCIAL';
  active: boolean;
}

export interface AdminPayment extends CitizenPayment {
  reviewedBy: string | null;
  reversedBy: string | null;
  ledgerMovementId: string | null;
  reversalMovementId: string | null;
  client: AdminPaymentClient;
}

export interface PaymentPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaymentListResult<T> {
  items: T[];
  pagination: PaymentPagination;
}

export interface PaymentListFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'submittedAt' | 'amountMinor' | 'status' | 'paymentMethod' | 'reviewedAt' | 'reversedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface MyPaymentsFilters {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
}

export interface SubmitPaymentPayload {
  amountMinor: number;
  paymentMethod: PaymentMethod;
  note?: string | null;
  receipt: File;
}

export interface RejectPaymentPayload {
  reason: string;
}

export interface ReversePaymentPayload {
  reason: string;
}

// ----------------------------------------------------------------------------
// Display helpers
// ----------------------------------------------------------------------------

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  REVERSED: 'Revertido',
};

export const PAYMENT_STATUS_TONE: Record<
  PaymentStatus,
  'primary' | 'success' | 'danger' | 'warning' | 'neutral' | 'info'
> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  REVERSED: 'neutral',
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  BANK_TRANSFER: 'Transferencia bancaria',
  BANK_DEPOSIT: 'Depósito bancario',
  OTHER: 'Otro',
};

export const PAYMENT_METHOD_TONE: Record<PaymentMethod, 'primary' | 'success' | 'info'> = {
  BANK_TRANSFER: 'primary',
  BANK_DEPOSIT: 'info',
  OTHER: 'success',
};

export const PAYMENT_METHOD_OPTIONS: Array<{
  value: PaymentMethod;
  label: string;
}> = [
  { value: 'BANK_TRANSFER', label: PAYMENT_METHOD_LABEL.BANK_TRANSFER },
  { value: 'BANK_DEPOSIT', label: PAYMENT_METHOD_LABEL.BANK_DEPOSIT },
  { value: 'OTHER', label: PAYMENT_METHOD_LABEL.OTHER },
];

export const PAYMENT_STATUS_OPTIONS: Array<{
  value: PaymentStatus | '';
  label: string;
}> = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: PAYMENT_STATUS_LABEL.PENDING },
  { value: 'APPROVED', label: PAYMENT_STATUS_LABEL.APPROVED },
  { value: 'REJECTED', label: PAYMENT_STATUS_LABEL.REJECTED },
  { value: 'REVERSED', label: PAYMENT_STATUS_LABEL.REVERSED },
];

export const PAYMENT_ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

export type PaymentAllowedMime = (typeof PAYMENT_ALLOWED_MIME)[number];

export function isPaymentAllowedMime(value: string): value is PaymentAllowedMime {
  return (PAYMENT_ALLOWED_MIME as readonly string[]).includes(value);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const PAYMENT_RECEIPT_MAX_BYTES = 8 * 1024 * 1024;