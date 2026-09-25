import { useMutation } from '@tanstack/react-query';
import { quoteApi } from '../services/quote.api';
import type { QuoteRequestPayload, QuoteResult } from '../types/quote.types';

export function usePricingQuote() {
  return useMutation<QuoteResult, Error, QuoteRequestPayload>({
    mutationFn: (payload) => quoteApi.quote(payload),
  });
}
