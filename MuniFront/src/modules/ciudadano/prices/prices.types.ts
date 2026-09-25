/**
 * Citizen-facing pricing types.
 *
 * These mirror the BACKEND QuoteResult/QuoteLineItem/AppliedRuleSnapshot,
 * but the citizen UI never consumes the internal rule shape. We expose:
 *   - productId / productName
 *   - quantity
 *   - unitBasePriceMinor
 *   - unitFinalPriceMinor
 *   - subtotalFinalMinor
 *   - adjustmentPercentage (display only)
 */
export interface CitizenQuoteLine {
  productId: string;
  productName: string;
  quantity: number;
  unitBasePriceMinor: number;
  unitFinalPriceMinor: number;
  subtotalFinalMinor: number;
  adjustmentPercentage: number;
}

export interface CitizenQuoteTotals {
  baseMinor: number;
  finalMinor: number;
  adjustmentMinor: number;
}

export interface CitizenQuoteClient {
  id: string;
  name: string;
  clientType: string;
  active: boolean;
}

export interface CitizenQuote {
  client: CitizenQuoteClient;
  items: CitizenQuoteLine[];
  totals: CitizenQuoteTotals;
}

export interface CitizenSelfQuoteRequest {
  items: Array<{ productId: string; quantity: number }>;
}