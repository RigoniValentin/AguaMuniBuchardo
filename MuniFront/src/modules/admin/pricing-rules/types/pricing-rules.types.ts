export type PricingScope = 'ALL_PRODUCTS' | 'PRODUCT_TYPE' | 'PRODUCT';
export type PricingAdjustmentType = 'PERCENTAGE';

export interface PricingRule {
  id: string;
  name: string;
  clientType: ClientType;
  scope: PricingScope;
  productType: ProductType | null;
  productId: string | null;
  adjustmentType: PricingAdjustmentType;
  adjustmentValue: number;
  priority: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface PricingRuleListResult {
  items: PricingRule[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface PricingRuleListFilters {
  page: number;
  limit: number;
  clientType?: ClientType;
  scope?: PricingScope;
  productType?: ProductType;
  productId?: string;
  active?: boolean;
  sortBy?: 'priority' | 'name' | 'clientType' | 'scope' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePricingRulePayload {
  name: string;
  clientType: ClientType;
  scope: PricingScope;
  productType?: ProductType;
  productId?: string;
  adjustmentType?: PricingAdjustmentType;
  adjustmentValue: number;
  priority?: number;
  active?: boolean;
}

export type UpdatePricingRulePayload = Partial<CreatePricingRulePayload>;

export type ClientType =
  | 'LOCAL'
  | 'JUBILADO'
  | 'NO_LOCAL'
  | 'AYUDA_SOCIAL';

export type ProductType =
  | 'WATER_REFILL'
  | 'CONTAINER'
  | 'DISPENSER'
  | 'OTHER';

export const PRICING_SCOPE_OPTIONS: { value: PricingScope; label: string }[] = [
  { value: 'ALL_PRODUCTS', label: 'Todos los productos' },
  { value: 'PRODUCT_TYPE', label: 'Tipo de producto' },
  { value: 'PRODUCT', label: 'Producto específico' },
];

export const CLIENT_TYPE_OPTIONS: { value: ClientType; label: string }[] = [
  { value: 'LOCAL', label: 'Local' },
  { value: 'JUBILADO', label: 'Jubilado' },
  { value: 'NO_LOCAL', label: 'No local' },
  { value: 'AYUDA_SOCIAL', label: 'Ayuda social' },
];

export const PRODUCT_TYPE_OPTIONS: { value: ProductType; label: string }[] = [
  { value: 'WATER_REFILL', label: 'Recarga de agua' },
  { value: 'CONTAINER', label: 'Bidón' },
  { value: 'DISPENSER', label: 'Dispenser' },
  { value: 'OTHER', label: 'Otro' },
];

export const PRICING_SCOPE_LABEL: Record<PricingScope, string> = {
  ALL_PRODUCTS: 'Todos los productos',
  PRODUCT_TYPE: 'Tipo de producto',
  PRODUCT: 'Producto específico',
};

export const CLIENT_TYPE_LABEL: Record<ClientType, string> = {
  LOCAL: 'Local',
  JUBILADO: 'Jubilado',
  NO_LOCAL: 'No local',
  AYUDA_SOCIAL: 'Ayuda social',
};

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  WATER_REFILL: 'Recarga de agua',
  CONTAINER: 'Bidón',
  DISPENSER: 'Dispenser',
  OTHER: 'Otro',
};
