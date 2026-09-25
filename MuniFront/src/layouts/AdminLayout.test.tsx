/* Smoke test for the AdminLayout navigation. The regression we care about
 * is that nav items must NOT link to routes that don't exist (dead links
 * showing 404s to admin users). */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '@/hooks/auth-context';
import type { Role, User } from '@/types/auth';
import { AdminLayout } from './AdminLayout';

const ADMIN_USER: User = {
  id: '507f1f77bcf86cd799439099',
  firstName: 'Smoke',
  lastName: 'Admin',
  email: 'smoke@buchardo.gob.ar',
  role: 'ADMIN' as Role,
  permissions: [
    'orders.read',
    'payments.read',
    'clients.read',
    'accounts.read',
    'products.read',
    'pricing.read',
    'pricing.quote',
  ],
  active: true,
};

function makeAuthValue(): AuthContextValue {
  return {
    user: ADMIN_USER,
    status: 'authenticated',
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    hasRole: vi.fn(),
    hasPermission: vi.fn(),
  };
}

function renderLayout() {
  return render(
    <AuthContext.Provider value={makeAuthValue()}>
      <MemoryRouter initialEntries={['/admin']}>
        <AdminLayout />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('AdminLayout nav', () => {
  it('does NOT expose dead-link modules (Repartos / Stock / Usuarios)', () => {
    renderLayout();
    // The previously listed items pointed to /admin/repartos,
    // /admin/stock and /admin/usuarios which were never implemented as
    // routes. Clicking them showed a 404 to admin users.
    expect(screen.queryByText('Repartos')).not.toBeInTheDocument();
    expect(screen.queryByText('Stock')).not.toBeInTheDocument();
    expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
  });

  it('exposes the implemented core modules', () => {
    renderLayout();
    for (const label of [
      'Inicio',
      'Pedidos',
      'Pagos',
      'Clientes',
      'Cuentas corrientes',
      'Productos',
      'Reglas de precios',
      'Simulador',
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
});
