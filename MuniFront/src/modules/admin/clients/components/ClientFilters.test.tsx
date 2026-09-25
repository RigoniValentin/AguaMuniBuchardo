import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { clientsApi } from '../services/clients.api';
import {
  buildFiltersFromQuery,
  filtersToSearchParams,
  parseFiltersFromSearchParams,
} from './ClientFilters.helpers';
import type { Client } from '../types/clients.types';

vi.mock('../services/clients.api', () => ({
  clientsApi: {
    list: vi.fn(),
  },
}));

vi.mock('@/hooks/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'u1', role: 'ADMIN', permissions: ['clients.read'] },
    status: 'authenticated',
  }),
}));

const sampleClient: Client = {
  id: 'c1',
  firstName: 'Juan',
  lastName: 'Pérez',
  fullName: 'Juan Pérez',
  documentType: 'DNI',
  documentNumber: '12345678',
  phone: '+54 358 4123456',
  email: 'juan@example.com',
  zona: 'ZONA 1',
  clientType: 'LOCAL',
  address: {
    street: 'San Martín',
    number: '123',
    locality: 'Buchardo',
  },
  userId: null,
  hasUserAccount: false,
  notes: null,
  active: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-02T00:00:00.000Z',
  createdBy: null,
  updatedBy: null,
};

describe('buildFiltersFromQuery', () => {
  it('returns empty search and no filters when none provided', () => {
    const result = buildFiltersFromQuery({});
    expect(result).toEqual({ search: '' });
  });

  it('preserves provided filters', () => {
    const result = buildFiltersFromQuery({
      search: 'juan',
      clientType: 'LOCAL',
      active: true,
    });
    expect(result).toEqual({ search: 'juan', clientType: 'LOCAL', active: true });
  });
});

describe('parseFiltersFromSearchParams', () => {
  it('returns an empty object for a clean query string', () => {
    expect(parseFiltersFromSearchParams(new URLSearchParams(''))).toEqual({});
  });

  it('parses all supported filter keys', () => {
    const params = new URLSearchParams(
      'search=juan&clientType=JUBILADO&active=true&page=3&sortBy=createdAt&sortOrder=desc',
    );
    expect(parseFiltersFromSearchParams(params)).toEqual({
      search: 'juan',
      clientType: 'JUBILADO',
      active: true,
      page: 3,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('ignores unknown values for clientType and sortBy/sortOrder', () => {
    const params = new URLSearchParams(
      'clientType=BANANA&sortBy=foo&sortOrder=sideways&active=maybe&page=abc',
    );
    expect(parseFiltersFromSearchParams(params)).toEqual({});
  });

  it('parses active=false as boolean false', () => {
    const params = new URLSearchParams('active=false');
    expect(parseFiltersFromSearchParams(params)).toEqual({ active: false });
  });
});

describe('filtersToSearchParams', () => {
  it('omits default values to keep the URL clean', () => {
    expect(
      filtersToSearchParams({
        page: 1,
        limit: 20,
        sortBy: 'lastName',
        sortOrder: 'asc',
      }).toString(),
    ).toBe('');
  });

  it('serializes only the non-default values', () => {
    const params = filtersToSearchParams({
      page: 3,
      limit: 20,
      search: 'pérez',
      clientType: 'LOCAL',
      active: true,
      sortBy: 'lastName',
      sortOrder: 'asc',
    });
    expect(params.toString()).toBe('search=p%C3%A9rez&clientType=LOCAL&active=true&page=3');
  });
});

describe('clientsApi.list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns paginated clients', async () => {
    const mockedList = vi.mocked(clientsApi.list);
    mockedList.mockResolvedValue({
      items: [sampleClient],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });

    const result = await clientsApi.list({ page: 1, limit: 20 });
    expect(result.items).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
    expect(mockedList).toHaveBeenCalled();
  });
});

describe('AdminClientsPage — render states', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a loading spinner initially', async () => {
    const mockedList = vi.mocked(clientsApi.list);
    mockedList.mockReturnValue(new Promise(() => {}));

    const { AdminClientsPage } = await import('../pages/AdminClientsPage');
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminClientsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Cargando clientes/i)).toBeInTheDocument();
  });

  it('renders an empty state when there are no clients', async () => {
    const mockedList = vi.mocked(clientsApi.list);
    mockedList.mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 1 },
    });

    const { AdminClientsPage } = await import('../pages/AdminClientsPage');
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminClientsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Aún no hay clientes/i)).toBeInTheDocument();
    });
  });

  it('renders clients when the list resolves', async () => {
    const mockedList = vi.mocked(clientsApi.list);
    mockedList.mockResolvedValue({
      items: [sampleClient],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });

    const { AdminClientsPage } = await import('../pages/AdminClientsPage');
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminClientsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });
    expect(screen.getAllByText('Local').length).toBeGreaterThan(0);
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('renders an error state when the request fails', async () => {
    const mockedList = vi.mocked(clientsApi.list);
    mockedList.mockRejectedValue(new Error('boom'));

    const { AdminClientsPage } = await import('../pages/AdminClientsPage');
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminClientsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/No pudimos cargar los clientes/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
  });
});

describe('ClientFilters interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the filter inputs and the action buttons', async () => {
    const { ClientFilters } = await import('./ClientFilters');
    const onApply = vi.fn();
    const onReset = vi.fn();
    render(<ClientFilters initial={{ search: '' }} onApply={onApply} onReset={onReset} />);

    expect(screen.getByLabelText(/Buscar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de cliente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Estado/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aplicar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Limpiar/i })).toBeInTheDocument();
  });

  it('submits the search input via the apply button', async () => {
    const user = userEvent.setup();
    const { ClientFilters } = await import('./ClientFilters');
    const onApply = vi.fn();
    render(<ClientFilters initial={{ search: '' }} onApply={onApply} onReset={() => {}} />);

    await user.type(screen.getByLabelText(/Buscar/i), 'Pérez');
    await user.click(screen.getByRole('button', { name: /Aplicar/i }));

    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ search: 'Pérez' }));
  });

  it('clears filters via the reset button', async () => {
    const user = userEvent.setup();
    const { ClientFilters } = await import('./ClientFilters');
    const onReset = vi.fn();
    render(<ClientFilters initial={{ search: 'x' }} onApply={() => {}} onReset={onReset} />);

    await user.click(screen.getByRole('button', { name: /Limpiar/i }));
    expect(onReset).toHaveBeenCalled();
  });
});
