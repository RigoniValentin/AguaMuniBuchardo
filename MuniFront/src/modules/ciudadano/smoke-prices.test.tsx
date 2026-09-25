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

import { CiudadanoPreciosPage } from './prices/pages/CiudadanoPreciosPage';

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

describe('Smoke — MuniFront Portal Ciudadano (Prices)', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it('Productos activos con precios personalizados (con ajuste)', async () => {
    apiRequestMock.mockImplementation((path: string, options?: { method?: string; body?: unknown }) => {
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
      if (path.startsWith('/products') && path.includes('active=true')) {
        return Promise.resolve({
          items: [
            {
              id: 'p1',
              code: 'AGUA_RECARGA',
              name: 'Recarga de agua',
              description: null,
              productType: 'WATER_REFILL',
              basePriceMinor: 1_000_000,
              tracksStock: false,
              active: true,
              createdAt: '2025-01-01T00:00:00.000Z',
              updatedAt: '2025-01-01T00:00:00.000Z',
              createdBy: null,
              updatedBy: null,
            },
          ],
          pagination: { page: 1, limit: 100, total: 1, pages: 1 },
        });
      }
      if (path === '/pricing/me/quote' && options?.method === 'POST') {
        return Promise.resolve({
          client: {
            id: '507f1f77bcf86cd799439011',
            name: 'Juan Pérez',
            clientType: 'JUBILADO',
            active: true,
            hasUserAccount: true,
          },
          items: [
            {
              productId: 'p1',
              productName: 'Recarga de agua',
              quantity: 1,
              unitBasePriceMinor: 1_000_000,
              unitFinalPriceMinor: 500_000,
              subtotalFinalMinor: 500_000,
              adjustmentPercentage: -50,
            },
          ],
          totals: { baseMinor: 1_000_000, finalMinor: 500_000, adjustmentMinor: -500_000 },
        });
      }
      return Promise.reject(new Error(`unexpected path: ${path}`));
    });

    renderWith(<CiudadanoPreciosPage />, '/ciudadano/precios');

    await waitFor(() => screen.getAllByText('Recarga de agua').length > 0);
    await waitFor(() => {
      // Wait for the spinner "Calculando tu precio personalizado" to disappear,
      // which only happens after the quote resolves.
      expect(screen.queryByText(/Calculando tu precio/i)).not.toBeInTheDocument();
    });
    expect(screen.getByText('$ 5.000,00')).toBeInTheDocument();
  });

  it('Productos activos sin ajuste (precio base)', async () => {
    apiRequestMock.mockImplementation((path: string, options?: { method?: string }) => {
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
            clientType: 'LOCAL',
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
      if (path.startsWith('/products') && path.includes('active=true')) {
        return Promise.resolve({
          items: [
            {
              id: 'p1',
              code: 'BIDON',
              name: 'Bidón 20L',
              description: null,
              productType: 'CONTAINER',
              basePriceMinor: 1_500_000,
              tracksStock: false,
              active: true,
              createdAt: '2025-01-01T00:00:00.000Z',
              updatedAt: '2025-01-01T00:00:00.000Z',
              createdBy: null,
              updatedBy: null,
            },
          ],
          pagination: { page: 1, limit: 100, total: 1, pages: 1 },
        });
      }
      if (path === '/pricing/me/quote' && options?.method === 'POST') {
        return Promise.resolve({
          client: {
            id: '507f1f77bcf86cd799439011',
            name: 'Juan Pérez',
            clientType: 'LOCAL',
            active: true,
            hasUserAccount: true,
          },
          items: [
            {
              productId: 'p1',
              productName: 'Bidón 20L',
              quantity: 1,
              unitBasePriceMinor: 1_500_000,
              unitFinalPriceMinor: 1_500_000,
              subtotalFinalMinor: 1_500_000,
              adjustmentPercentage: 0,
            },
          ],
          totals: { baseMinor: 1_500_000, finalMinor: 1_500_000, adjustmentMinor: 0 },
        });
      }
      return Promise.reject(new Error(`unexpected path: ${path}`));
    });

    renderWith(<CiudadanoPreciosPage />, '/ciudadano/precios');

    await waitFor(() => screen.getAllByText('Bidón 20L').length > 0);
    expect(screen.getByText('$ 15.000,00')).toBeInTheDocument();
  });

  it('Cliente inactivo: muestra mensaje informativo', async () => {
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
            clientType: 'LOCAL',
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
      return Promise.reject(new Error(`unexpected path: ${path}`));
    });

    renderWith(<CiudadanoPreciosPage />, '/ciudadano/precios');

    await waitFor(() =>
      screen.getByText(/Tu cuenta no está habilitada/i),
    );
  });
});