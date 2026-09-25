import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '@/hooks/auth-context';
import type { Role, User } from '@/types/auth';
import { CiudadanoLayout } from './CiudadanoLayout';

const CITIZEN_USER: User = {
  id: '507f1f77bcf86cd799439099',
  firstName: 'Smoke',
  lastName: 'Ciudadano',
  email: 'ciudadano@buchardo.gob.ar',
  role: 'CIUDADANO' as Role,
  permissions: [],
  active: true,
};

function makeAuthValue(): AuthContextValue {
  return {
    user: CITIZEN_USER,
    status: 'authenticated',
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    hasRole: () => true,
    hasPermission: () => true,
  };
}

function renderAt(initialPath: string) {
  return render(
    <AuthContext.Provider value={makeAuthValue()}>
      <MemoryRouter initialEntries={[initialPath]}>
        <CiudadanoLayout />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('CiudadanoLayout dropdown - home bug', () => {
  it('In the dropdown menu, the "Inicio" item must NOT appear active when on /ciudadano/pedidos', () => {
    renderAt('/ciudadano/pedidos');
    const fab = screen.getByRole('button', { name: /abrir menú de opciones/i });
    fireEvent.click(fab);
    const inicioLinks = screen.getAllByText('Inicio');
    const sheetInicio = inicioLinks
      .map((el) => el.closest('a'))
      .find((a) => a && a.closest('[role="dialog"]'));
    expect(sheetInicio).toBeTruthy();
    expect(sheetInicio!.className).not.toMatch(/Active/);
  });

  it('When on /ciudadano (home), the "Inicio" item IS active', () => {
    renderAt('/ciudadano');
    const fab = screen.getByRole('button', { name: /abrir menú de opciones/i });
    fireEvent.click(fab);
    const inicioLinks = screen.getAllByText('Inicio');
    const sheetInicio = inicioLinks
      .map((el) => el.closest('a'))
      .find((a) => a && a.closest('[role="dialog"]'));
    expect(sheetInicio).toBeTruthy();
    expect(sheetInicio!.className).toMatch(/Active/);
  });
});
