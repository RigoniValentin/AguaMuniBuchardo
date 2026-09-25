import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { myClientApi } from '@/modules/ciudadano/shared/myClient.api';
import type { UpdateMyClientPayload } from '@/modules/ciudadano/shared/client.types';

export const myClientKeys = {
  all: ['my-client'] as const,
  detail: () => [...myClientKeys.all, 'detail'] as const,
};

export function useMyClient(enabled = true) {
  return useQuery({
    queryKey: myClientKeys.detail(),
    queryFn: () => myClientApi.get(),
    enabled,
    retry: (failureCount, error) => {
      // Don't retry on CLIENT_NOT_LINKED — it's a stable domain signal.
      const code = (error as { code?: string } | null)?.code;
      if (code === 'CLIENT_NOT_LINKED') return false;
      return failureCount < 2;
    },
  });
}

export function useUpdateMyClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateMyClientPayload) => myClientApi.update(payload),
    onSuccess: (data) => {
      qc.setQueryData(myClientKeys.detail(), data);
      qc.invalidateQueries({ queryKey: myClientKeys.detail() });
    },
  });
}