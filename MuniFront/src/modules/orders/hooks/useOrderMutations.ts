import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../services/orders.api';
import type {
  CancelOrderPayload,
  CreateDirectOrderPayload,
  CreateMyOrderPayload,
} from '../types/orders.types';
import {
  deliveryKeys,
  myOrdersKeys,
  ordersKeys,
} from './useOrders';

function invalidateRelated(qc: ReturnType<typeof useQueryClient>): void {
  void qc.invalidateQueries({ queryKey: ordersKeys.lists() });
  void qc.invalidateQueries({ queryKey: myOrdersKeys.all });
  void qc.invalidateQueries({ queryKey: deliveryKeys.all });
  void qc.invalidateQueries({ queryKey: ['accounts'] });
  void qc.invalidateQueries({ queryKey: ['my-account'] });
}

export function useCreateMyOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMyOrderPayload) => ordersApi.createMyOrder(payload),
    onSuccess: (data) => {
      qc.setQueryData(myOrdersKeys.detail(data.order.id), { order: data.order });
      invalidateRelated(qc);
    },
  });
}

export function useCancelMyOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: CancelOrderPayload }) =>
      ordersApi.cancelMyOrder(id, payload ?? {}),
    onSuccess: (data, vars) => {
      qc.setQueryData(myOrdersKeys.detail(vars.id), { order: data.order });
      invalidateRelated(qc);
    },
  });
}

export function useCancelOrderAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      ordersApi.cancelOrder(id, { reason }),
    onSuccess: (data, vars) => {
      qc.setQueryData(ordersKeys.detail(vars.id), { order: data.order });
      invalidateRelated(qc);
    },
  });
}

export function useClaimOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersApi.claimOrder(id),
    onSuccess: (data, id) => {
      qc.setQueryData(deliveryKeys.detail(id), { order: data.order });
      qc.setQueryData(ordersKeys.detail(id), { order: data.order });
      invalidateRelated(qc);
    },
  });
}

export function useStartDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersApi.startDelivery(id),
    onSuccess: (data, id) => {
      qc.setQueryData(deliveryKeys.detail(id), { order: data.order });
      invalidateRelated(qc);
    },
  });
}

export function useDeliverOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ordersApi.deliverOrder(id),
    onSuccess: (data, id) => {
      qc.setQueryData(deliveryKeys.detail(id), { order: data.order });
      invalidateRelated(qc);
    },
  });
}

export function useCreateDirectOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDirectOrderPayload) =>
      ordersApi.createDirectOrder(payload),
    onSuccess: (data) => {
      qc.setQueryData(deliveryKeys.detail(data.order.id), { order: data.order });
      invalidateRelated(qc);
    },
  });
}
