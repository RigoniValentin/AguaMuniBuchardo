import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from '@/hooks/auth-context';
import type { User } from '@/types/auth';

const { apiRequestMock, multipartRequestMock, fetchBlobMock } = vi.hoisted(() => ({
  apiRequestMock: vi.fn(),
  multipartRequestMock: vi.fn(),
  fetchBlobMock: vi.fn(),
}));

vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<typeof import('@/services/api')>('@/services/api');
  return { ...actual, apiRequest: apiRequestMock };
});

vi.mock('@/modules/payments/services/multipart.api', async () => {
  const actual = await vi.importActual<
    typeof import('@/modules/payments/services/multipart.api')
  >('@/modules/payments/services/multipart.api');
  return {
    ...actual,
    multipartRequest: multipartRequestMock,
    fetchBlob: fetchBlobMock,
  };
});

import { CiudadanoPagosPage } from '@/modules/payments/pages/CiudadanoPagosPage';
import { CiudadanoNuevoPagoPage } from '@/modules/payments/pages/CiudadanoNuevoPagoPage';
import { CiudadanoPagoDetailPage } from '@/modules/payments/pages/CiudadanoPagoDetailPage';

const citizenUser: User = {
  id: '507f1f77bcf86cd799439099',
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'vecino@buchardo.gob.ar',
  role: 'CIUDADANO',
  permissions: ['products.read', 'pricing.quote', 'accounts.self', 'clients.self', 'payments.self'],
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
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="*" element={ui} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

function renderDetail(initialPath: string) {
  const queryClient = makeQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={makeAuth()}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/ciudadano/pagos/:id" element={<CiudadanoPagoDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe('Smoke — MuniFront Portal Ciudadano (Pagos)', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    multipartRequestMock.mockReset();
    fetchBlobMock.mockReset();
  });

  it('Lista pagos del ciudadano y muestra estados', async () => {
    apiRequestMock.mockResolvedValue({
      items: [
        {
          id: 'p1',
          amountMinor: 100_000,
          paymentMethod: 'BANK_TRANSFER',
          status: 'PENDING',
          note: null,
          submittedAt: '2025-03-01T12:00:00.000Z',
          reviewedAt: null,
          rejectionReason: null,
          reversedAt: null,
          reversalReason: null,
          createdAt: '2025-03-01T12:00:00.000Z',
          receipt: { originalName: 'a.png', mimeType: 'image/png', size: 100 },
        },
        {
          id: 'p2',
          amountMinor: 200_000,
          paymentMethod: 'OTHER',
          status: 'REJECTED',
          note: null,
          submittedAt: '2025-02-20T12:00:00.000Z',
          reviewedAt: '2025-02-21T12:00:00.000Z',
          rejectionReason: 'Comprobante ilegible',
          reversedAt: null,
          reversalReason: null,
          createdAt: '2025-02-20T12:00:00.000Z',
          receipt: { originalName: 'a.pdf', mimeType: 'application/pdf', size: 50_000 },
        },
      ],
      pagination: { page: 1, limit: 50, total: 2, pages: 1 },
    });

    renderWith(<CiudadanoPagosPage />, '/ciudadano/pagos');

    expect(await screen.findByText('$ 1.000,00')).toBeInTheDocument();
    expect(screen.getByText('$ 2.000,00')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('Rechazado')).toBeInTheDocument();
    expect(screen.getByText('Motivo: Comprobante ilegible')).toBeInTheDocument();
  });

  it('Empty state cuando no hay pagos', async () => {
    apiRequestMock.mockResolvedValue({
      items: [],
      pagination: { page: 1, limit: 50, total: 0, pages: 1 },
    });

    renderWith(<CiudadanoPagosPage />, '/ciudadano/pagos');

    await waitFor(() =>
      screen.getByText(/Cuando informes un pago a la Municipalidad aparecerá aquí\./i),
    );
  });

  it('Formulario de nuevo pago: requiere monto y comprobante', async () => {
    renderWith(<CiudadanoNuevoPagoPage />, '/ciudadano/pagos/nuevo');

    await waitFor(() => screen.getByLabelText(/Monto/i));
    expect(screen.getByRole('button', { name: /Enviar pago/i })).toBeDisabled();
  });

  it('Formulario de nuevo pago: muestra campos requeridos', async () => {
    renderWith(<CiudadanoNuevoPagoPage />, '/ciudadano/pagos/nuevo');

    await waitFor(() => screen.getByLabelText(/Monto/i));
    // Submit button is disabled until amount + valid file are provided.
    expect(screen.getByRole('button', { name: /Enviar pago/i })).toBeDisabled();
    // Comprobante input is present.
    expect(screen.getByLabelText(/Comprobante/i)).toBeInTheDocument();
    // Method selector present.
    expect(screen.getByLabelText(/Método/i)).toBeInTheDocument();
  });
});

describe('Smoke — MuniFront Portal Ciudadano (Pago detail)', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    fetchBlobMock.mockReset();
  });

  it('Detalle PENDING muestra estado pendiente', async () => {
    apiRequestMock.mockResolvedValue({
      payment: {
        id: 'p1',
        amountMinor: 50_000,
        paymentMethod: 'BANK_TRANSFER',
        status: 'PENDING',
        note: null,
        submittedAt: '2025-03-01T12:00:00.000Z',
        reviewedAt: null,
        rejectionReason: null,
        reversedAt: null,
        reversalReason: null,
        createdAt: '2025-03-01T12:00:00.000Z',
        receipt: { originalName: 'a.png', mimeType: 'image/png', size: 100 },
      },
    });
    fetchBlobMock.mockRejectedValue(new Error('not loaded yet'));

    renderDetail('/ciudadano/pagos/p1');

    await waitFor(() => screen.getByText(/Pendiente de revisión/i));
  });

  it('Detalle APPROVED muestra "Acreditado en tu cuenta"', async () => {
    apiRequestMock.mockResolvedValue({
      payment: {
        id: 'p1',
        amountMinor: 50_000,
        paymentMethod: 'BANK_TRANSFER',
        status: 'APPROVED',
        note: null,
        submittedAt: '2025-03-01T12:00:00.000Z',
        reviewedAt: '2025-03-02T12:00:00.000Z',
        rejectionReason: null,
        reversedAt: null,
        reversalReason: null,
        createdAt: '2025-03-01T12:00:00.000Z',
        receipt: { originalName: 'a.png', mimeType: 'image/png', size: 100 },
      },
    });
    fetchBlobMock.mockRejectedValue(new Error('not loaded'));

    renderDetail('/ciudadano/pagos/p1');

    expect(await screen.findByText(/Acreditado en tu cuenta/i)).toBeInTheDocument();
  });

  it('Detalle REJECTED muestra motivo', async () => {
    apiRequestMock.mockResolvedValue({
      payment: {
        id: 'p1',
        amountMinor: 50_000,
        paymentMethod: 'BANK_TRANSFER',
        status: 'REJECTED',
        note: null,
        submittedAt: '2025-03-01T12:00:00.000Z',
        reviewedAt: '2025-03-02T12:00:00.000Z',
        rejectionReason: 'Comprobante ilegible',
        reversedAt: null,
        reversalReason: null,
        createdAt: '2025-03-01T12:00:00.000Z',
        receipt: { originalName: 'a.png', mimeType: 'image/png', size: 100 },
      },
    });
    fetchBlobMock.mockRejectedValue(new Error('not loaded'));

    renderDetail('/ciudadano/pagos/p1');

    expect(await screen.findByText(/Motivo: Comprobante ilegible/)).toBeInTheDocument();
  });

  it('Detalle REVERSED muestra "Aprobación revertida"', async () => {
    apiRequestMock.mockResolvedValue({
      payment: {
        id: 'p1',
        amountMinor: 50_000,
        paymentMethod: 'BANK_TRANSFER',
        status: 'REVERSED',
        note: null,
        submittedAt: '2025-03-01T12:00:00.000Z',
        reviewedAt: '2025-03-02T12:00:00.000Z',
        rejectionReason: null,
        reversedAt: '2025-03-05T12:00:00.000Z',
        reversalReason: 'Aprobado por error',
        createdAt: '2025-03-01T12:00:00.000Z',
        receipt: { originalName: 'a.png', mimeType: 'image/png', size: 100 },
      },
    });
    fetchBlobMock.mockRejectedValue(new Error('not loaded'));

    renderDetail('/ciudadano/pagos/p1');

    expect(await screen.findByText('Aprobación revertida')).toBeInTheDocument();
  });

  it('Not found cuando el backend devuelve 404', async () => {
    const err = new Error('No encontrado') as Error & { code?: string };
    err.code = 'NOT_FOUND';
    apiRequestMock.mockRejectedValue(err);

    renderDetail('/ciudadano/pagos/missing');

    await waitFor(() =>
      screen.getByText(/No pudimos cargar el pago/i),
    );
  });
});