import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from '@/hooks/auth-context';
import type { User } from '@/types/auth';

const { apiRequestMock, fetchBlobMock } = vi.hoisted(() => ({
  apiRequestMock: vi.fn(),
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
    fetchBlob: fetchBlobMock,
  };
});

import { AdminPagosPage } from '@/modules/payments/pages/AdminPagosPage';
import { AdminPagoDetailPage } from '@/modules/payments/pages/AdminPagoDetailPage';

const adminUser: User = {
  id: '507f1f77bcf86cd799439099',
  firstName: 'Admin',
  lastName: 'Cuenta',
  email: 'admin@buchardo.gob.ar',
  role: 'ADMIN',
  permissions: ['payments.read', 'payments.review', 'payments.reverse'],
  active: true,
};

const operadorUser: User = {
  ...adminUser,
  email: 'op@buchardo.gob.ar',
  role: 'OPERADOR',
  permissions: ['payments.read'],
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

function renderWith(
  ui: ReactNode,
  initialPath: string,
  perms: string[] = adminUser.permissions,
) {
  const queryClient = makeQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={makeAuth(perms)}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="*" element={ui} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

function renderDetail(initialPath: string, perms: string[] = adminUser.permissions) {
  const queryClient = makeQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={makeAuth(perms)}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/admin/pagos/:id" element={<AdminPagoDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

const baseAdminPayment = {
  id: 'p1',
  amountMinor: 100_000,
  paymentMethod: 'BANK_TRANSFER' as const,
  status: 'PENDING' as const,
  note: null,
  submittedAt: '2025-03-01T12:00:00.000Z',
  reviewedAt: null,
  rejectionReason: null,
  reversedAt: null,
  reversalReason: null,
  createdAt: '2025-03-01T12:00:00.000Z',
  receipt: { originalName: 'a.png', mimeType: 'image/png' as const, size: 100 },
  reviewedBy: null,
  reversedBy: null,
  ledgerMovementId: null,
  reversalMovementId: null,
  client: {
    id: 'c1',
    firstName: 'Ana',
    lastName: 'Pérez',
    fullName: 'Ana Pérez',
    documentType: 'DNI' as const,
    documentNumber: '12345678',
    clientType: 'LOCAL' as const,
    active: true,
  },
};

describe('Smoke — MuniFront Admin Pagos', () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
    fetchBlobMock.mockReset();
  });

  it('Lista pagos pendientes', async () => {
    apiRequestMock.mockResolvedValue({
      items: [{ ...baseAdminPayment }],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });
    renderWith(<AdminPagosPage />, '/admin/pagos');
    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0);
  });

  it('OPERADOR (read only) NO ve Aprobar/Rechazar', async () => {
    apiRequestMock.mockResolvedValue({
      payment: baseAdminPayment,
    });
    fetchBlobMock.mockResolvedValue({
      blob: new Blob(['x'], { type: 'image/png' }),
      contentType: 'image/png',
    });

    renderDetail('/admin/pagos/p1', operadorUser.permissions);

    expect(await screen.findByText('Pendiente')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Aprobar$/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Rechazar$/ })).not.toBeInTheDocument();
  });

  it('ADMIN (review) SÍ ve Aprobar/Rechazar en PENDING', async () => {
    apiRequestMock.mockResolvedValue({
      payment: baseAdminPayment,
    });
    fetchBlobMock.mockResolvedValue({
      blob: new Blob(['x'], { type: 'image/png' }),
      contentType: 'image/png',
    });

    renderDetail('/admin/pagos/p1');

    expect(await screen.findByRole('button', { name: /^Aprobar$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Rechazar$/ })).toBeInTheDocument();
  });

  it('ADMIN (reverse) ve Revertir aprobación en APPROVED', async () => {
    apiRequestMock.mockResolvedValue({
      payment: {
        ...baseAdminPayment,
        status: 'APPROVED' as const,
        reviewedAt: '2025-03-02T12:00:00.000Z',
        ledgerMovementId: 'm1',
      },
    });
    fetchBlobMock.mockResolvedValue({
      blob: new Blob(['x'], { type: 'image/png' }),
      contentType: 'image/png',
    });

    renderDetail('/admin/pagos/p1');

    expect(
      await screen.findByRole('button', { name: /Revertir aprobación/i }),
    ).toBeInTheDocument();
  });

  it('ADMIN en REVERSED NO ve botones de acción', async () => {
    apiRequestMock.mockResolvedValue({
      payment: {
        ...baseAdminPayment,
        status: 'REVERSED' as const,
        reviewedAt: '2025-03-02T12:00:00.000Z',
        reversedAt: '2025-03-05T12:00:00.000Z',
        reversalReason: 'Aprobado por error',
        reversalMovementId: 'm2',
        ledgerMovementId: 'm1',
      },
    });
    fetchBlobMock.mockResolvedValue({
      blob: new Blob(['x'], { type: 'image/png' }),
      contentType: 'image/png',
    });

    renderDetail('/admin/pagos/p1');

    expect(await screen.findByText('Aprobación revertida')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Aprobar$/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Rechazar$/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Revertir aprobación/i })).not.toBeInTheDocument();
  });

  it('ADMIN en REJECTED muestra motivo', async () => {
    apiRequestMock.mockResolvedValue({
      payment: {
        ...baseAdminPayment,
        status: 'REJECTED' as const,
        reviewedAt: '2025-03-02T12:00:00.000Z',
        rejectionReason: 'Comprobante ilegible',
      },
    });
    fetchBlobMock.mockResolvedValue({
      blob: new Blob(['x'], { type: 'image/png' }),
      contentType: 'image/png',
    });

    renderDetail('/admin/pagos/p1');

    expect(await screen.findByText('Pago rechazado')).toBeInTheDocument();
    expect(screen.getByText(/Motivo: Comprobante ilegible/)).toBeInTheDocument();
  });
});