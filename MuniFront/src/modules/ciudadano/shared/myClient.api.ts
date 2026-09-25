import { apiRequest } from '@/services/api';
import type {
  CitizenClient,
  UpdateMyClientPayload,
} from '@/modules/ciudadano/shared/client.types';

export const myClientApi = {
  get: () =>
    apiRequest<{ client: CitizenClient }>('/clients/me'),

  update: (payload: UpdateMyClientPayload) =>
    apiRequest<{ client: CitizenClient }>('/clients/me', {
      method: 'PATCH',
      body: payload,
    }),
};