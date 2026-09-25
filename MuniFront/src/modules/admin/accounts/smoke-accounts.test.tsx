import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from '@/hooks/auth-context';
import type { Role, User } from '@/types/auth';
import { AdminAccountsPage } from './pages/AdminAccountsPage';
import { AdminAccountDetailPage } from './pages/AdminAccountDetailPage';
import type { AccountListItem } from './types/accounts.types';

const { listMock, getSummaryMock, listMovementsMock, createAdjustmentMock, reverseMovementMock } =
  vi.hoisted(() => ({
    listMock: vi.fn(),
    getSummaryMock: vi.fn(),
    listMovementsMock: vi.fn(),
    createAdjustmentMock: vi.fn(),
    reverseMovementMock: vi.fn(),
  }));

vi.mock('./services/accounts.api', () => ({
  accountsApi: {
    list: listMock,
    getSummary: getSummaryMock,
    listMovements: listMovementsMock,
    createAdjustment: createAdjustmentMock,
    reverseMovement: reverseMovementMock,
  },
}));

const accountsApiMock = {
  list: listMock,
  getSummary: getSummaryMock,
  listMovements: listMovementsMock,
  createAdjustment: createAdjustmentMock,
  reverseMovement: reverseMovementMock,
};

const baseAccount: AccountListItem = {
  clientId: '507f1f77bcf86cd799439011',
  firstName: 'Juan',
  lastName: 'Pérez',
  fullName: 'Juan Pérez',
  documentType: 'DNI',
  documentNumber: '12345678',
  clientType: 'LOCAL',
  active: true,
  hasUserAccount: false,
  totalDebitsMinor: 1_000_000,
  totalCreditsMinor: 0,
  balanceMinor: 1_000_000,
  status: 'DEBT',
  lastMovementAt: '2025-01-01T12:00:00.000Z',
};

const adminUser: User = {
  id: '507f1f77bcf86cd799439099',
  firstName: 'Admin',
  lastName: 'Cuenta',
  email: 'admin@buchardo.gob.ar',
  role: 'ADMIN' as Role,
  permissions: ['accounts.read', 'accounts.adjust', 'accounts.reverse'],
  active: true,
};

function makeAuthValue(perms: string[]): AuthContextValue {
  const user: User = { ...adminUser, permissions: perms as User['permissions'] };
  return {
    user,
    status: 'authenticated',
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    hasRole: (...roles: Role[]) => roles.includes(user.role),
    hasPermission: (...required) => required.every((p) => user.permissions.includes(p)),
  };
}

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderWith(
  ui: ReactNode,
  initialPath: string,
  perms: string[] = ['accounts.read', 'accounts.adjust', 'accounts.reverse'],
) {
  const queryClient = makeQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={makeAuthValue(perms)}>
        <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe('Smoke — MuniFront Admin Cuentas Corrientes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Lista cuentas corrientes mockeadas con la representación amigable', async () => {
    accountsApiMock.list.mockResolvedValue({
      items: [
        baseAccount,
        {
          ...baseAccount,
          clientId: '2',
          fullName: 'Ana Crédito',
          balanceMinor: -200_000,
          totalDebitsMinor: 0,
          totalCreditsMinor: 200_000,
          status: 'CREDIT',
        },
        {
          ...baseAccount,
          clientId: '3',
          fullName: 'Carla Día',
          balanceMinor: 0,
          totalDebitsMinor: 0,
          totalCreditsMinor: 0,
          status: 'SETTLED',
          lastMovementAt: null,
        },
      ],
      pagination: { page: 1, limit: 20, total: 3, pages: 1 },
    });

    renderWith(<AdminAccountsPage />, '/admin/cuentas-corrientes');

    await waitFor(() => expect(screen.getByText('Juan Pérez')).toBeInTheDocument());

    expect(screen.getAllByText('Con deuda').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Debe \$.*10\.000,00/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Saldo a favor').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Al día').length).toBeGreaterThan(0);
  });

  it('Aplica filtro balanceStatus=DEBT a la query', async () => {
    accountsApiMock.list.mockResolvedValue({
      items: [baseAccount],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });

    renderWith(<AdminAccountsPage />, '/admin/cuentas-corrientes');

    await waitFor(() => screen.getByLabelText(/Estado de cuenta/i));
    fireEvent.change(screen.getByLabelText(/Estado de cuenta/i), {
      target: { value: 'DEBT' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Aplicar/i }));

    await waitFor(() => {
      const calls = accountsApiMock.list.mock.calls;
      const lastCall = calls[calls.length - 1]?.[0];
      expect(lastCall?.balanceStatus).toBe('DEBT');
    });
  });

  it('Renderiza detalle de cuenta con tarjetas y resumen', async () => {
    accountsApiMock.getSummary.mockResolvedValue({
      client: {
        id: baseAccount.clientId,
        firstName: 'Juan',
        lastName: 'Pérez',
        fullName: 'Juan Pérez',
        documentType: 'DNI',
        documentNumber: '12345678',
        clientType: 'LOCAL',
        active: true,
        hasUserAccount: false,
      },
      account: {
        clientId: baseAccount.clientId,
        totalDebitsMinor: 1_000_000,
        totalCreditsMinor: 400_000,
        balanceMinor: 600_000,
        status: 'DEBT',
        lastMovementAt: '2025-01-01T12:00:00.000Z',
      },
    });
    accountsApiMock.listMovements.mockResolvedValue({
      items: [
        {
          id: 'm1',
          clientId: baseAccount.clientId,
          direction: 'DEBIT',
          amountMinor: 1_000_000,
          signedAmountMinor: 1_000_000,
          movementType: 'MANUAL_ADJUSTMENT',
          description: 'Carga inicial',
          occurredAt: '2025-01-01T12:00:00.000Z',
          sourceType: 'MANUAL',
          sourceId: null,
          idempotencyKey: null,
          reversesMovementId: null,
          createdBy: null,
          createdAt: '2025-01-01T12:00:00.000Z',
        },
      ],
      pagination: { page: 1, limit: 50, total: 1, pages: 1 },
    });

    renderWith(
      <Routes>
        <Route
          path="/admin/clientes/:id/cuenta"
          element={<AdminAccountDetailPage />}
        />
      </Routes>,
      `/admin/clientes/${baseAccount.clientId}/cuenta`,
    );

    await waitFor(() => expect(screen.getByText('Juan Pérez')).toBeInTheDocument());
    expect(screen.getByText('Saldo actual')).toBeInTheDocument();
    expect(screen.getByText('Total cargos')).toBeInTheDocument();
    expect(screen.getByText('Total créditos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nuevo ajuste/i })).toBeInTheDocument();
    await waitFor(() => screen.getByRole('button', { name: /Revertir/i }));
  });

  it('Oculta los botones de ajuste y reversión cuando el rol no tiene permisos', async () => {
    accountsApiMock.getSummary.mockResolvedValue({
      client: {
        id: baseAccount.clientId,
        firstName: 'Juan',
        lastName: 'Pérez',
        fullName: 'Juan Pérez',
        documentType: 'DNI',
        documentNumber: '12345678',
        clientType: 'LOCAL',
        active: true,
        hasUserAccount: false,
      },
      account: {
        clientId: baseAccount.clientId,
        totalDebitsMinor: 1_000_000,
        totalCreditsMinor: 0,
        balanceMinor: 1_000_000,
        status: 'DEBT',
        lastMovementAt: null,
      },
    });
    accountsApiMock.listMovements.mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 50, total: 0, pages: 1 },
    });

    renderWith(
      <Routes>
        <Route
          path="/admin/clientes/:id/cuenta"
          element={<AdminAccountDetailPage />}
        />
      </Routes>,
      `/admin/clientes/${baseAccount.clientId}/cuenta`,
      ['accounts.read'],
    );

    await waitFor(() => expect(screen.getByText('Juan Pérez')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /Nuevo ajuste/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Revertir/i })).not.toBeInTheDocument();
  });

  it('Muestra estado vacío en historial cuando no hay movimientos', async () => {
    accountsApiMock.getSummary.mockResolvedValue({
      client: {
        id: baseAccount.clientId,
        firstName: 'Juan',
        lastName: 'Pérez',
        fullName: 'Juan Pérez',
        documentType: 'DNI',
        documentNumber: '12345678',
        clientType: 'LOCAL',
        active: true,
        hasUserAccount: false,
      },
      account: {
        clientId: baseAccount.clientId,
        totalDebitsMinor: 0,
        totalCreditsMinor: 0,
        balanceMinor: 0,
        status: 'SETTLED',
        lastMovementAt: null,
      },
    });
    accountsApiMock.listMovements.mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 50, total: 0, pages: 1 },
    });

    renderWith(
      <Routes>
        <Route
          path="/admin/clientes/:id/cuenta"
          element={<AdminAccountDetailPage />}
        />
      </Routes>,
      `/admin/clientes/${baseAccount.clientId}/cuenta`,
      ['accounts.read'],
    );

    await waitFor(() =>
      expect(
        screen.getByText(/Aún no se registraron movimientos/i),
      ).toBeInTheDocument(),
    );
  });
});
