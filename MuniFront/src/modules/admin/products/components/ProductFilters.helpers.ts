import type { ProductListFilters } from '../types/products.types';

export interface ProductFilterValues {
  search: string;
  productType: ProductListFilters['productType'] | '';
  active: 'all' | 'true' | 'false';
}

export const EMPTY_PRODUCT_FILTERS: ProductFilterValues = {
  search: '',
  productType: '',
  active: 'all',
};

export function buildProductFiltersFromQuery(
  filters: Partial<ProductListFilters>,
): ProductFilterValues {
  let active: ProductFilterValues['active'] = 'all';
  if (filters.active === true) active = 'true';
  else if (filters.active === false) active = 'false';
  return {
    search: filters.search ?? '',
    productType: filters.productType ?? '',
    active,
  };
}
