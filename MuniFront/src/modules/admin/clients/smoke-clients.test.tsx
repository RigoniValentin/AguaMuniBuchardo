/* Smoke test del módulo admin/clients con mocks de TanStack Query. */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '@/hooks/auth-context';
import type { Role, User } from '@/types/auth';
import { clientsApi } from './services/clients.api';
import type { Client } from './types/clients.types';
import { AdminClientsPage } from './pages/AdminClientsPage';
import { AdminClientDetailPage } from './pages/AdminClientDetailPage';
import { AdminClientEditorPage } from './pages/AdminClientEditorPage';

vi.mock('./services/clients.api', () => ({
  clientsApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/modules/admin/accounts/services/accounts.api', () => ({
  accountsApi: {
    list: vi.fn().mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 1 },
    }),
    getSummary: vi.fn().mockResolvedValue({
      client: {
        id: 'mock',
        firstName: 'Mock',
        lastName: 'Mock',
        fullName: 'Mock',
        documentType: 'DNI',
        documentNumber: '0',
        clientType: 'LOCAL',
        active: true,
        hasUserAccount: false,
      },
      account: {
        clientId: 'mock',
        totalDebitsMinor: 0,
        totalCreditsMinor: 0,
        balanceMinor: 0,
        status: 'SETTLED',
        lastMovementAt: null,
      },
    }),
    listMovements: vi.fn().mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 1 },
    }),
    createAdjustment: vi.fn(),
    reverseMovement: vi.fn(),
  },
}));

const mockUser: User = {
  id: '507f1f77bcf86cd799439099',
  firstName: 'Smoke',
  lastName: 'Admin',
  email: 'smoke@buchardo.gob.ar',
  role: 'ADMIN' as Role,
  permissions: [
    'clients.read',
    'clients.create',
    'clients.update',
    'accounts.read',
    'accounts.adjust',
    'accounts.reverse',
  ],
  active: true,
};

function makeAuthValue(): AuthContextValue {
  return {
    user: mockUser,
    status: 'authenticated',
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    hasRole: (...roles: Role[]) => roles.includes(mockUser.role),
    hasPermission: (...required) =>
      required.every((p) => mockUser.permissions.includes(p)),
  };
}

function AuthWrapper({ children }: { children: ReactNode }) {
  return <AuthContext.Provider value={makeAuthValue()}>{children}</AuthContext.Provider>;
}

const baseClient: Client = {
  id: '507f1f77bcf86cd799439011',
  firstName: 'Juan',
  lastName: 'Pérez',
  fullName: 'Juan Pérez',
  documentType: 'DNI',
  documentNumber: '12345678',
  phone: '+54 358 4123456',
  email: 'juan@example.com',
  clientType: 'LOCAL',
  address: {
    street: 'Av. San Martín',
    number: '123',
    locality: 'Buchardo',
  },
  zona: 'ZONA 1',
  userId: null,
  hasUserAccount: false,
  notes: null,
  active: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-02T00:00:00.000Z',
  createdBy: null,
  updatedBy: null,
};

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderWith(initialPath: string) {
  const queryClient = makeQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthWrapper>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/admin/clientes" element={<AdminClientsPage />} />
            <Route path="/admin/clientes/nuevo" element={<AdminClientEditorPage />} />
            <Route path="/admin/clientes/:id" element={<AdminClientDetailPage />} />
            <Route path="/admin/clientes/:id/editar" element={<AdminClientEditorPage />} />
          </Routes>
        </MemoryRouter>
      </AuthWrapper>
    </QueryClientProvider>,
  );
}

describe('Smoke — MuniFront Admin Clientes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Lista clientes mockeados', async () => {
    vi.mocked(clientsApi.list).mockResolvedValue({
      items: [baseClient],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });

    renderWith('/admin/clientes');
    await waitFor(() => expect(screen.getByText('Juan Pérez')).toBeInTheDocument());
    expect(screen.getByText('Av. San Martín 123, Buchardo')).toBeInTheDocument();
  });

  it('Muestra error del API', async () => {
    vi.mocked(clientsApi.list).mockRejectedValue(new Error('boom'));

    renderWith('/admin/clientes');
    await waitFor(() =>
      expect(screen.getByText(/No pudimos cargar los clientes/i)).toBeInTheDocument(),
    );
  });

  it('Filtra por búsqueda', async () => {
    vi.mocked(clientsApi.list).mockResolvedValue({
      items: [baseClient],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });

    renderWith('/admin/clientes');
    await waitFor(() => screen.getByText('Juan Pérez'));

    const search = screen.getByLabelText(/Buscar/i);
    fireEvent.change(search, { target: { value: 'Pérez' } });
    fireEvent.click(screen.getByRole('button', { name: /Aplicar/i }));
    await waitFor(() => {
      const calls = vi.mocked(clientsApi.list).mock.calls;
      const lastCall = calls[calls.length - 1]?.[0];
      expect(lastCall?.search).toBe('Pérez');
    });
  });

  it('Carga detalle del cliente', async () => {
    vi.mocked(clientsApi.get).mockResolvedValue({ client: baseClient });
    renderWith(`/admin/clientes/${baseClient.id}`);
    await waitFor(() => expect(screen.getByText('Editar')).toBeInTheDocument());
    expect(screen.getByText('Av. San Martín 123, Buchardo')).toBeInTheDocument();
  });

  it('Formulario de creación envía payload correcto', async () => {
    vi.mocked(clientsApi.create).mockResolvedValue({ client: { ...baseClient, id: 'new-id' } });

    renderWith('/admin/clientes/nuevo');
    await waitFor(() => screen.getByLabelText(/^Nombre$/i));

    fireEvent.change(screen.getByLabelText(/^Nombre$/i), { target: { value: 'Pedro' } });
    fireEvent.change(screen.getByLabelText(/^Apellido$/i), { target: { value: 'Gómez' } });
    fireEvent.change(screen.getByLabelText(/Número de documento/i), {
      target: { value: '87654321' },
    });
    fireEvent.change(screen.getByLabelText(/^Calle$/i), { target: { value: 'Belgrano' } });
    fireEvent.change(screen.getByLabelText('Número'), { target: { value: '456' } });
    fireEvent.click(screen.getByRole('button', { name: /Crear cliente/i }));

    await waitFor(() => expect(clientsApi.create).toHaveBeenCalled());
    const payload = vi.mocked(clientsApi.create).mock.calls[0]?.[0];
    expect(payload).toMatchObject({
      firstName: 'Pedro',
      lastName: 'Gómez',
      documentNumber: '87654321',
      clientType: 'LOCAL',
      address: expect.objectContaining({ street: 'Belgrano', number: '456' }),
    });
  });

  it('Tipos de cliente se visualizan amigablemente', async () => {
    vi.mocked(clientsApi.list).mockResolvedValue({
      items: [
        { ...baseClient, id: '1', clientType: 'LOCAL', fullName: 'Local User' },
        { ...baseClient, id: '2', clientType: 'JUBILADO', fullName: 'Jubilado User' },
        { ...baseClient, id: '3', clientType: 'NO_LOCAL', fullName: 'No Local User' },
        { ...baseClient, id: '4', clientType: 'AYUDA_SOCIAL', fullName: 'Ayuda User' },
      ],
      pagination: { page: 1, limit: 20, total: 4, pages: 1 },
    });

    renderWith('/admin/clientes');
    await waitFor(() => expect(screen.getByText('Local User')).toBeInTheDocument());
    expect(screen.getAllByText('Local').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Jubilado').length).toBeGreaterThan(0);
    expect(screen.getAllByText('No local').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ayuda social').length).toBeGreaterThan(0);
    expect(screen.queryByText('NO_LOCAL')).not.toBeInTheDocument();
  });

  it('Estados activo/inactivo visibles', async () => {
    vi.mocked(clientsApi.list).mockResolvedValue({
      items: [
        { ...baseClient, id: '1', fullName: 'Cliente Activo', active: true },
        { ...baseClient, id: '2', fullName: 'Cliente Inactivo', active: false },
      ],
      pagination: { page: 1, limit: 20, total: 2, pages: 1 },
    });

    renderWith('/admin/clientes');
    await waitFor(() => expect(screen.getByText('Cliente Activo')).toBeInTheDocument());
    expect(screen.getAllByText('Activo').length).toBeGreaterThan(0);
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('Aplica el filtro y pagina desde el query string al montar', async () => {
    vi.mocked(clientsApi.list).mockResolvedValue({
      items: [baseClient],
      pagination: { page: 2, limit: 20, total: 30, pages: 2 },
    });

    renderWith('/admin/clientes?search=juan&clientType=LOCAL&active=true&page=2');

    await waitFor(() => expect(screen.getByText('Juan Pérez')).toBeInTheDocument());
    const lastCall =
      vi.mocked(clientsApi.list).mock.calls[vi.mocked(clientsApi.list).mock.calls.length - 1]?.[0];
    expect(lastCall).toMatchObject({
      search: 'juan',
      clientType: 'LOCAL',
      active: true,
      page: 2,
    });
  });

  it('Sincroniza el query string al aplicar filtros y al paginar', async () => {
    vi.mocked(clientsApi.list).mockResolvedValue({
      items: [baseClient],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });

    const { rerender } = renderWith('/admin/clientes');
    await waitFor(() => expect(screen.getByText('Juan Pérez')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText(/Buscar/i), { target: { value: 'Pérez' } });
    fireEvent.click(screen.getByRole('button', { name: /Aplicar/i }));

    await waitFor(() => {
      const calls = vi.mocked(clientsApi.list).mock.calls;
      const lastCall = calls[calls.length - 1]?.[0];
      expect(lastCall?.search).toBe('Pérez');
      expect(lastCall?.page).toBe(1);
    });

    rerender(
      <QueryClientProvider client={makeQueryClient()}>
        <AuthWrapper>
          <MemoryRouter initialEntries={['/admin/clientes?search=P%C3%A9rez&page=1']}>
            <Routes>
              <Route path="/admin/clientes" element={<AdminClientsPage />} />
              <Route path="/admin/clientes/nuevo" element={<AdminClientEditorPage />} />
              <Route path="/admin/clientes/:id" element={<AdminClientDetailPage />} />
              <Route path="/admin/clientes/:id/editar" element={<AdminClientEditorPage />} />
            </Routes>
          </MemoryRouter>
        </AuthWrapper>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByDisplayValue('Pérez')).toBeInTheDocument());
  });

  it('Restablece el query string al limpiar filtros', async () => {
    vi.mocked(clientsApi.list).mockResolvedValue({
      items: [baseClient],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });

    renderWith('/admin/clientes?search=juan&clientType=LOCAL');
    await waitFor(() => expect(screen.getByText('Juan Pérez')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Limpiar/i }));

    await waitFor(() => {
      const calls = vi.mocked(clientsApi.list).mock.calls;
      const lastCall = calls[calls.length - 1]?.[0];
      expect(lastCall?.search).toBeUndefined();
      expect(lastCall?.clientType).toBeUndefined();
      expect(lastCall?.page).toBe(1);
    });
  });
});
