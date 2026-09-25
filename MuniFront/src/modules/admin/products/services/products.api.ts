import { apiRequest } from '@/services/api';
import type {
  CreateProductPayload,
  Product,
  ProductListFilters,
  ProductListResult,
  UpdateProductPayload,
} from '../types/products.types';

function buildQuery(filters: Partial<ProductListFilters>): string {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.search) params.set('search', filters.search);
  if (filters.productType) params.set('productType', filters.productType);
  if (filters.active !== undefined) params.set('active', String(filters.active));
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const productsApi = {
  list: (filters: Partial<ProductListFilters> = {}) =>
    apiRequest<ProductListResult>(`/products${buildQuery(filters)}`),

  get: (id: string) => apiRequest<{ product: Product }>(`/products/${id}`),

  create: (payload: CreateProductPayload) =>
    apiRequest<{ product: Product }>('/products', {
      method: 'POST',
      body: payload,
    }),

  update: (id: string, payload: UpdateProductPayload) =>
    apiRequest<{ product: Product }>(`/products/${id}`, {
      method: 'PATCH',
      body: payload,
    }),
};
