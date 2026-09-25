import { Link } from 'react-router-dom';
import { AccountStatusBadge } from './AccountStatusBadge';
import { ClientStatusBadge } from '@/modules/admin/clients/components/ClientStatusBadge';
import { ClientTypeBadge } from '@/modules/admin/clients/components/ClientTypeBadge';
import { describeBalance, type AccountListItem } from '../types/accounts.types';
import { formatMinorAsARS } from '@/shared/money';
import styles from './AccountsTable.module.css';

interface AccountsTableProps {
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

export function AccountsTable({ items }: AccountsTableProps) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Documento</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Estado de cuenta</th>
            <th>Saldo</th>
            <th>Último movimiento</th>
            <th aria-label="Acciones" />
          </tr>
        </thead>
        <tbody>
          {items.map((it) => {
            const balance = describeBalance(it.balanceMinor);
            return (
              <tr key={it.clientId} className={styles.row}>
                <td data-label="Cliente">
                  <Link to={`/admin/clientes/${it.clientId}/cuenta`} className={styles.nameLink}>
                    <strong>{it.fullName}</strong>
                  </Link>
                </td>
                <td data-label="Documento">
                  <span className={styles.docType}>{it.documentType}</span>
                  <span className={styles.docNumber}>{it.documentNumber}</span>
                </td>
                <td data-label="Tipo">
                  <ClientTypeBadge value={it.clientType} />
                </td>
                <td data-label="Estado">
                  <ClientStatusBadge active={it.active} />
                </td>
                <td data-label="Estado de cuenta">
                  <AccountStatusBadge status={it.status} />
                </td>
                <td data-label="Saldo">
                  <span className={styles[`balance-${balance.kind}`]}>
                    {balance.label}
                  </span>
                  {it.status !== 'SETTLED' && (
                    <div className={styles.muted}>
                      D {formatMinorAsARS(it.totalDebitsMinor)} · C{' '}
                      {formatMinorAsARS(it.totalCreditsMinor)}
                    </div>
                  )}
                </td>
                <td data-label="Último movimiento" className={styles.muted}>
                  {formatDate(it.lastMovementAt)}
                </td>
                <td data-label="Acciones" className={styles.actions}>
                  <Link
                    to={`/admin/clientes/${it.clientId}/cuenta`}
                    className={styles.viewLink}
                  >
                    Ver cuenta
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
