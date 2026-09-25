export type ProductType =
  | 'WATER_REFILL'
  | 'CONTAINER'
  | 'DISPENSER'
  | 'OTHER';

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string | null;
  productType: ProductType;
  basePriceMinor: number;
  tracksStock: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProductListResult {
  items: Product[];
  pagination: ProductPagination;
}

export interface ProductListFilters {
  page: number;
  limit: number;
  search?: string;
  productType?: ProductType;
  active?: boolean;
  sortBy?: 'code' | 'name' | 'productType' | 'basePriceMinor' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductPayload {
  code: string;
  name: string;
  description?: string | null;
  productType: ProductType;
  basePriceMinor: number;
  tracksStock?: boolean;
  active?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface ProductTypeOption {
  value: ProductType;
  label: string;
  tone: 'primary' | 'success' | 'warning' | 'info' | 'neutral';
}

export const PRODUCT_TYPE_OPTIONS: ProductTypeOption[] = [
  { value: 'WATER_REFILL', label: 'Recarga de agua', tone: 'primary' },
  { value: 'CONTAINER', label: 'Bidón', tone: 'info' },
  { value: 'DISPENSER', label: 'Dispenser', tone: 'success' },
  { value: 'OTHER', label: 'Otro', tone: 'neutral' },
];

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  WATER_REFILL: PRODUCT_TYPE_OPTIONS[0].label,
  CONTAINER: PRODUCT_TYPE_OPTIONS[1].label,
  DISPENSER: PRODUCT_TYPE_OPTIONS[2].label,
  OTHER: PRODUCT_TYPE_OPTIONS[3].label,
};

export const PRODUCT_TYPE_TONE: Record<ProductType, ProductTypeOption['tone']> = {
  WATER_REFILL: 'primary',
  CONTAINER: 'info',
  DISPENSER: 'success',
  OTHER: 'neutral',
};
