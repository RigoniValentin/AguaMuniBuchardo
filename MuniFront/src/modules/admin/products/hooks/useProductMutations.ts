import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../services/products.api';
import { productsKeys } from './useProducts';
import type {
  CreateProductPayload,
  Product,
  UpdateProductPayload,
} from '../types/products.types';

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => productsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProductPayload) => productsApi.update(id, payload),
    onSuccess: (data: { product: Product }) => {
      qc.invalidateQueries({ queryKey: productsKeys.lists() });
      qc.setQueryData(productsKeys.detail(id), data);
    },
  });
}
