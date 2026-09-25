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

import { CiudadanoNuevoPedidoPage } from './CiudadanoNuevoPedidoPage';

const citizenUser: User = {
  id: '507f1f77bcf86cd799439099',
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'vecino@buchardo.gob.ar',
  role: 'CIUDADANO',
  permissions: ['products.read', 'pricing.quote', 'orders.self'],
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

interface MockArgs {
  method?: string;
  body?: unknown;
}

describe('Smoke — MuniFront Ciudadano Nuevo Pedido', () => {
  beforeEach(() => apiRequestMock.mockReset());

  it('muestra productos y total del pedido al confirmar', async () => {
    apiRequestMock.mockImplementation(
      (path: string, options?: MockArgs) => {
        if (typeof path !== 'string') {
          // Defensive: cleanup-time stray calls during teardown.
          return Promise.resolve({} as unknown);
        }
        if (path === '/clients/me') {
          return Promise.resolve({
            client: {
              id: '507f1f77bcf86cd799439aaa',
              firstName: 'Juan',
              lastName: 'Pérez',
              fullName: 'Juan Pérez',
              documentType: 'DNI',
              documentNumber: '12345678',
              phone: null,
              email: null,
              clientType: 'JUBILADO',
              address: {
                street: 'Belgrano',
                number: '250',
                floor: null,
                apartment: null,
                neighborhood: null,
                locality: 'Buchardo',
                postalCode: null,
                references: null,
              },
              active: true,
              createdAt: new Date().toISOString(),
            },
          });
        }
        if (path.startsWith('/products')) {
          return Promise.resolve({
            items: [
              {
                id: 'p1',
                code: 'RECARGA',
                name: 'Recarga de agua',
                description: null,
                productType: 'WATER_REFILL',
                basePriceMinor: 1_000_000,
                tracksStock: false,
                active: true,
              },
            ],
            pagination: { page: 1, limit: 100, total: 1, pages: 1 },
          });
        }
        if (path === '/pricing/me/quote' && options?.method === 'POST') {
          return Promise.resolve({
            client: {
              id: '507f1f77bcf86cd799439aaa',
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
        if (path === '/orders/me' && options?.method === 'POST') {
          return Promise.resolve({
            order: {
              id: '507f1f77bcf86cd799439bbb',
              clientId: '507f1f77bcf86cd799439aaa',
              origin: 'CITIZEN',
              status: 'CONFIRMED',
              items: [],
              totalBaseMinor: 1_000_000,
              totalFinalMinor: 500_000,
              deliveryAddress: {
                street: 'Belgrano',
                number: '250',
                floor: null,
                apartment: null,
                neighborhood: null,
                locality: 'Buchardo',
                postalCode: null,
                references: null,
              },
              customerNote: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });
        }
        return Promise.reject(new Error(`unexpected: ${path}`));
      },
    );

    renderWith(<CiudadanoNuevoPedidoPage />, '/ciudadano/pedidos/nuevo');

    await waitFor(() =>
      expect(screen.getByText('Recarga de agua')).toBeInTheDocument(),
    );

    await waitFor(() =>
      expect(screen.getByLabelText('Agregar Recarga de agua')).toBeInTheDocument(),
    );
    const plus = screen.getByLabelText('Agregar Recarga de agua');
    plus.click();

    // Wait for the total to be rendered with the JUBILADO -50% adjusted price.
    await waitFor(
      () => {
        const totals = screen.getAllByText(/5\.000,00/);
        expect(totals.length).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );
  });

  it('muestra "no generará deuda" cuando el total es $0 (AYUDA_SOCIAL)', async () => {
    apiRequestMock.mockImplementation(
      (path: string, _options?: MockArgs) => {
        if (typeof path !== 'string') {
          return Promise.resolve({} as unknown);
        }
        if (path === '/clients/me') {
          return Promise.resolve({
            client: {
              id: 'cid',
              firstName: 'A',
              lastName: 'B',
              fullName: 'A B',
              documentType: 'DNI',
              documentNumber: '99',
              phone: null,
              email: null,
              clientType: 'AYUDA_SOCIAL',
              address: {
                street: 'X',
                number: '1',
                floor: null,
                apartment: null,
                neighborhood: null,
                locality: 'Buchardo',
                postalCode: null,
                references: null,
              },
              active: true,
              createdAt: new Date().toISOString(),
            },
          });
        }
        if (path.startsWith('/products')) {
          return Promise.resolve({
            items: [
              {
                id: 'p1',
                code: 'P1',
                name: 'Producto social',
                description: null,
                productType: 'OTHER',
                basePriceMinor: 1_000_000,
                tracksStock: false,
                active: true,
              },
            ],
            pagination: { page: 1, limit: 100, total: 1, pages: 1 },
          });
        }
        if (path === '/pricing/me/quote') {
          return Promise.resolve({
            client: { id: 'cid', name: 'A B', clientType: 'AYUDA_SOCIAL', active: true, hasUserAccount: true },
            items: [
              {
                productId: 'p1',
                productName: 'Producto social',
                quantity: 1,
                unitBasePriceMinor: 1_000_000,
                unitFinalPriceMinor: 0,
                subtotalFinalMinor: 0,
                adjustmentPercentage: -100,
              },
            ],
            totals: { baseMinor: 1_000_000, finalMinor: 0, adjustmentMinor: -1_000_000 },
          });
        }
        return Promise.reject(new Error(`unexpected: ${path}`));
      },
    );

    renderWith(<CiudadanoNuevoPedidoPage />, '/ciudadano/pedidos/nuevo');
    await waitFor(() => screen.getByText('Producto social'));
    screen.getByLabelText('Agregar Producto social').click();

    await waitFor(() =>
      expect(
        screen.getByText(/Este pedido no generará deuda/i),
      ).toBeInTheDocument(),
    );
  });

  it('pide confirmación antes de enviar el pedido', async () => {
    apiRequestMock.mockImplementation(
      (path: string, options?: MockArgs) => {
        if (typeof path !== 'string') {
          return Promise.resolve({} as unknown);
        }
        if (path === '/clients/me') {
          return Promise.resolve({
            client: {
              id: '507f1f77bcf86cd799439ccc',
              firstName: 'Ana',
              lastName: 'Gómez',
              fullName: 'Ana Gómez',
              documentType: 'DNI',
              documentNumber: '22222222',
              phone: null,
              email: null,
              clientType: 'ESTANDAR',
              address: {
                street: 'San Martín',
                number: '100',
                floor: null,
                apartment: null,
                neighborhood: null,
                locality: 'Buchardo',
                postalCode: null,
                references: null,
              },
              active: true,
              createdAt: new Date().toISOString(),
            },
          });
        }
        if (path.startsWith('/products')) {
          return Promise.resolve({
            items: [
              {
                id: 'p1',
                code: 'BIDON',
                name: 'Bidón 20L',
                description: null,
                productType: 'WATER_REFILL',
                basePriceMinor: 1_000_000,
                tracksStock: false,
                active: true,
              },
            ],
            pagination: { page: 1, limit: 100, total: 1, pages: 1 },
          });
        }
        if (path === '/pricing/me/quote' && options?.method === 'POST') {
          return Promise.resolve({
            client: {
              id: '507f1f77bcf86cd799439ccc',
              name: 'Ana Gómez',
              clientType: 'ESTANDAR',
              active: true,
              hasUserAccount: true,
            },
            items: [
              {
                productId: 'p1',
                productName: 'Bidón 20L',
                quantity: 2,
                unitBasePriceMinor: 1_000_000,
                unitFinalPriceMinor: 1_000_000,
                subtotalFinalMinor: 2_000_000,
                adjustmentPercentage: 0,
              },
            ],
            totals: { baseMinor: 2_000_000, finalMinor: 2_000_000, adjustmentMinor: 0 },
          });
        }
        if (path === '/orders/me' && options?.method === 'POST') {
          return Promise.resolve({
            order: {
              id: '507f1f77bcf86cd799439ddd',
              clientId: '507f1f77bcf86cd799439ccc',
              origin: 'CITIZEN',
              status: 'CONFIRMED',
              items: [],
              totalBaseMinor: 2_000_000,
              totalFinalMinor: 2_000_000,
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
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          });
        }
        return Promise.reject(new Error(`unexpected: ${path}`));
      },
    );

    renderWith(<CiudadanoNuevoPedidoPage />, '/ciudadano/pedidos/nuevo');

    await waitFor(() => screen.getByText('Bidón 20L'));
    screen.getByLabelText('Agregar Bidón 20L').click();
    screen.getByLabelText('Agregar Bidón 20L').click();

    await waitFor(() => {
      const totals = screen.getAllByText(/20\.000,00/);
      expect(totals.length).toBeGreaterThan(0);
    });

    // No debe haber enviado el pedido todavía.
    expect(apiRequestMock).not.toHaveBeenCalledWith(
      '/orders/me',
      expect.objectContaining({ method: 'POST' }),
    );

    // Paso de revisión.
    const reviewBtn = await screen.findByRole('button', { name: /Revisar pedido/i });
    reviewBtn.click();

    await waitFor(() =>
      expect(
        screen.getByText(/Al confirmar, estás registrando/i),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText(/2×/)).toBeInTheDocument();
    expect(screen.getByText('Bidón 20L')).toBeInTheDocument();

    // Volver no debe enviar.
    screen.getByRole('button', { name: /Volver/i }).click();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Revisar pedido/i })).toBeInTheDocument(),
    );
    expect(apiRequestMock).not.toHaveBeenCalledWith(
      '/orders/me',
      expect.objectContaining({ method: 'POST' }),
    );

    // Confirmar y enviar dispara el POST /orders/me.
    screen.getByRole('button', { name: /Revisar pedido/i }).click();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Confirmar y enviar/i })).toBeInTheDocument(),
    );
    screen.getByRole('button', { name: /Confirmar y enviar/i }).click();

    await waitFor(
      () =>
        expect(apiRequestMock).toHaveBeenCalledWith(
          '/orders/me',
          expect.objectContaining({ method: 'POST' }),
        ),
      { timeout: 3000 },
    );
  });
});
