import { Badge } from '@/components/Badge/Badge';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import type { AccountMovement } from '@/modules/admin/accounts/types/accounts.types';
import { formatMinorAsARS } from '@/shared/money';
import styles from './CitizenRecentMovements.module.css';

interface CitizenRecentMovementsProps {
  items: AccountMovement[];
  loading?: boolean;
}

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

/**
 * Recent movements card for the citizen dashboard. NEVER shows admin actions
 * like "Revertir"; only displays description, amount and a "Reversión" badge
 * when the row is itself a reversal entry.
 */
export function CitizenRecentMovements({ items, loading }: CitizenRecentMovementsProps) {
  return (
    <Card>
      <CardTitle>Últimos movimientos</CardTitle>
      <CardSubtitle>
        Tu actividad más reciente en la cuenta.
      </CardSubtitle>

      {loading ? (
        <p className={styles.empty}>Cargando movimientos…</p>
      ) : items.length === 0 ? (
        <p className={styles.empty}>
          Aún no registramos movimientos en tu cuenta.
        </p>
      ) : (
        <ul className={styles.list}>
          {items.map((m) => {
            const isReversal = m.movementType === 'REVERSAL';
            return (
              <li key={m.id} className={styles.item}>
                <div className={styles.headRow}>
                  <span className={styles.description}>{m.description}</span>
                  {isReversal && <Badge tone="info">Reversión</Badge>}
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.date}>{formatDate(m.occurredAt)}</span>
                  <span className={styles.dot}>·</span>
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
    </Card>
  );
}