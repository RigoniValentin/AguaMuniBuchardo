import { apiRequest } from '@/services/api';
import type {
  QuoteRequestPayload,
  QuoteResult,
} from '../types/quote.types';

export const quoteApi = {
  quote: (payload: QuoteRequestPayload) =>
    apiRequest<QuoteResult>('/pricing/quote', {
      method: 'POST',
      body: payload,
    }),
};
