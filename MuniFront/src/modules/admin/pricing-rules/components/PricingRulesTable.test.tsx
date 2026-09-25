import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PricingRulesTable } from './PricingRulesTable';
import type { PricingRule } from '../types/pricing-rules.types';

const baseRule: PricingRule = {
  id: '1',
  name: 'Descuento jubilados',
  clientType: 'JUBILADO',
  scope: 'ALL_PRODUCTS',
  productType: null,
  productId: null,
  adjustmentType: 'PERCENTAGE',
  adjustmentValue: -50,
  priority: 0,
  active: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  createdBy: null,
  updatedBy: null,
};

describe('PricingRulesTable', () => {
  it('shows rule data without exposing internal codes', () => {
    render(
      <MemoryRouter>
        <PricingRulesTable items={[baseRule]} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Descuento jubilados')).toBeInTheDocument();
    expect(screen.getByText('Jubilado')).toBeInTheDocument();
    expect(screen.getByText(/-50\s?%/)).toBeInTheDocument();
    expect(screen.getByText('ALL_PRODUCTS')).toBeInTheDocument();
  });

  it('shows positive percentages', () => {
    const rule: PricingRule = {
      ...baseRule,
      adjustmentValue: 40,
      name: 'Recargo',
      clientType: 'NO_LOCAL',
    };
    render(
      <MemoryRouter>
        <PricingRulesTable items={[rule]} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/40\s?%/)).toBeInTheDocument();
  });
});
