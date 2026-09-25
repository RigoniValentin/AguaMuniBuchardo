import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductForm } from './ProductForm';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('ProductForm', () => {
  it('renders the form with all required fields', () => {
    const onSubmit = vi.fn();
    render(<ProductForm submitLabel="Guardar" onSubmit={onSubmit} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByLabelText('Código')).toBeInTheDocument();
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
    expect(screen.getByLabelText('Precio base (ARS)')).toBeInTheDocument();
    expect(screen.getByLabelText(/Controla stock/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Producto activo/)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects an invalid code and shows validation error', async () => {
    const onSubmit = vi.fn();
    render(<ProductForm submitLabel="Guardar" onSubmit={onSubmit} />, {
      wrapper: Wrapper,
    });
    fireEvent.change(screen.getByLabelText('Código'), {
      target: { value: 'invalid code!!!' },
    });
    fireEvent.click(screen.getByText('Guardar'));
    expect(
      await screen.findByText(/Solo letras, números y guion bajo/),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('rejects empty required fields', async () => {
    const onSubmit = vi.fn();
    render(<ProductForm submitLabel="Guardar" onSubmit={onSubmit} />, {
      wrapper: Wrapper,
    });
    // Empty submission
    fireEvent.click(screen.getByText('Guardar'));
    expect(
      await screen.findByText(/El código es obligatorio/),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
