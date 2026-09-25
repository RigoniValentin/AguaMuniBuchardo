import { Link } from 'react-router-dom';
import { ClientTypeBadge } from './ClientTypeBadge';
import { ClientStatusBadge } from './ClientStatusBadge';
import { formatAddress, type Client } from '../types/clients.types';
import styles from './ClientsCards.module.css';

interface ClientsCardsProps {
  items: Client[];
}

export function ClientsCards({ items }: ClientsCardsProps) {
  return (
    <ul className={styles.list}>
      {items.map((c) => (
        <li key={c.id} className={styles.card}>
          <header className={styles.header}>
            <Link to={`/admin/clientes/${c.id}`} className={styles.nameLink}>
              <strong>{c.fullName}</strong>
            </Link>
            <ClientStatusBadge active={c.active} />
          </header>
          <div className={styles.row}>
            {c.documentType ? (
              <>
                <span className={styles.docType}>{c.documentType}</span>
                <span className={styles.docNumber}>{c.documentNumber ?? ''}</span>
              </>
            ) : (
              <span className={styles.muted}>Sin documento</span>
            )}
            <ClientTypeBadge value={c.clientType} />
            {c.zona && (
              <span className={styles.muted} title="Zona de reparto">
                {c.zona}
              </span>
            )}
          </div>
          <p className={styles.address}>{formatAddress(c.address)}</p>
          {c.phone && <p className={styles.phone}>Tel: {c.phone}</p>}
          {c.email && <p className={styles.email}>{c.email}</p>}
          <footer className={styles.footer}>
            <Link to={`/admin/clientes/${c.id}`} className={styles.viewLink}>
              Ver / editar
            </Link>
          </footer>
        </li>
      ))}
    </ul>
  );
}
