/* Smoke test for the Admin Dashboard page (quick links + pending counts). */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '@/hooks/auth-context';
import type { Role, User } from '@/types/auth';
import { AdminDashboardPage } from './AdminDashboardPage';

vi.mock('@/modules/orders/services/orders.api', () => ({
  ordersApi: {
    listOrders: vi.fn(),
  },
}));

vi.mock('@/modules/payments/services/payments.api', () => ({
  paymentsApi: {
    list: vi.fn(),
  },
}));

import { ordersApi } from '@/modules/orders/services/orders.api';
import { paymentsApi } from '@/modules/payments/services/payments.api';

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

function renderDashboard() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <AuthContext.Provider value={makeAuthValue()}>
        <MemoryRouter>
          <AdminDashboardPage />
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders quick links for the four core modules', async () => {
    vi.mocked(ordersApi.listOrders).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 1, total: 0, pages: 1 },
    });
    vi.mocked(paymentsApi.list).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 1, total: 0, pages: 1 },
    });

    renderDashboard();

    expect(
      screen.getByRole('heading', { name: /bienvenido\/a/i }),
    ).toBeInTheDocument();
    // The dashboard shows two links per module (the KPI link "Ir a Pedidos →"
    // plus the quick-link card). We assert on the navigation targets.
    expect(
      screen.getAllByRole('link', { name: /ir a pedidos/i })[0],
    ).toHaveAttribute('href', '/admin/pedidos');
    expect(
      screen.getAllByRole('link', { name: /ir a pagos/i })[0],
    ).toHaveAttribute('href', '/admin/pagos');
    // The quick-link cards live inside the modules section. We check for the
    // titles by querying for the card sub-section role.
    expect(
      screen.getByText('Cuentas corrientes'),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('link', { name: /cuentas corrientes/i })[0],
    ).toHaveAttribute('href', '/admin/cuentas-corrientes');
  });

  it('shows pending counters when the API returns totals', async () => {
    vi.mocked(ordersApi.listOrders).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 1, total: 4, pages: 1 },
    });
    vi.mocked(paymentsApi.list).mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 1, total: 2, pages: 1 },
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
    // En el nuevo flujo los pedidos PENDING se muestran con el badge "En el pool".
    expect(screen.getAllByText(/pool/i).length).toBeGreaterThanOrEqual(1);
  });

  it('does not crash when pending queries error out', async () => {
    vi.mocked(ordersApi.listOrders).mockRejectedValue(new Error('boom'));
    vi.mocked(paymentsApi.list).mockRejectedValue(new Error('boom'));

    renderDashboard();

    await waitFor(() => {
      // Should render "—" placeholders and an error block.
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
    });
  });
});
