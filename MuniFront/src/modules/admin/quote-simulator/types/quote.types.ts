export interface AppliedRuleSnapshot {
  id: string;
  name: string;
  scope: 'ALL_PRODUCTS' | 'PRODUCT_TYPE' | 'PRODUCT';
  clientType: 'LOCAL' | 'JUBILADO' | 'NO_LOCAL' | 'AYUDA_SOCIAL';
  productType: 'WATER_REFILL' | 'CONTAINER' | 'DISPENSER' | 'OTHER' | null;
  productId: string | null;
  adjustmentType: 'PERCENTAGE';
  adjustmentValue: number;
  priority: number;
}

export interface QuoteLineItem {
  productId: string;
  productCode: string;
  productName: string;
  productType: 'WATER_REFILL' | 'CONTAINER' | 'DISPENSER' | 'OTHER';
  quantity: number;
  unitBasePriceMinor: number;
  appliedRule: AppliedRuleSnapshot | null;
  adjustmentPercentage: number;
  unitFinalPriceMinor: number;
  subtotalBaseMinor: number;
  subtotalFinalMinor: number;
}

export interface QuoteTotals {
  baseMinor: number;
  adjustmentMinor: number;
  finalMinor: number;
}

export interface QuoteClientSnapshot {
  id: string;
  name: string;
  clientType: 'LOCAL' | 'JUBILADO' | 'NO_LOCAL' | 'AYUDA_SOCIAL';
  active: boolean;
  hasUserAccount: boolean;
}

export interface QuoteResult {
  client: QuoteClientSnapshot;
  items: QuoteLineItem[];
  totals: QuoteTotals;
}

export interface QuoteRequestPayload {
  clientId: string;
  items: { productId: string; quantity: number }[];
}
