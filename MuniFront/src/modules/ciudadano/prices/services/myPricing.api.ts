import { apiRequest } from '@/services/api';
import type { CitizenSelfQuoteRequest, CitizenQuote } from '../prices.types';

/**
 * Citizen self-quote. NEVER sends a clientId — the backend resolves the
 * Client from `req.user.id`.
 */
export const myPricingApi = {
  quote: (payload: CitizenSelfQuoteRequest) =>
    apiRequest<CitizenQuote>('/pricing/me/quote', {
      method: 'POST',
      body: payload,
    }),
};