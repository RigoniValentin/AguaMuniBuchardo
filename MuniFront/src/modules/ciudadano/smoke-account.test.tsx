import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from '@/hooks/auth-context';
import type { User } from '@/types/auth';

const { apiRequestMock } = vi.hoisted(() => ({ apiRequestMock: vi.fn() }));
vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<typeof import('@/services/api')>('@/services/api');
  return { ...actual, apiRequest: apiRequestMock };
});

import { CiudadanoCuentaPage } from './account/pages/CiudadanoCuentaPage';

const citizenUser: User = {
  id: '507f1f77bcf86cd799439099',
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'vecino@buchardo.gob.ar',
  role: 'CIUDADANO',
  permissions: ['products.read', 'pricing.quote', 'accounts.self', 'clients.self'],
  active: true,
};

function makeAuth(): AuthContextValue {
  return {
    user: citizenUser,
    status: 'authenticated',
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    hasRole: () => true,
    hasPermission: (...p) => p.every((x) => citizenUser.permissions.includes(x)),
  };
}

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderWith(ui: ReactNode, initialPath: string) {
  const queryClient = makeQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={makeAuth()}>
        <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe('Smoke — MuniFront Portal Ciudadano (Account)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Resumen de cuenta + historial + paginación', async () => {
    apiRequestMock.mockImplementation((path: string) => {
      if (path === '/clients/me') {
        return Promise.resolve({
          client: {
            id: '507f1f77bcf86cd799439011',
            firstName: 'Juan',
            lastName: 'Pérez',
            fullName: 'Juan Pérez',
            documentType: 'DNI',
            documentNumber: '12345678',
            phone: null,
            email: null,
            clientType: 'JUBILADO',
            address: {
              street: 'Av. San Martín',
              number: '123',
              floor: null,
              apartment: null,
              neighborhood: null,
              locality: 'Buchardo',
              postalCode: null,
              references: null,
            },
            active: true,
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        });
      }
      if (path === '/accounts/me/summary') {
        return Promise.resolve({
          client: {
            id: '507f1f77bcf86cd799439011',
            firstName: 'Juan',
            lastName: 'Pérez',
            fullName: 'Juan Pérez',
            documentType: 'DNI',
            documentNumber: '12345678',
            clientType: 'JUBILADO',
            active: true,
            hasUserAccount: true,
          },
          account: {
            clientId: '507f1f77bcf86cd799439011',
            totalDebitsMinor: 500_000,
            totalCreditsMinor: 0,
            balanceMinor: 500_000,
            status: 'DEBT',
            lastMovementAt: '2025-01-01T00:00:00.000Z',
          },
        });
      }
      if (path.startsWith('/accounts/me/movements')) {
        return Promise.resolve({
          items: [
            {
              id: 'm1',
              clientId: '507f1f77bcf86cd799439011',
              direction: 'DEBIT',
              amountMinor: 500_000,
              signedAmountMinor: 500_000,
              movementType: 'MANUAL_ADJUSTMENT',
              description: 'Carga inicial',
              occurredAt: '2025-01-01T00:00:00.000Z',
              sourceType: 'MANUAL',
              sourceId: null,
              idempotencyKey: null,
              reversesMovementId: null,
              createdBy: null,
              createdAt: '2025-01-01T00:00:00.000Z',
            },
            {
              id: 'm2',
              clientId: '507f1f77bcf86cd799439011',
              direction: 'CREDIT',
              amountMinor: 100_000,
              signedAmountMinor: -100_000,
              movementType: 'REVERSAL',
              description: 'Reversión de prueba',
              occurredAt: '2025-01-02T00:00:00.000Z',
              sourceType: 'REVERSAL',
              sourceId: 'm0',
              idempotencyKey: null,
              reversesMovementId: 'm0',
              createdBy: null,
              createdAt: '2025-01-02T00:00:00.000Z',
            },
          ],
          pagination: { page: 1, limit: 10, total: 2, pages: 1 },
        });
      }
      return Promise.reject(new Error(`unexpected path: ${path}`));
    });

    renderWith(<CiudadanoCuentaPage />, '/ciudadano/cuenta');

    await waitFor(() => screen.getByText('Mi cuenta'));
    expect(screen.getByText('Carga inicial')).toBeInTheDocument();
    expect(screen.getByText('Reversión de prueba')).toBeInTheDocument();
    expect(screen.getByText('Reversión')).toBeInTheDocument();
    // NO administrative actions.
    expect(screen.queryByRole('button', { name: /Nuevo ajuste/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Revertir/i })).not.toBeInTheDocument();
  });

  it('Filtros Todos / Cargos / Créditos presentes', async () => {
    apiRequestMock.mockImplementation((path: string) => {
      if (path === '/clients/me') {
        return Promise.resolve({
          client: {
            id: '507f1f77bcf86cd799439011',
            firstName: 'Juan',
            lastName: 'Pérez',
            fullName: 'Juan Pérez',
            documentType: 'DNI',
            documentNumber: '12345678',
            phone: null,
            email: null,
            clientType: 'JUBILADO',
            address: {
              street: 'Av. San Martín',
              number: '123',
              floor: null,
              apartment: null,
              neighborhood: null,
              locality: 'Buchardo',
              postalCode: null,
              references: null,
            },
            active: true,
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        });
      }
      if (path === '/accounts/me/summary') {
        return Promise.resolve({
          client: {
            id: '507f1f77bcf86cd799439011',
            firstName: 'Juan',
            lastName: 'Pérez',
            fullName: 'Juan Pérez',
            documentType: 'DNI',
            documentNumber: '12345678',
            clientType: 'JUBILADO',
            active: true,
            hasUserAccount: true,
          },
          account: {
            clientId: '507f1f77bcf86cd799439011',
            totalDebitsMinor: 0,
            totalCreditsMinor: 0,
            balanceMinor: 0,
            status: 'SETTLED',
            lastMovementAt: null,
          },
        });
      }
      if (path.startsWith('/accounts/me/movements')) {
        return Promise.resolve({
          items: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 1 },
        });
      }
      return Promise.reject(new Error(`unexpected path: ${path}`));
    });

    renderWith(<CiudadanoCuentaPage />, '/ciudadano/cuenta');

    await waitFor(() => screen.getAllByRole('tab'));
    const tabs = screen.getAllByRole('tab');
    const labels = tabs.map((t) => t.textContent);
    expect(labels).toContain('Todos');
    expect(labels).toContain('Cargos');
    expect(labels).toContain('Créditos');
  });
});