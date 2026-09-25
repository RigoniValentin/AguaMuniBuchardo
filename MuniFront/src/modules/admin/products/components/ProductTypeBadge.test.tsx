import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductTypeBadge } from './ProductTypeBadge';

describe('ProductTypeBadge', () => {
  it('shows friendly label, not the internal code', () => {
    render(<ProductTypeBadge value="WATER_REFILL" />);
    expect(screen.getByText('Recarga de agua')).toBeInTheDocument();
    expect(screen.queryByText('WATER_REFILL')).not.toBeInTheDocument();
  });

  it('falls back gracefully for unknown values', () => {
    render(<ProductTypeBadge value={'FOO' as never} />);
    // No crash, undefined label rendered (react will print nothing)
  });
});
