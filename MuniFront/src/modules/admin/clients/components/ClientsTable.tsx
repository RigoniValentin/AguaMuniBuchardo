import { Link } from 'react-router-dom';
import { ClientTypeBadge } from './ClientTypeBadge';
import { ClientStatusBadge } from './ClientStatusBadge';
import { formatAddress, type Client } from '../types/clients.types';
import styles from './ClientsTable.module.css';

interface ClientsTableProps {
  items: Client[];
}

export function ClientsTable({ items }: ClientsTableProps) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Documento</th>
            <th>Dirección</th>
            <th>Tipo</th>
            <th>Teléfono</th>
            <th>Estado</th>
            <th aria-label="Acciones" />
          </tr>
        </thead>
        <tbody>
          {items.map((c) => (
            <tr key={c.id} className={styles.row}>
              <td data-label="Nombre">
                <Link to={`/admin/clientes/${c.id}`} className={styles.nameLink}>
                  <strong>{c.fullName}</strong>
                </Link>
                {c.email && <div className={styles.muted}>{c.email}</div>}
              </td>
              <td data-label="Documento">
                {c.documentType ? (
                  <>
                    <span className={styles.docType}>{c.documentType}</span>
                    <span className={styles.docNumber}>{c.documentNumber ?? ''}</span>
                  </>
                ) : (
                  <span className={styles.muted}>—</span>
                )}
                {c.zona && (
                  <div className={styles.muted} title="Zona de reparto">
                    {c.zona}
                  </div>
                )}
              </td>
              <td data-label="Dirección">{formatAddress(c.address)}</td>
              <td data-label="Tipo">
                <ClientTypeBadge value={c.clientType} />
              </td>
              <td data-label="Teléfono">{c.phone ?? <span className={styles.muted}>—</span>}</td>
              <td data-label="Estado">
                <ClientStatusBadge active={c.active} />
              </td>
              <td data-label="Acciones" className={styles.actions}>
                <Link to={`/admin/clientes/${c.id}`} className={styles.viewLink}>
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
