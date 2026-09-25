import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

import { CitizenAccessCard } from './components/CitizenAccessCard';

const adminUser: User = {
  id: '507f1f77bcf86cd799439099',
  firstName: 'Admin',
  lastName: 'Cuenta',
  email: 'admin@buchardo.gob.ar',
  role: 'ADMIN',
  permissions: ['clients.read', 'clients.update', 'clients.linkUser'],
  active: true,
};

function makeAuth(perms: string[]): AuthContextValue {
  const user: User = { ...adminUser, permissions: perms as User['permissions'] };
  return {
    user,
    status: 'authenticated',
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    hasRole: () => true,
    hasPermission: (...p) => p.every((x) => user.permissions.includes(x)),
  };
}

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderWith(ui: ReactNode, perms: string[] = adminUser.permissions) {
  const queryClient = makeQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={makeAuth(perms)}>
        <MemoryRouter>{ui}</MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe('Smoke — Admin Citizen Access Card', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Muestra "Sin acceso vinculado" cuando no hay user', async () => {
    apiRequestMock.mockResolvedValue({
      access: { linked: false, user: null },
    });

    renderWith(<CitizenAccessCard clientId="cid-1" clientName="Juan" />);

    await waitFor(() =>
      screen.getByText(/Esta cuenta no está vinculada/i),
    );
    expect(screen.getByLabelText(/Email, DNI o tel/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vincular cuenta/i })).toBeInTheDocument();
  });

  it('Muestra el email del usuario cuando hay vínculo', async () => {
    apiRequestMock.mockResolvedValue({
      access: {
        linked: true,
        user: {
          id: 'u1',
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'vecino@buchardo.gob.ar',
          documentNumber: '12345678',
          active: true,
        },
      },
    });

    renderWith(<CitizenAccessCard clientId="cid-1" clientName="Juan" />);

    await waitFor(() => screen.getByText('vecino@buchardo.gob.ar'));
    expect(screen.getByText('Cuenta vinculada')).toBeInTheDocument();
    expect(screen.getByText('Usuario activo')).toBeInTheDocument();
    expect(screen.getByText(/DNI/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Desvincular/i })).toBeInTheDocument();
  });

  it('Acepta email como identifier al vincular', async () => {
    apiRequestMock.mockImplementation((path: string, options?: { method?: string; body?: unknown }) => {
      if (path === '/clients/cid-1/citizen-access' && (!options || options.method === 'GET')) {
        return Promise.resolve({
          access: { linked: false, user: null },
        });
      }
      if (path === '/clients/cid-1/citizen-access' && options?.method === 'POST') {
        return Promise.resolve({
          linked: true,
          access: {
            linked: true,
            user: {
              id: 'u1',
              firstName: 'Juan',
              lastName: 'Pérez',
              email: 'vecino@buchardo.gob.ar',
              documentNumber: '12345678',
              active: true,
            },
          },
        });
      }
      return Promise.reject(new Error(`unexpected path: ${path}`));
    });

    renderWith(<CitizenAccessCard clientId="cid-1" clientName="Juan" />);

    await waitFor(() => screen.getByLabelText(/Email, DNI o tel/i));
    const input = screen.getByLabelText(/Email, DNI o tel/i);
    fireEvent.change(input, { target: { value: 'vecino@buchardo.gob.ar' } });
    fireEvent.click(screen.getByRole('button', { name: /Vincular cuenta/i }));

    await waitFor(() => {
      const postCall = apiRequestMock.mock.calls.find((c) => {
        const opts = c[1] as { method?: string; body?: unknown } | undefined;
        return (
          c[0] === '/clients/cid-1/citizen-access' && opts?.method === 'POST'
        );
      });
      expect(postCall).toBeDefined();
      expect((postCall?.[1] as { body?: { identifier?: string } }).body?.identifier).toBe(
        'vecino@buchardo.gob.ar',
      );
    });
  });

  it('Acepta DNI como identifier al vincular', async () => {
    apiRequestMock.mockImplementation((path: string, options?: { method?: string }) => {
      if (path === '/clients/cid-1/citizen-access' && (!options || options.method === 'GET')) {
        return Promise.resolve({ access: { linked: false, user: null } });
      }
      if (path === '/clients/cid-1/citizen-access' && options?.method === 'POST') {
        return Promise.resolve({
          linked: true,
          access: {
            linked: true,
            user: {
              id: 'u1',
              firstName: 'Juan',
              lastName: 'Pérez',
              email: 'vecino@buchardo.gob.ar',
              documentNumber: '12345678',
              active: true,
            },
          },
        });
      }
      return Promise.reject(new Error(`unexpected path: ${path}`));
    });

    renderWith(<CitizenAccessCard clientId="cid-1" clientName="Juan" />);

    await waitFor(() => screen.getByLabelText(/Email, DNI o tel/i));
    const input = screen.getByLabelText(/Email, DNI o tel/i);
    fireEvent.change(input, { target: { value: '12.345.678' } });
    fireEvent.click(screen.getByRole('button', { name: /Vincular cuenta/i }));

    await waitFor(() => {
      const postCall = apiRequestMock.mock.calls.find((c) => {
        const opts = c[1] as { method?: string; body?: { identifier?: string } } | undefined;
        return (
          c[0] === '/clients/cid-1/citizen-access' && opts?.method === 'POST'
        );
      });
      expect(postCall).toBeDefined();
      const opts = postCall?.[1] as { body?: { identifier?: string } } | undefined;
      expect(opts?.body?.identifier).toBe('12.345.678');
    });
  });

  it('Valida DNI con caracteres no válidos antes de llamar al backend', async () => {
    apiRequestMock.mockResolvedValue({ access: { linked: false, user: null } });

    renderWith(<CitizenAccessCard clientId="cid-1" clientName="Juan" />);

    await waitFor(() => screen.getByLabelText(/Email, DNI o tel/i));
    const input = screen.getByLabelText(/Email, DNI o tel/i);
    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.click(screen.getByRole('button', { name: /Vincular cuenta/i }));

    await waitFor(() =>
      expect(screen.getByText(/DNI inválido/i)).toBeInTheDocument(),
    );

    const postCall = apiRequestMock.mock.calls.find((c) => {
      const opts = c[1] as { method?: string } | undefined;
      return c[0] === '/clients/cid-1/citizen-access' && opts?.method === 'POST';
    });
    expect(postCall).toBeUndefined();
  });

  it('Sin permiso clients.linkUser: NO renderiza la tarjeta', async () => {
    renderWith(<CitizenAccessCard clientId="cid-1" clientName="Juan" />, [
      'clients.read',
    ]);

    await waitFor(() => {
      expect(screen.queryByText('Acceso ciudadano')).not.toBeInTheDocument();
    });
  });

  it('Botón Desvincular abre confirmación; confirmar llama DELETE', async () => {
    apiRequestMock.mockImplementation((path: string, options?: { method?: string }) => {
      if (path === '/clients/cid-1/citizen-access' && (!options || options.method === 'GET')) {
        return Promise.resolve({
          access: {
            linked: true,
            user: {
              id: 'u1',
              firstName: 'Juan',
              lastName: 'Pérez',
              email: 'vecino@buchardo.gob.ar',
              active: true,
            },
          },
        });
      }
      if (path === '/clients/cid-1/citizen-access' && options?.method === 'DELETE') {
        return Promise.resolve({
          access: { linked: false, user: null },
          clientId: 'cid-1',
        });
      }
      return Promise.reject(new Error(`unexpected path: ${path}`));
    });

    renderWith(<CitizenAccessCard clientId="cid-1" clientName="Juan" />);

    await waitFor(() => screen.getByRole('button', { name: /Desvincular/i }));
    fireEvent.click(screen.getByRole('button', { name: /Desvincular/i }));

    await waitFor(() =>
      screen.getByRole('button', { name: /Confirmar desvinculación/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: /Confirmar desvinculación/i }));

    await waitFor(() => {
      const calls = apiRequestMock.mock.calls.filter((c) => c[0] === '/clients/cid-1/citizen-access');
      // The DELETE call is the one we care about.
      const deleteCall = calls.find((c) => {
        const opts = c[1] as { method?: string } | undefined;
        return opts?.method === 'DELETE';
      });
      expect(deleteCall).toBeDefined();
      expect(deleteCall?.[0]).toBe('/clients/cid-1/citizen-access');
    });
  });

  it('Usuario inactivo: badge "Usuario inactivo"', async () => {
    apiRequestMock.mockResolvedValue({
      access: {
        linked: true,
        user: {
          id: 'u1',
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'vecino@buchardo.gob.ar',
          active: false,
        },
      },
    });

    renderWith(<CitizenAccessCard clientId="cid-1" clientName="Juan" />);

    await waitFor(() => screen.getByText('Usuario inactivo'));
  });
});