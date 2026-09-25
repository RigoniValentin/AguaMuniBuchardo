import { parseArsToMinor, toMajorUnits } from '@/shared/money';
import type { Product } from '../types/products.types';
import type { ProductFormValues } from './ProductForm.schema';
import type {
  CreateProductPayload,
  UpdateProductPayload,
} from '../types/products.types';

export function defaultProductFormValues(product?: Product): ProductFormValues {
  return {
    code: product?.code ?? '',
    name: product?.name ?? '',
    description: product?.description ?? '',
    productType: product?.productType ?? 'WATER_REFILL',
    basePriceArs: product
      ? toMajorUnits(product.basePriceMinor).toFixed(2)
      : '',
    tracksStock: product?.tracksStock ?? false,
    active: product?.active ?? true,
  };
}

export function toCreatePayload(values: ProductFormValues): CreateProductPayload {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    description: values.description ? values.description.trim() : null,
    productType: values.productType,
    basePriceMinor: parseArsToMinor(values.basePriceArs),
    tracksStock: values.tracksStock,
    active: values.active,
  };
}

export function toUpdatePayload(values: ProductFormValues): UpdateProductPayload {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    description: values.description ? values.description.trim() : null,
    productType: values.productType,
    basePriceMinor: parseArsToMinor(values.basePriceArs),
    tracksStock: values.tracksStock,
    active: values.active,
  };
}
