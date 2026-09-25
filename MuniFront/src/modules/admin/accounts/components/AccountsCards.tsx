import { Link } from 'react-router-dom';
import { ClientStatusBadge } from '@/modules/admin/clients/components/ClientStatusBadge';
import { ClientTypeBadge } from '@/modules/admin/clients/components/ClientTypeBadge';
import { AccountStatusBadge } from './AccountStatusBadge';
import { describeBalance, type AccountListItem } from '../types/accounts.types';
import styles from './AccountsCards.module.css';

interface AccountsCardsProps {
  items: AccountListItem[];
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('es-AR');
  } catch {
    return value;
  }
}

export function AccountsCards({ items }: AccountsCardsProps) {
  return (
    <ul className={styles.list}>
      {items.map((it) => {
        const balance = describeBalance(it.balanceMinor);
        return (
          <li key={it.clientId} className={styles.card}>
            <header className={styles.header}>
              <Link to={`/admin/clientes/${it.clientId}/cuenta`} className={styles.nameLink}>
                <strong>{it.fullName}</strong>
              </Link>
              <ClientStatusBadge active={it.active} />
            </header>
            <div className={styles.row}>
              <span className={styles.docType}>{it.documentType}</span>
              <span className={styles.docNumber}>{it.documentNumber}</span>
              <ClientTypeBadge value={it.clientType} />
            </div>
            <div className={styles.row}>
              <AccountStatusBadge status={it.status} />
              <span className={`${styles.balance} ${styles[`balance-${balance.kind}`]}`}>
                {balance.label}
              </span>
            </div>
            <p className={styles.muted}>Último movimiento: {formatDate(it.lastMovementAt)}</p>
            <footer className={styles.footer}>
              <Link
                to={`/admin/clientes/${it.clientId}/cuenta`}
                className={styles.viewLink}
              >
                Ver cuenta
              </Link>
            </footer>
          </li>
        );
      })}
    </ul>
  );
}
