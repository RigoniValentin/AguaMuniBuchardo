import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';
import { Spinner } from '@/components/Spinner/Spinner';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { ClientTypeBadge } from '@/modules/admin/clients/components/ClientTypeBadge';
import { ClientStatusBadge } from '@/modules/admin/clients/components/ClientStatusBadge';
import { AccountStatusBadge } from '../components/AccountStatusBadge';
import { MovementHistory } from '../components/MovementHistory';
import { AdjustmentForm } from '../components/AdjustmentForm';
import { ReversalForm } from '../components/ReversalForm';
import {
  useAccountSummary,
  useAccountMovements,
} from '../hooks/useAccounts';
import {
  useCreateAccountAdjustment,
  useReverseAccountMovement,
} from '../hooks/useAccountMutations';
import { ApiError } from '@/services/api';
import { useAuth } from '@/hooks/auth-context';
import {
  describeBalance,
  type AccountMovement,
  type Direction,
} from '../types/accounts.types';
import { formatMinorAsARS } from '@/shared/money';
import styles from './AdminAccountDetailPage.module.css';

type Modal = 'adjustment' | { type: 'reversal'; movement: AccountMovement } | null;

export function AdminAccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const clientId = id ?? '';
  const { user } = useAuth();
  const canAdjust = user?.permissions.includes('accounts.adjust') ?? false;
  const canReverse = user?.permissions.includes('accounts.reverse') ?? false;

  const [modal, setModal] = useState<Modal>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: summaryData,
    isLoading: summaryLoading,
    isError: summaryError,
    error: summaryErr,
    refetch: refetchSummary,
  } = useAccountSummary(clientId);

  const {
    data: movementsData,
    isLoading: movementsLoading,
    isError: movementsError,
    error: movementsErr,
    refetch: refetchMovements,
  } = useAccountMovements(clientId, { page: 1, limit: 50 });

  const createAdjustment = useCreateAccountAdjustment(clientId);
  const reverseMovement = useReverseAccountMovement(clientId);

  useEffect(() => {
    setErrorMessage(null);
  }, [modal]);

  if (summaryLoading || movementsLoading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Cargando cuenta corriente..." />
      </div>
    );
  }

  if (summaryError || movementsError) {
    const combinedErr: unknown = summaryErr ?? movementsErr;
    return (
      <ErrorState
        title="No pudimos cargar la cuenta"
        description={
          combinedErr instanceof Error ? combinedErr.message : 'Intente nuevamente.'
        }
        onRetry={() => {
          refetchSummary();
          refetchMovements();
        }}
        action={
          <Link to="/admin/cuentas-corrientes">
            <Button variant="ghost">Volver al listado</Button>
          </Link>
        }
      />
    );
  }

  if (!summaryData) {
    return (
      <ErrorState
        title="Cuenta no encontrada"
        description="La cuenta solicitada no existe o el cliente fue eliminado."
        action={
          <Link to="/admin/cuentas-corrientes">
            <Button variant="ghost">Volver al listado</Button>
          </Link>
        }
      />
    );
  }

  const client = summaryData.client;
  const account = summaryData.account;
  const balance = describeBalance(account.balanceMinor);
  const movements = movementsData?.items ?? [];

  const handleAdjustment = async (payload: {
    direction: Direction;
    amountMinor: number;
    description: string;
  }) => {
    try {
      await createAdjustment.mutateAsync(payload);
      setModal(null);
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError ? err.message : 'No se pudo registrar el ajuste.',
      );
    }
  };

  const handleReversal = async (payload: { description: string }) => {
    if (modal && typeof modal === 'object' && modal.type === 'reversal') {
      try {
        await reverseMovement.mutateAsync({
          movementId: modal.movement.id,
          payload,
        });
        setModal(null);
      } catch (err) {
        setErrorMessage(
          err instanceof ApiError
            ? err.message
            : 'No se pudo revertir el movimiento.',
        );
      }
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <Link to="/admin/cuentas-corrientes" className={styles.backLink}>
            ← Cuentas corrientes
          </Link>
          <div className={styles.titleRow}>
            <h1>{client.fullName}</h1>
            <ClientTypeBadge value={client.clientType} />
            <ClientStatusBadge active={client.active} />
          </div>
          <p className={styles.docLine}>
            {client.documentType} {client.documentNumber}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link to={`/admin/clientes/${client.id}`}>
            <Button variant="ghost">Ver ficha de cliente</Button>
          </Link>
          {canAdjust && (
            <Button onClick={() => setModal('adjustment')}>+ Nuevo ajuste</Button>
          )}
        </div>
      </header>

      <div className={styles.summaryGrid}>
        <Card>
          <CardTitle>Saldo actual</CardTitle>
          <CardSubtitle>
            <AccountStatusBadge status={account.status} />
          </CardSubtitle>
          <p className={`${styles.bigValue} ${styles[`balance-${balance.kind}`]}`}>
            {balance.label}
          </p>
        </Card>
        <Card>
          <CardTitle>Total cargos</CardTitle>
          <CardSubtitle>Suma de movimientos DEBIT</CardSubtitle>
          <p className={styles.bigValue}>{formatMinorAsARS(account.totalDebitsMinor)}</p>
        </Card>
        <Card>
          <CardTitle>Total créditos</CardTitle>
          <CardSubtitle>Suma de movimientos CREDIT</CardSubtitle>
          <p className={styles.bigValue}>{formatMinorAsARS(account.totalCreditsMinor)}</p>
        </Card>
      </div>

      <Card>
        <CardTitle>Historial de movimientos</CardTitle>
        <CardSubtitle>
          Ordenado por fecha contable. Los movimientos no se editan ni se eliminan.
        </CardSubtitle>
        <MovementHistory
          items={movements}
          canReverse={canReverse}
          onReverse={(m) => setModal({ type: 'reversal', movement: m })}
        />
      </Card>

      {modal === 'adjustment' && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <header className={styles.modalHeader}>
              <h2>Nuevo ajuste manual</h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setModal(null)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </header>
            <p className={styles.modalHelp}>
              Registrá un movimiento contable en el libro del cliente. Esta
              operación no genera pagos ni comprobantes.
            </p>
            <AdjustmentForm
              onSubmit={handleAdjustment}
              onCancel={() => setModal(null)}
              submitting={createAdjustment.isPending}
            />
            {errorMessage && <div className={styles.error}>{errorMessage}</div>}
          </div>
        </div>
      )}

      {modal && typeof modal === 'object' && modal.type === 'reversal' && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <header className={styles.modalHeader}>
              <h2>Revertir movimiento</h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setModal(null)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </header>
            <ReversalForm
              movement={modal.movement}
              onSubmit={handleReversal}
              onCancel={() => setModal(null)}
              submitting={reverseMovement.isPending}
            />
            {errorMessage && <div className={styles.error}>{errorMessage}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
