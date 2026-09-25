import { apiRequest } from '@/services/api';
import type {
  AdminOrdersFilters,
  CancelOrderPayload,
  CreateDirectOrderPayload,
  CreateMyOrderPayload,
  DriverOrdersFilters,
  DriverOrderListResult,
  MyOrdersFilters,
  Order,
  OrderListResult,
} from '../types/orders.types';

function buildQuery(params: object): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    if (typeof v === 'object') continue;
    search.set(k, String(v));
  }
  const s = search.toString();
  return s ? `?${s}` : '';
}

export const ordersApi = {
  // Citizen /me
  createMyOrder: (payload: CreateMyOrderPayload) =>
    apiRequest<{ order: Order }>('/orders/me', {
      method: 'POST',
      body: payload,
    }),
  listMyOrders: (filters: MyOrdersFilters = {}) =>
    apiRequest<OrderListResult>(`/orders/me${buildQuery(filters)}`),
  getMyOrder: (id: string) =>
    apiRequest<{ order: Order }>(`/orders/me/${id}`),
  cancelMyOrder: (id: string, payload: CancelOrderPayload = {}) =>
    apiRequest<{ order: Order }>(`/orders/me/${id}/cancel`, {
      method: 'POST',
      body: payload,
    }),

  // Admin
  listOrders: (filters: AdminOrdersFilters = {}) =>
    apiRequest<OrderListResult>(`/orders${buildQuery(filters)}`),
  getOrder: (id: string) => apiRequest<{ order: Order }>(`/orders/${id}`),
  cancelOrder: (id: string, payload: { reason: string }) =>
    apiRequest<{ order: Order }>(`/orders/${id}/cancel`, {
      method: 'POST',
      body: payload,
    }),

  // Driver
  listMyDeliveries: (filters: DriverOrdersFilters = {}) =>
    apiRequest<DriverOrderListResult>(`/delivery/me/orders${buildQuery(filters)}`),
  getMyDelivery: (id: string) =>
    apiRequest<{ order: Order }>(`/delivery/me/orders/${id}`),
  claimOrder: (id: string) =>
    apiRequest<{ order: Order }>(`/delivery/me/orders/${id}/claim`, {
      method: 'POST',
    }),
  startDelivery: (id: string) =>
    apiRequest<{ order: Order }>(`/delivery/me/orders/${id}/start`, {
      method: 'POST',
    }),
  deliverOrder: (id: string) =>
    apiRequest<{ order: Order }>(`/delivery/me/orders/${id}/deliver`, {
      method: 'POST',
    }),
  createDirectOrder: (payload: CreateDirectOrderPayload) =>
    apiRequest<{ order: Order }>('/delivery/me/direct-order', {
      method: 'POST',
      body: payload,
    }),
};
