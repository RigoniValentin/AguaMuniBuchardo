import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PricingRuleForm } from './PricingRuleForm';

function Wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('PricingRuleForm', () => {
  it('renders all base fields', () => {
    render(<PricingRuleForm submitLabel="Guardar" onSubmit={() => {}} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Tipo de cliente')).toBeInTheDocument();
    expect(screen.getByLabelText('Alcance')).toBeInTheDocument();
    expect(screen.getByLabelText('Ajuste %')).toBeInTheDocument();
    expect(screen.getByLabelText('Prioridad')).toBeInTheDocument();
  });

  it('hides product fields when scope is ALL_PRODUCTS', () => {
    render(<PricingRuleForm submitLabel="Guardar" onSubmit={() => {}} />, {
      wrapper: Wrapper,
    });
    expect(screen.queryByLabelText('Tipo de producto')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Producto')).not.toBeInTheDocument();
  });

  it('shows productType when scope is PRODUCT_TYPE', () => {
    render(<PricingRuleForm submitLabel="Guardar" onSubmit={() => {}} />, {
      wrapper: Wrapper,
    });
    fireEvent.change(screen.getByLabelText('Alcance'), {
      target: { value: 'PRODUCT_TYPE' },
    });
    expect(screen.getByLabelText('Tipo de producto')).toBeInTheDocument();
  });
});
