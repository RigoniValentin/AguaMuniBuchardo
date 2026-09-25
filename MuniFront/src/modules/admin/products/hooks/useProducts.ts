import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { productsApi } from '../services/products.api';
import type { ProductListFilters } from '../types/products.types';

export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (filters: Partial<ProductListFilters>) =>
    [...productsKeys.lists(), filters] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
};

export function useProducts(filters: Partial<ProductListFilters>) {
  return useQuery({
    queryKey: productsKeys.list(filters),
    queryFn: () => productsApi.list(filters),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: productsKeys.detail(id ?? ''),
    queryFn: () => productsApi.get(id as string),
    enabled: Boolean(id),
  });
}
