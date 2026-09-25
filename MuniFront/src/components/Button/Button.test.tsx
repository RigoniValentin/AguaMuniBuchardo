import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with the provided label', () => {
    render(<Button>Hola</Button>);
    expect(screen.getByRole('button', { name: 'Hola' })).toBeInTheDocument();
  });

  it('shows a loading spinner and is disabled when loading', () => {
    render(<Button loading>Cargando</Button>);
    const btn = screen.getByRole('button', { name: /Cargando/ });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('uses variant classes', () => {
    const { container } = render(<Button variant="ghost">X</Button>);
    expect(container.firstChild).toHaveClass(/ghost/);
  });
});
