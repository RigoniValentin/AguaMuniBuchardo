import type { Role } from '@/types/auth';

export function defaultRouteForRole(role: Role): string {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
    case 'OPERADOR':
      return '/admin';
    case 'REPARTIDOR':
      return '/repartidor';
    case 'CIUDADANO':
      return '/ciudadano';
    default:
      return '/login';
  }
}
