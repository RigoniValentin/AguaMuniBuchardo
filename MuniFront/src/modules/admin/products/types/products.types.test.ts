import { describe, it, expect } from 'vitest';
import {
  PRODUCT_TYPE_LABEL,
  PRODUCT_TYPE_OPTIONS,
  PRODUCT_TYPE_TONE,
} from './products.types';

describe('products.types', () => {
  it('exposes a label for each product type', () => {
    for (const opt of PRODUCT_TYPE_OPTIONS) {
      expect(PRODUCT_TYPE_LABEL[opt.value]).toBe(opt.label);
      expect(PRODUCT_TYPE_TONE[opt.value]).toBe(opt.tone);
    }
  });

  it('does not expose internal codes to the UI labels', () => {
    expect(PRODUCT_TYPE_LABEL.WATER_REFILL).toBe('Recarga de agua');
    expect(PRODUCT_TYPE_LABEL.CONTAINER).toBe('Bidón');
    expect(PRODUCT_TYPE_LABEL.DISPENSER).toBe('Dispenser');
    expect(PRODUCT_TYPE_LABEL.OTHER).toBe('Otro');
  });
});
