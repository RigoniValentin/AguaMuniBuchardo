import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
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

import { OlvidePasswordPage } from './OlvidePasswordPage';

beforeEach(() => {
  vi.clearAllMocks();
});

function renderPage() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={['/recuperar']}>
        <OlvidePasswordPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('OlvidePasswordPage', () => {
  it('renders the email field and submit button', () => {
    renderPage();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Enviar enlace/i }),
    ).toBeInTheDocument();
  });

  it('blocks empty submit with a validation error', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Enviar enlace/i }));
    await waitFor(() =>
      expect(screen.getByText(/El email es obligatorio/i)).toBeInTheDocument(),
    );
    expect(apiRequestMock).not.toHaveBeenCalled();
  });

  it('rejects malformed emails', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'no-es-un-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enviar enlace/i }));
    await waitFor(() =>
      expect(screen.getByText(/Email inválido/i)).toBeInTheDocument(),
    );
    expect(apiRequestMock).not.toHaveBeenCalled();
  });

  it('calls the API and shows the success state on 200', async () => {
    apiRequestMock.mockResolvedValueOnce({
      ok: true,
      message: 'Si el email está registrado...',
    });
    renderPage();
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'maria@buchardo.gob.ar' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enviar enlace/i }));

    await waitFor(() =>
      expect(apiRequestMock).toHaveBeenCalledWith(
        '/auth/forgot-password',
        expect.objectContaining({
          method: 'POST',
          body: { email: 'maria@buchardo.gob.ar' },
          skipAuth: true,
        }),
      ),
    );
    await waitFor(() =>
      expect(
        screen.getByText(/vas a recibir un mensaje/i),
      ).toBeInTheDocument(),
    );
  });

  it('surfaces an API error from the backend', async () => {
    apiRequestMock.mockRejectedValueOnce(
      new ApiError(429, {
        code: 'RATE_LIMIT',
        message: 'Demasiadas solicitudes de recuperación.',
      }),
    );
    renderPage();
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'maria@buchardo.gob.ar' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enviar enlace/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/Demasiadas solicitudes/i),
      ).toBeInTheDocument(),
    );
  });
});
