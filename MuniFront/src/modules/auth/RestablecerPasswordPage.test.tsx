import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ApiError } from '@/services/api';

const { apiRequestMock } = vi.hoisted(() => ({ apiRequestMock: vi.fn() }));
vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<typeof import('@/services/api')>(
    '@/services/api',
  );
  return { ...actual, apiRequest: apiRequestMock };
});

vi.mock('@/components/Logo/Logo', () => ({
  Logo: () => <span data-testid="logo-stub" />,
}));

vi.mock('@/assets/HeaderBuchardo2.png', () => ({ default: 'header-stub' }));

import { RestablecerPasswordPage } from './RestablecerPasswordPage';

beforeEach(() => {
  vi.clearAllMocks();
});

function renderAt(token: string) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[`/recuperar/${token}`]}>
        <Routes>
          <Route path="/recuperar/:token" element={<RestablecerPasswordPage />} />
          <Route path="/login" element={<div>Login page stub</div>} />
          <Route path="/recuperar" element={<div>Recover page stub</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('RestablecerPasswordPage', () => {
  it('validates the token on mount and renders the form when valid', async () => {
    apiRequestMock.mockResolvedValueOnce({ valid: true });
    renderAt('tok-abc');
    await waitFor(() =>
      expect(apiRequestMock).toHaveBeenCalledWith(
        expect.stringContaining('/auth/reset-password/validate'),
        expect.objectContaining({ skipAuth: true }),
      ),
    );
    await waitFor(() =>
      expect(screen.getByLabelText(/Nueva contraseña/i)).toBeInTheDocument(),
    );
  });

  it('renders an error screen when the token is invalid', async () => {
    apiRequestMock.mockResolvedValueOnce({ valid: false });
    renderAt('tok-bad');
    await waitFor(() =>
      expect(screen.getByText(/Enlace inválido o expirado/i)).toBeInTheDocument(),
    );
    expect(
      screen.getByRole('link', { name: /Solicitar un nuevo enlace/i }),
    ).toHaveAttribute('href', '/recuperar');
  });

  it('treats a thrown validate call as invalid', async () => {
    apiRequestMock.mockRejectedValueOnce(new ApiError(400, {
      code: 'VALIDATION_ERROR',
      message: 'Token requerido',
    }));
    renderAt('tok-bad');
    await waitFor(() =>
      expect(screen.getByText(/Enlace inválido o expirado/i)).toBeInTheDocument(),
    );
  });

  it('validates the passwords and only calls the API when both match', async () => {
    apiRequestMock.mockResolvedValueOnce({ valid: true });
    apiRequestMock.mockResolvedValueOnce({ ok: true, message: 'ok' });
    renderAt('tok-ok');
    const newPwd = await screen.findByLabelText(/Nueva contraseña/i);
    const confirmPwd = screen.getByLabelText(/Repetir contraseña/i);

    fireEvent.change(newPwd, { target: { value: 'NewPass123' } });
    fireEvent.change(confirmPwd, { target: { value: 'OtherPass456' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar contraseña/i }));

    await waitFor(() =>
      expect(screen.getByText(/Las contraseñas no coinciden/i)).toBeInTheDocument(),
    );
    const resetCalls = apiRequestMock.mock.calls.filter(
      (c) => typeof c[0] === 'string' && c[0].endsWith('/auth/reset-password'),
    );
    expect(resetCalls).toHaveLength(0);

    fireEvent.change(confirmPwd, { target: { value: 'NewPass123' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar contraseña/i }));

    await waitFor(() =>
      expect(apiRequestMock).toHaveBeenCalledWith(
        '/auth/reset-password',
        expect.objectContaining({
          method: 'POST',
          body: { token: 'tok-ok', password: 'NewPass123' },
          skipAuth: true,
        }),
      ),
    );
  });

  it('shows an error if the backend rejects the new password', async () => {
    apiRequestMock.mockResolvedValueOnce({ valid: true });
    apiRequestMock.mockRejectedValueOnce(
      new ApiError(400, {
        code: 'VALIDATION_ERROR',
        message: 'El enlace de recuperación es inválido o expiró',
      }),
    );
    renderAt('tok-used');

    const newPwd = await screen.findByLabelText(/Nueva contraseña/i);
    fireEvent.change(newPwd, { target: { value: 'NewPass123' } });
    fireEvent.change(screen.getByLabelText(/Repetir contraseña/i), {
      target: { value: 'NewPass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Guardar contraseña/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/El enlace de recuperación es inválido/i),
      ).toBeInTheDocument(),
    );
  });
});
