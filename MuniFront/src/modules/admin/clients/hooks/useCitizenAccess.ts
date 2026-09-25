import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { citizenAccessApi } from '../services/citizenAccess.api';

export const citizenAccessKeys = {
  all: ['citizen-access'] as const,
  byClient: (clientId: string) => [...citizenAccessKeys.all, clientId] as const,
};

export function useCitizenAccess(clientId: string | undefined) {
  return useQuery({
    queryKey: citizenAccessKeys.byClient(clientId ?? ''),
    queryFn: () => citizenAccessApi.get(clientId as string),
    enabled: Boolean(clientId),
  });
}

export function useLinkCitizenAccess(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (identifier: string) => citizenAccessApi.link(clientId, identifier),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: citizenAccessKeys.byClient(clientId) });
      qc.invalidateQueries({ queryKey: ['clients', 'detail', clientId] });
      qc.invalidateQueries({ queryKey: ['clients', 'list'] });
    },
  });
}

export function useUnlinkCitizenAccess(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => citizenAccessApi.unlink(clientId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: citizenAccessKeys.byClient(clientId) });
      qc.invalidateQueries({ queryKey: ['clients', 'detail', clientId] });
      qc.invalidateQueries({ queryKey: ['clients', 'list'] });
    },
  });
}