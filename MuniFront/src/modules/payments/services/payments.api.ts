import { apiRequest } from '@/services/api';
import { multipartRequest, fetchBlob } from './multipart.api';
import type {
  AdminPayment,
  CitizenPayment,
  MyPaymentsFilters,
  PaymentListFilters,
  PaymentListResult,
  RejectPaymentPayload,
  ReversePaymentPayload,
  SubmitPaymentPayload,
} from '../types/payments.types';

function buildMyPaymentsQuery(filters: MyPaymentsFilters): string {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.status) params.set('status', filters.status);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function buildPaymentsQuery(filters: PaymentListFilters): string {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.search) params.set('search', filters.search);
  if (filters.status) params.set('status', filters.status);
  if (filters.paymentMethod) params.set('paymentMethod', filters.paymentMethod);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const myPaymentsApi = {
  list: (filters: MyPaymentsFilters = {}) =>
    apiRequest<PaymentListResult<CitizenPayment>>(
      `/payments/me${buildMyPaymentsQuery(filters)}`,
    ),
  get: (id: string) =>
    apiRequest<{ payment: CitizenPayment }>(`/payments/me/${id}`),
  submit: (payload: SubmitPaymentPayload) =>
    multipartRequest<{ payment: { id: string } }>(`/payments/me`, {
      method: 'POST',
      fields: {
        amountMinor: payload.amountMinor,
        paymentMethod: payload.paymentMethod,
        note: payload.note ?? undefined,
      },
      fileField: 'receipt',
      file: payload.receipt,
      fileName: payload.receipt.name,
    }),
  receiptBlob: (id: string) => fetchBlob(`/payments/me/${id}/receipt`),
};

export const paymentsApi = {
  list: (filters: PaymentListFilters = {}) =>
    apiRequest<PaymentListResult<AdminPayment>>(
      `/payments${buildPaymentsQuery(filters)}`,
    ),
  get: (id: string) =>
    apiRequest<{ payment: AdminPayment }>(`/payments/${id}`),
  approve: (id: string) =>
    apiRequest<{ payment: { id: string; status: string } }>(
      `/payments/${id}/approve`,
      { method: 'POST' },
    ),
  reject: (id: string, payload: RejectPaymentPayload) =>
    apiRequest<{ payment: { id: string; status: string } }>(
      `/payments/${id}/reject`,
      { method: 'POST', body: payload },
    ),
  reverse: (id: string, payload: ReversePaymentPayload) =>
    apiRequest<{ payment: { id: string; status: string } }>(
      `/payments/${id}/reverse-approval`,
      { method: 'POST', body: payload },
    ),
  receiptBlob: (id: string) => fetchBlob(`/payments/${id}/receipt`),
};