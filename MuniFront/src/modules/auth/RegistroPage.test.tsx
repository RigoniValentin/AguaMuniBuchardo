import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '@/hooks/auth-context';
import { ApiError } from '@/services/api';

const { apiRequestMock } = vi.hoisted(() => ({ apiRequestMock: vi.fn() }));
vi.mock('@/services/api', async () => {
  const actual = await vi.importActual<typeof import('@/services/api')>('@/services/api');
  return { ...actual, apiRequest: apiRequestMock };
});

import { RegistroPage } from './RegistroPage';

const unauthenticated: AuthContextValue = {
  user: null,
  status: 'unauthenticated',
  login: vi.fn(),
  register: vi.fn().mockResolvedValue({ linked: false }),
  logout: vi.fn(),
  refresh: vi.fn(),
  hasRole: () => false,
  hasPermission: () => false,
};

function renderWithRegister(registerFn: (payload: unknown) => Promise<{ linked: boolean }>) {
  const auth: AuthContextValue = {
    ...unauthenticated,
    register: registerFn as AuthContextValue['register'],
  };
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <AuthContext.Provider value={auth}>
        <MemoryRouter initialEntries={['/registro']}>
          <RegistroPage />
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe('Smoke — RegistroPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Renderiza todos los campos', () => {
    renderWithRegister(async () => ({ linked: false }));
    expect(screen.getByLabelText(/Nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Apellido/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^DNI/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Repetir contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear cuenta/i })).toBeInTheDocument();
  });

  it('Valida campos requeridos antes de submitir', async () => {
    const registerFn = vi.fn().mockResolvedValue({ linked: false });
    renderWithRegister(registerFn);

    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }));

    await waitFor(() => {
      expect(screen.getByText(/El nombre es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/El DNI es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/El teléfono es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/El email es obligatorio/i)).toBeInTheDocument();
    });

    expect(registerFn).not.toHaveBeenCalled();
  });

  it('Rechaza registro sin DNI', async () => {
    const registerFn = vi.fn().mockResolvedValue({ linked: true });
    renderWithRegister(registerFn);

    fireEvent.change(screen.getByLabelText(/^Nombre/i), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByLabelText(/^Apellido/i), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByLabelText(/^Teléfono/i), {
      target: { value: '+5493584001122' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'juan@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña/i), {
      target: { value: 'Password123' },
    });
    fireEvent.change(screen.getByLabelText(/Repetir contraseña/i), {
      target: { value: 'Password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }));

    await waitFor(() =>
      expect(screen.getByText(/El DNI es obligatorio/i)).toBeInTheDocument(),
    );
    expect(registerFn).not.toHaveBeenCalled();
  });

  it('Llama a register con los valores normalizados (DNI solo dígitos)', async () => {
    const registerFn = vi.fn().mockResolvedValue({ linked: true });
    renderWithRegister(registerFn);

    fireEvent.change(screen.getByLabelText(/^Nombre/i), { target: { value: 'Juan' } });
    fireEvent.change(screen.getByLabelText(/^Apellido/i), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByLabelText(/^DNI/i), { target: { value: '12.345.678' } });
    fireEvent.change(screen.getByLabelText(/^Teléfono/i), {
      target: { value: '+5493584001122' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'juan@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña/i), {
      target: { value: 'Password123' },
    });
    fireEvent.change(screen.getByLabelText(/Repetir contraseña/i), {
      target: { value: 'Password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }));

    await waitFor(() => expect(registerFn).toHaveBeenCalledTimes(1));
    const callArg = registerFn.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(callArg.documentNumber).toBe('12345678');
    expect(callArg.phone).toBe('+5493584001122');
    expect(callArg.email).toBe('juan@example.com');
  });

  it('Muestra mensaje de éxito si linked=true', async () => {
    const registerFn = vi.fn().mockResolvedValue({ linked: true });
    renderWithRegister(registerFn);

    fireEvent.change(screen.getByLabelText(/^Nombre/i), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText(/^Apellido/i), { target: { value: 'B' } });
    fireEvent.change(screen.getByLabelText(/^DNI/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/^Teléfono/i), {
      target: { value: '+5493584000001' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'a@b.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña/i), {
      target: { value: 'Password123' },
    });
    fireEvent.change(screen.getByLabelText(/Repetir contraseña/i), {
      target: { value: 'Password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }));

    await waitFor(() =>
      expect(screen.getByText(/vinculada automáticamente/i)).toBeInTheDocument(),
    );
  });

  it('Muestra mensaje de éxito distinto si linked=false', async () => {
    const registerFn = vi.fn().mockResolvedValue({ linked: false });
    renderWithRegister(registerFn);

    fireEvent.change(screen.getByLabelText(/^Nombre/i), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText(/^Apellido/i), { target: { value: 'B' } });
    fireEvent.change(screen.getByLabelText(/^DNI/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/^Teléfono/i), {
      target: { value: '+5493584000001' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'a@b.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña/i), {
      target: { value: 'Password123' },
    });
    fireEvent.change(screen.getByLabelText(/Repetir contraseña/i), {
      target: { value: 'Password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }));

    await waitFor(() =>
      expect(screen.getByText(/confirmará la vinculación/i)).toBeInTheDocument(),
    );
  });

  it('Muestra error del backend (409 por email duplicado)', async () => {
    const registerFn = vi.fn().mockRejectedValue(
      new ApiError(409, {
        code: 'CONFLICT',
        message: 'Ya existe una cuenta con ese email',
      }),
    );
    renderWithRegister(registerFn);

    fireEvent.change(screen.getByLabelText(/^Nombre/i), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText(/^Apellido/i), { target: { value: 'B' } });
    fireEvent.change(screen.getByLabelText(/^DNI/i), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText(/^Teléfono/i), {
      target: { value: '+5493584000002' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'duplicate@b.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña/i), {
      target: { value: 'Password123' },
    });
    fireEvent.change(screen.getByLabelText(/Repetir contraseña/i), {
      target: { value: 'Password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }));

    await waitFor(() =>
      expect(screen.getByText(/Ya existe una cuenta con ese email/i)).toBeInTheDocument(),
    );
  });
});
