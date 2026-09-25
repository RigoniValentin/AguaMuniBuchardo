import type { Product } from '@/modules/admin/products/types/products.types';

/**
 * Citizen-safe view of a Product. Strips out administrative fields
 * (createdBy/updatedBy/createdAt/updatedAt) and the internal `code`
 * (the citizen knows products by name and type).
 */
export interface CitizenProduct {
  id: string;
  name: string;
  description: string | null;
  productType: Product['productType'];
}

export function toCitizenProduct(p: Product): CitizenProduct {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    productType: p.productType,
  };
}