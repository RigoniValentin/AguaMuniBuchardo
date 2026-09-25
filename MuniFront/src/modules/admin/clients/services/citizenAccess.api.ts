import { apiRequest } from '@/services/api';
import type { CitizenAccessPayload } from '../types/citizenAccess.types';

export const citizenAccessApi = {
  get: (clientId: string) =>
    apiRequest<{ access: CitizenAccessPayload }>(
      `/clients/${clientId}/citizen-access`,
    ),
  link: (clientId: string, identifier: string) =>
    apiRequest<{
      linked: boolean;
      access: CitizenAccessPayload;
    }>(`/clients/${clientId}/citizen-access`, {
      method: 'POST',
      body: { identifier },
    }),
  unlink: (clientId: string) =>
    apiRequest<{
      access: { linked: false; user: null };
      clientId: string;
    }>(`/clients/${clientId}/citizen-access`, {
      method: 'DELETE',
    }),
};