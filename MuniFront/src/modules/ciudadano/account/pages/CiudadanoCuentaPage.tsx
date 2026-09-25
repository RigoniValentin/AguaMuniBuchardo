import { useState } from 'react';
import { Badge } from '@/components/Badge/Badge';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Spinner } from '@/components/Spinner/Spinner';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { Button } from '@/components/Button/Button';
import { useMyClient } from '@/modules/ciudadano/shared/useMyClient';
import { useMyAccountMovements, useMyAccountSummary } from '../hooks/useMyAccount';
import { describeCitizenBalance } from '@/modules/ciudadano/shared/balance.view';
import { formatMinorAsARS } from '@/shared/money';
import { formatDate } from '@/shared/date';
import styles from './CiudadanoCuentaPage.module.css';

type DirectionFilter = 'ALL' | 'DEBIT' | 'CREDIT';
const DEFAULT_LIMIT = 10;

export function CiudadanoCuentaPage() {
  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState<DirectionFilter>('ALL');

  const { data: clientData, isError: clientError } = useMyClient();
  const summaryQuery = useMyAccountSummary(Boolean(clientData?.client));
  const movementsQuery = useMyAccountMovements(
    {
      page,
      limit: DEFAULT_LIMIT,
      direction: direction === 'ALL' ? undefined : direction,
    },
    Boolean(clientData?.client),
  );

  if (clientError) {
    return (
      <Card>
        <CardTitle>Tu cuenta no está vinculada</CardTitle>
        <CardSubtitle>
          No pudimos encontrar un cliente asociado a tu usuario.
        </CardSubtitle>
      </Card>
    );
  }

  if (!clientData) {
    return (
      <div className={styles.loading}>
        <Spinner label="Cargando cuenta..." />
      </div>
    );
  }

  if (summaryQuery.isLoading || movementsQuery.isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Cargando movimientos..." />
      </div>
    );
  }

  if (summaryQuery.isError || movementsQuery.isError || !summaryQuery.data) {
    return (
      <ErrorState
        title="No pudimos cargar tu cuenta"
        description="Intente nuevamente."
        onRetry={() => {
          summaryQuery.refetch();
          movementsQuery.refetch();
        }}
      />
    );
  }

  const account = summaryQuery.data.account;
  const balance = describeCitizenBalance(account.balanceMinor);
  const items = movementsQuery.data?.items ?? [];
  const total = movementsQuery.data?.pagination.total ?? 0;
  const pages = movementsQuery.data?.pagination.pages ?? 1;

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <h1>Mi cuenta</h1>
        <p>Saldo y movimientos de tu cuenta corriente municipal.</p>
      </header>

      <Card>
        <CardTitle>Saldo</CardTitle>
        <CardSubtitle>
          <Badge tone={balance.status === 'DEBT' ? 'danger' : balance.status === 'CREDIT' ? 'success' : 'info'}>
            {balance.label}
          </Badge>
        </CardSubtitle>
        <p className={`${styles.bigValue} ${styles[`status-${balance.status}`]}`}>
          {balance.friendly}
        </p>
        <div className={styles.totals}>
          <div>
            <span>Total cargos</span>
            <strong>{formatMinorAsARS(account.totalDebitsMinor)}</strong>
          </div>
          <div>
            <span>Total créditos</span>
            <strong>{formatMinorAsARS(account.totalCreditsMinor)}</strong>
          </div>
        </div>
      </Card>

      <Card>
        <div className={styles.movementHeader}>
          <div>
            <CardTitle>Historial</CardTitle>
            <CardSubtitle>
              {total === 0
                ? 'Sin movimientos registrados.'
                : `${total} movimiento${total === 1 ? '' : 's'} en total.`}
            </CardSubtitle>
          </div>
          <div className={styles.filters} role="tablist" aria-label="Filtrar movimientos">
            {(['ALL', 'DEBIT', 'CREDIT'] as DirectionFilter[]).map((d) => (
              <button
                key={d}
                type="button"
                role="tab"
                aria-selected={direction === d}
                className={`${styles.filterBtn} ${direction === d ? styles.filterBtnActive : ''}`}
                onClick={() => {
                  setDirection(d);
                  setPage(1);
                }}
              >
                {d === 'ALL' ? 'Todos' : d === 'DEBIT' ? 'Cargos' : 'Créditos'}
              </button>
            ))}
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyState
            title="Sin movimientos"
            description={
              direction === 'ALL'
                ? 'Tu cuenta aún no registra movimientos.'
                : 'No hay movimientos que coincidan con este filtro.'
            }
          />
        ) : (
          <ul className={styles.list}>
            {items.map((m) => {
              const isReversal = m.movementType === 'REVERSAL';
              return (
                <li key={m.id} className={styles.item}>
                  <div className={styles.itemRow}>
                    <div>
                      <p className={styles.itemDesc}>{m.description}</p>
                      <p className={styles.itemMeta}>
                        {formatDate(m.occurredAt)}
                        {isReversal && (
                          <>
                            {' '}
                            <Badge tone="info">Reversión</Badge>
                          </>
                        )}
                      </p>
                    </div>
                    <span
                      className={`${styles.amount} ${
                        m.direction === 'DEBIT' ? styles.debit : styles.credit
                      }`}
                    >
                      {m.direction === 'DEBIT' ? '+' : '−'}
                      {formatMinorAsARS(m.amountMinor)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className={styles.pagination}>
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span>
            Página {page} de {pages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      </Card>
    </div>
  );
}