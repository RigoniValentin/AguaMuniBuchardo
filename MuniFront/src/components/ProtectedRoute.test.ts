import { describe, it, expect } from 'vitest';
import { defaultRouteForRole } from '@/router/role-routes';

describe('defaultRouteForRole', () => {
  it('routes administrative roles to /admin', () => {
    expect(defaultRouteForRole('SUPER_ADMIN')).toBe('/admin');
    expect(defaultRouteForRole('ADMIN')).toBe('/admin');
    expect(defaultRouteForRole('OPERADOR')).toBe('/admin');
  });

  it('routes REPARTIDOR to /repartidor', () => {
    expect(defaultRouteForRole('REPARTIDOR')).toBe('/repartidor');
  });

  it('routes CIUDADANO to /ciudadano', () => {
    expect(defaultRouteForRole('CIUDADANO')).toBe('/ciudadano');
  });
});
