import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductPrice } from './ProductPrice';

describe('ProductPrice', () => {
  it('formats minor units as ARS currency', () => {
    render(<ProductPrice basePriceMinor={1_000_000} />, { wrapper: MemoryRouter });
    expect(screen.getByText(/10\.000,00/)).toBeInTheDocument();
  });
});
