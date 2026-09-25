import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import {
  DIRECTION_LABEL,
  MOVEMENT_TYPE_LABEL,
  type AccountMovement,
} from '../types/accounts.types';
import { formatMinorAsARS } from '@/shared/money';
import styles from './MovementHistory.module.css';

interface MovementHistoryProps {
  items: AccountMovement[];
  onReverse?: (movement: AccountMovement) => void;
  canReverse?: boolean;
}

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString('es-AR');
  } catch {
    return value;
  }
}

export function MovementHistory({ items, onReverse, canReverse }: MovementHistoryProps) {
  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Aún no se registraron movimientos en esta cuenta.</p>
      </div>
    );
  }
  return (
    <ol className={styles.list}>
      {items.map((m) => {
        const isReversal = m.movementType === 'REVERSAL';
        const isReversed = Boolean(m.reversesMovementId);
        const showReverse = canReverse && onReverse && !isReversal && !isReversed;
        return (
          <li key={m.id} className={styles.item}>
            <div className={styles.headRow}>
              <div className={styles.headLeft}>
                <span className={styles.typeLabel}>
                  {DIRECTION_LABEL[m.direction]}
                </span>
                {isReversal && <Badge tone="info">Reversión</Badge>}
              </div>
              <div className={styles.headRight}>
                <span
                  className={`${styles.amount} ${
                    m.direction === 'DEBIT' ? styles.debit : styles.credit
                  }`}
                >
                  {m.direction === 'DEBIT' ? '+' : '−'}
                  {formatMinorAsARS(m.amountMinor)}
                </span>
              </div>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaItem}>{formatDate(m.occurredAt)}</span>
              <span className={styles.dot}>·</span>
              <span className={styles.metaItem}>{MOVEMENT_TYPE_LABEL[m.movementType]}</span>
            </div>
            <p className={styles.description}>{m.description}</p>
            {showReverse && (
              <div className={styles.actions}>
                <Button variant="ghost" size="sm" onClick={() => onReverse(m)}>
                  Revertir
                </Button>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
