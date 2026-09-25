import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from '@/hooks/auth-context';
import type { User } from '@/types/auth';

// Mock the underlying apiRequest so all modules pick up the same responses.
const { apiRequestMock } = vi.hoisted(() => ({ apiRequestMock: vi.fn() }));

vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<typeof import('@/services/api')>('@/services/api');
  return {
    ...actual,
    apiRequest: apiRequestMock,
  };
});

import { CiudadanoDashboardPage } from './dashboard/pages/CiudadanoDashboardPage';

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

describe('Smoke — MuniFront Portal Ciudadano (Dashboard)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Saluda con el nombre del ciudadano cuando el cliente está vinculado', async () => {
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
              neighborhood: 'Centro',
              locality: 'Buchardo',
              postalCode: 'X5000',
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
            totalDebitsMinor: 1_000_000,
            totalCreditsMinor: 0,
            balanceMinor: 1_000_000,
            status: 'DEBT',
            lastMovementAt: null,
          },
        });
      }
      if (path === '/accounts/me/movements?page=1&limit=5') {
        return Promise.resolve({
          items: [],
          pagination: { page: 1, limit: 5, total: 0, pages: 1 },
        });
      }
      return Promise.reject(new Error(`unexpected path: ${path}`));
    });

    renderWith(<CiudadanoDashboardPage />, '/ciudadano');

    await waitFor(() => screen.getByText(/Hola, Juan/));
  });

  it('Muestra estado CLIENT_NOT_LINKED cuando el backend rechaza', async () => {
    apiRequestMock.mockImplementation((path: string) => {
      if (path === '/clients/me') {
        const err = new Error('Tu usuario todavía no está vinculado a un cliente') as Error & {
          code?: string;
        };
        err.code = 'CLIENT_NOT_LINKED';
        return Promise.reject(err);
      }
      return Promise.reject(new Error(`unexpected path: ${path}`));
    });

    renderWith(<CiudadanoDashboardPage />, '/ciudadano');

    await waitFor(() =>
      screen.getByText(/Tu cuenta todavía no está vinculada/i),
    );
    expect(screen.queryByText(/Hola,/)).not.toBeInTheDocument();
  });

  it('Muestra el saldo como deuda con la frase amigable', async () => {
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
            totalDebitsMinor: 800_000,
            totalCreditsMinor: 0,
            balanceMinor: 800_000,
            status: 'DEBT',
            lastMovementAt: null,
          },
        });
      }
      if (path === '/accounts/me/movements?page=1&limit=5') {
        return Promise.resolve({
          items: [
            {
              id: 'm1',
              clientId: '507f1f77bcf86cd799439011',
              direction: 'DEBIT',
              amountMinor: 800_000,
              signedAmountMinor: 800_000,
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
          ],
          pagination: { page: 1, limit: 5, total: 1, pages: 1 },
        });
      }
      return Promise.reject(new Error(`unexpected path: ${path}`));
    });

    renderWith(<CiudadanoDashboardPage />, '/ciudadano');

    await waitFor(() =>
      screen.getByText(/Tenés una deuda de/),
    );
    expect(screen.getByText('Carga inicial')).toBeInTheDocument();
    // DEBT status surfaces the "Informar pago" CTA inside the balance card
    // so the demo flow is one tap away from the dashboard. The quick-link
    // grid also has a similar card — query by the button role.
    const ctaButtons = screen.getAllByRole('button', { name: /informar pago/i });
    expect(ctaButtons.length).toBeGreaterThanOrEqual(1);
    // At least one must be wrapped in a link to the payment form.
    const ctaLink = ctaButtons
      .map((b) => b.closest('a'))
      .find((a): a is HTMLAnchorElement => Boolean(a));
    expect(ctaLink).toBeTruthy();
    expect(ctaLink!.getAttribute('href')).toBe('/ciudadano/pagos/nuevo');
  });

  it('Muestra el saldo como a favor (CREDIT)', async () => {
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
            totalDebitsMinor: 100_000,
            totalCreditsMinor: 500_000,
            balanceMinor: -400_000,
            status: 'CREDIT',
            lastMovementAt: null,
          },
        });
      }
      if (path === '/accounts/me/movements?page=1&limit=5') {
        return Promise.resolve({
          items: [],
          pagination: { page: 1, limit: 5, total: 0, pages: 1 },
        });
      }
      return Promise.reject(new Error(`unexpected path: ${path}`));
    });

    renderWith(<CiudadanoDashboardPage />, '/ciudadano');

    await waitFor(() => screen.getByText(/a favor/));
  });

  it('Muestra el saldo al día (SETTLED)', async () => {
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
      if (path === '/accounts/me/movements?page=1&limit=5') {
        return Promise.resolve({
          items: [],
          pagination: { page: 1, limit: 5, total: 0, pages: 1 },
        });
      }
      return Promise.reject(new Error(`unexpected path: ${path}`));
    });

    renderWith(<CiudadanoDashboardPage />, '/ciudadano');

    await waitFor(() => screen.getByText(/Tu cuenta está al día/i));
  });

  it('Cliente inactivo: muestra aviso', async () => {
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
            active: false,
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
            active: false,
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
      if (path === '/accounts/me/movements?page=1&limit=5') {
        return Promise.resolve({
          items: [],
          pagination: { page: 1, limit: 5, total: 0, pages: 1 },
        });
      }
      return Promise.reject(new Error(`unexpected path: ${path}`));
    });

    renderWith(<CiudadanoDashboardPage />, '/ciudadano');

    await waitFor(() =>
      screen.getByText(/Tu cuenta no está habilitada/i),
    );
  });

  it('Muestra accesos rápidos', async () => {
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
      if (path === '/accounts/me/movements?page=1&limit=5') {
        return Promise.resolve({
          items: [],
          pagination: { page: 1, limit: 5, total: 0, pages: 1 },
        });
      }
      return Promise.reject(new Error(`unexpected path: ${path}`));
    });

    renderWith(<CiudadanoDashboardPage />, '/ciudadano');

    await waitFor(() => screen.getByText('Informar pago'));
    expect(screen.getByText('Ver mi cuenta')).toBeInTheDocument();
    expect(screen.getByText('Ver precios')).toBeInTheDocument();
  });
});