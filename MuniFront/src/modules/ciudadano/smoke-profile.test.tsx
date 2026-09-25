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

import { CiudadanoPerfilPage } from './profile/pages/CiudadanoPerfilPage';

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

function mockClientResponse() {
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
          phone: '+54 358 4111111',
          email: 'vecino@buchardo.gob.ar',
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
    return Promise.reject(new Error(`unexpected path: ${path}`));
  });
}

describe('Smoke — MuniFront Portal Ciudadano (Profile)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Muestra campos protegidos read-only y permite editar los permitidos', async () => {
    mockClientResponse();

    renderWith(<CiudadanoPerfilPage />, '/ciudadano/perfil');

    await waitFor(() => screen.getByText(/Datos de identificación/i));
    // Read-only fields: text nodes render with friendly labels.
    expect(screen.getByText(/Juan/)).toBeInTheDocument();
    expect(screen.getByText(/Pérez/)).toBeInTheDocument();
    expect(screen.getByText(/12345678/)).toBeInTheDocument();
    expect(screen.getByText('Jubilado')).toBeInTheDocument();
    expect(screen.getByText('Buchardo')).toBeInTheDocument();
    expect(
      screen.getByText(/Para modificar tu nombre, documento, localidad/i),
    ).toBeInTheDocument();
    // Save button is present
    expect(screen.getByRole('button', { name: /Guardar cambios/i })).toBeInTheDocument();
  });
});