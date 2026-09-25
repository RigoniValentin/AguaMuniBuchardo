import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../services/payments.api';
import type { PaymentListFilters } from '../types/payments.types';

export const paymentsKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentsKeys.all, 'list'] as const,
  list: (filters: PaymentListFilters) => [...paymentsKeys.lists(), filters] as const,
  details: () => [...paymentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentsKeys.details(), id] as const,
};

export function usePayments(filters: PaymentListFilters = {}) {
  return useQuery({
    queryKey: paymentsKeys.list(filters),
    queryFn: () => paymentsApi.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function usePayment(id: string | undefined) {
  return useQuery({
    queryKey: paymentsKeys.detail(id ?? ''),
    queryFn: () => paymentsApi.get(id as string),
    enabled: Boolean(id),
  });
}

function invalidateRelated(qc: ReturnType<typeof useQueryClient>, paymentId?: string) {
  qc.invalidateQueries({ queryKey: paymentsKeys.all });
  // Account summary + movements + accounts list may also be impacted.
  qc.invalidateQueries({ queryKey: ['accounts'] });
  qc.invalidateQueries({ queryKey: ['my-account'] });
  if (paymentId) {
    qc.invalidateQueries({ queryKey: paymentsKeys.detail(paymentId) });
  }
}

export function useApprovePayment(paymentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => paymentsApi.approve(paymentId),
    onSuccess: () => invalidateRelated(qc, paymentId),
  });
}

export function useRejectPayment(paymentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { reason: string }) =>
      paymentsApi.reject(paymentId, payload),
    onSuccess: () => invalidateRelated(qc, paymentId),
  });
}

export function useReversePayment(paymentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { reason: string }) =>
      paymentsApi.reverse(paymentId, payload),
    onSuccess: () => invalidateRelated(qc, paymentId),
  });
}