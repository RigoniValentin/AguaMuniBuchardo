import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../services/orders.api';
import type {
  AdminOrdersFilters,
  DriverOrdersFilters,
  MyOrdersFilters,
} from '../types/orders.types';

export const ordersKeys = {
  all: ['orders'] as const,
  lists: () => [...ordersKeys.all, 'list'] as const,
  list: (filters: AdminOrdersFilters) => [...ordersKeys.lists(), filters] as const,
  details: () => [...ordersKeys.all, 'detail'] as const,
  detail: (id: string) => [...ordersKeys.details(), id] as const,
};

export const myOrdersKeys = {
  all: ['my-orders'] as const,
  lists: () => [...myOrdersKeys.all, 'list'] as const,
  list: (filters: MyOrdersFilters) => [...myOrdersKeys.lists(), filters] as const,
  details: () => [...myOrdersKeys.all, 'detail'] as const,
  detail: (id: string) => [...myOrdersKeys.details(), id] as const,
};

export const deliveryKeys = {
  all: ['my-delivery'] as const,
  lists: () => [...deliveryKeys.all, 'list'] as const,
  list: (filters: DriverOrdersFilters) =>
    [...deliveryKeys.lists(), filters] as const,
  details: () => [...deliveryKeys.all, 'detail'] as const,
  detail: (id: string) => [...deliveryKeys.details(), id] as const,
};

// ---------- Citizen ----------

export function useMyOrders(filters: MyOrdersFilters) {
  return useQuery({
    queryKey: myOrdersKeys.list(filters),
    queryFn: () => ordersApi.listMyOrders(filters),
    retry: (failureCount, error) => {
      const code = (error as { code?: string } | null)?.code;
      if (code === 'CLIENT_NOT_LINKED' || code === 'VALIDATION_ERROR' || code === 'FORBIDDEN')
        return false;
      return failureCount < 2;
    },
  });
}

export function useMyOrder(id: string | undefined) {
  return useQuery({
    queryKey: myOrdersKeys.detail(id ?? ''),
    queryFn: () => ordersApi.getMyOrder(id as string),
    enabled: Boolean(id),
    retry: (failureCount, error) => {
      const code = (error as { code?: string } | null)?.code;
      if (code === 'NOT_FOUND' || code === 'CLIENT_NOT_LINKED' || code === 'FORBIDDEN')
        return false;
      return failureCount < 2;
    },
  });
}

// ---------- Admin ----------

export function useAdminOrders(filters: AdminOrdersFilters) {
  return useQuery({
    queryKey: ordersKeys.list(filters),
    queryFn: () => ordersApi.listOrders(filters),
  });
}

export function useAdminOrder(id: string | undefined) {
  return useQuery({
    queryKey: ordersKeys.detail(id ?? ''),
    queryFn: () => ordersApi.getOrder(id as string),
    enabled: Boolean(id),
  });
}

// ---------- Driver ----------

export function useMyDeliveries(filters: DriverOrdersFilters) {
  return useQuery({
    queryKey: deliveryKeys.list(filters),
    queryFn: () => ordersApi.listMyDeliveries(filters),
  });
}

export function useMyDelivery(id: string | undefined) {
  return useQuery({
    queryKey: deliveryKeys.detail(id ?? ''),
    queryFn: () => ordersApi.getMyDelivery(id as string),
    enabled: Boolean(id),
    retry: (failureCount, error) => {
      const code = (error as { code?: string } | null)?.code;
      if (code === 'NOT_FOUND' || code === 'FORBIDDEN') return false;
      return failureCount < 2;
    },
  });
}
