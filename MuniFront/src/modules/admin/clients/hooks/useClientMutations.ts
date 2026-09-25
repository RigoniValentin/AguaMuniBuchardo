import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../services/clients.api';
import { clientsKeys } from './useClients';
import type {
  Client,
  CreateClientPayload,
  UpdateClientPayload,
} from '../types/clients.types';

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClientPayload) => clientsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientsKeys.lists() });
    },
  });
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateClientPayload) => clientsApi.update(id, payload),
    onSuccess: (data: { client: Client }) => {
      qc.invalidateQueries({ queryKey: clientsKeys.lists() });
      qc.setQueryData(clientsKeys.detail(id), data);
    },
  });
}
