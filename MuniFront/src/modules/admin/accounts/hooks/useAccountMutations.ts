import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '../services/accounts.api';
import { accountsKeys } from './useAccounts';
import type {
  CreateAdjustmentPayload,
  ReverseMovementPayload,
} from '../types/accounts.types';

export function useCreateAccountAdjustment(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdjustmentPayload) =>
      accountsApi.createAdjustment(clientId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountsKeys.summary(clientId) });
      qc.invalidateQueries({ queryKey: accountsKeys.movements() });
      qc.invalidateQueries({ queryKey: accountsKeys.lists() });
    },
  });
}

export function useReverseAccountMovement(clientId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ movementId, payload }: { movementId: string; payload: ReverseMovementPayload }) =>
      accountsApi.reverseMovement(movementId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accountsKeys.summary(clientId) });
      qc.invalidateQueries({ queryKey: accountsKeys.movements() });
      qc.invalidateQueries({ queryKey: accountsKeys.lists() });
    },
  });
}
