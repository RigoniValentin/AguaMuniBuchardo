import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { myPaymentsApi } from '../services/payments.api';
import type { MyPaymentsFilters } from '../types/payments.types';

export const myPaymentsKeys = {
  all: ['my-payments'] as const,
  lists: () => [...myPaymentsKeys.all, 'list'] as const,
  list: (filters: MyPaymentsFilters) => [...myPaymentsKeys.lists(), filters] as const,
  details: () => [...myPaymentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...myPaymentsKeys.details(), id] as const,
};

export function useMyPayments(filters: MyPaymentsFilters = {}) {
  return useQuery({
    queryKey: myPaymentsKeys.list(filters),
    queryFn: () => myPaymentsApi.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useMyPayment(id: string | undefined) {
  return useQuery({
    queryKey: myPaymentsKeys.detail(id ?? ''),
    queryFn: () => myPaymentsApi.get(id as string),
    enabled: Boolean(id),
  });
}

export function useSubmitMyPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof myPaymentsApi.submit>[0]) =>
      myPaymentsApi.submit(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: myPaymentsKeys.all });
    },
  });
}