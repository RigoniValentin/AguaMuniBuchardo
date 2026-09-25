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

import { RepartidorHomePage } from './RepartidorHomePage';

const driverUser: User = {
  id: '507f1f77bcf86cd799439d11',
  firstName: 'Mario',
  lastName: 'Gómez',
  email: 'driver@buchardo.gob.ar',
  role: 'REPARTIDOR',
  permissions: [
    'delivery.read',
    'delivery.claim',
    'delivery.update',
    'delivery.create',
  ],
  active: true,
};

function makeAuth(): AuthContextValue {
  return {
    user: driverUser,
    status: 'authenticated',
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    hasRole: () => true,
    hasPermission: (...p) => p.every((x) => driverUser.permissions.includes(x)),
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

describe('Smoke — MuniFront Repartidor Home', () => {
  beforeEach(() => apiRequestMock.mockReset());

  it('muestra pedidos asignados y CTA de nueva entrega', async () => {
    apiRequestMock.mockImplementation((path: string) => {
      if (typeof path !== 'string') return Promise.resolve({} as never);
      if (path.startsWith('/delivery/me/orders')) {
        return Promise.resolve({
          items: [
            {
              id: 'o1',
              clientId: 'c1',
              origin: 'CITIZEN',
              status: 'ASSIGNED',
              items: [
                {
                  productId: 'p1',
                  productCode: 'RECARGA',
                  productName: 'Recarga',
                  productType: 'WATER_REFILL',
                  quantity: 1,
                  unitBasePriceMinor: 1_000_000,
                  adjustmentPercentage: 0,
                  unitFinalPriceMinor: 1_000_000,
                  subtotalBaseMinor: 1_000_000,
                  subtotalFinalMinor: 1_000_000,
                  appliedRuleId: null,
                  appliedRuleName: null,
                },
              ],
              totalBaseMinor: 1_000_000,
              totalFinalMinor: 1_000_000,
              deliveryAddress: {
                street: 'San Martín',
                number: '100',
                floor: null,
                apartment: null,
                neighborhood: null,
                locality: 'Buchardo',
                postalCode: null,
                references: null,
              },
              customerNote: null,
              assignedTo: driverUser.id,
              assignedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              client: {
                id: 'c1',
                firstName: 'Ana',
                lastName: 'Pérez',
                fullName: 'Ana Pérez',
                documentType: 'DNI',
                documentNumber: '12345678',
                clientType: 'LOCAL',
                active: true,
              },
            },
          ],
          pagination: { page: 1, limit: 50, total: 1, pages: 1 },
        });
      }
      return Promise.reject(new Error(`unexpected: ${path}`));
    });

    renderWith(<RepartidorHomePage />, '/repartidor');

    await waitFor(() =>
      expect(screen.getByText('Ana Pérez')).toBeInTheDocument(),
    );
    expect(screen.getByText('San Martín 100')).toBeInTheDocument();
    expect(screen.getByText(/10\.000,00/)).toBeInTheDocument();
    expect(screen.getByText('+ Nueva entrega')).toBeInTheDocument();
    expect(screen.getByText('Asignado')).toBeInTheDocument();
  });

  it('muestra empty state cuando no hay pedidos', async () => {
    apiRequestMock.mockImplementation((path: string) => {
      if (typeof path !== 'string') return Promise.resolve({} as never);
      if (path.startsWith('/delivery/me/orders')) {
        return Promise.resolve({
          items: [],
          pagination: { page: 1, limit: 50, total: 0, pages: 1 },
        });
      }
      return Promise.reject(new Error(`unexpected: ${path}`));
    });

    renderWith(<RepartidorHomePage />, '/repartidor');

    await waitFor(() =>
      expect(screen.getByText('Sin pedidos')).toBeInTheDocument(),
    );
  });
});
