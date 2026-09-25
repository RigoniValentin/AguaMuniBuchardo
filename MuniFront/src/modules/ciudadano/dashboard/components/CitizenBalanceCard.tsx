import { Link } from 'react-router-dom';
import { describeCitizenBalance } from '@/modules/ciudadano/shared/balance.view';
import type { CitizenClient } from '@/modules/ciudadano/shared/client.types';
import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import styles from './CitizenBalanceCard.module.css';

interface CitizenBalanceCardProps {
  client: CitizenClient;
  balanceMinor: number | null;
  loading?: boolean;
}

export function CitizenBalanceCard({ client, balanceMinor, loading }: CitizenBalanceCardProps) {
  const balance = balanceMinor === null ? null : describeCitizenBalance(balanceMinor);
  const hasDebt = balance?.status === 'DEBT';
  return (
    <section className={styles.card} aria-label="Estado de cuenta">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Hola, {client.firstName}</p>
          <h2 className={styles.name}>{client.fullName}</h2>
        </div>
        <Badge tone={client.active ? 'success' : 'warning'}>
          {client.active ? 'Cuenta activa' : 'Cuenta inactiva'}
        </Badge>
      </header>

      <div className={styles.balanceRow}>
        <span className={styles.balanceLabel}>Estado actual</span>
        {loading || balance === null ? (
          <span className={styles.balanceMuted}>Cargando…</span>
        ) : (
          <span className={`${styles.balanceText} ${styles[`status-${balance.status}`]}`}>
            {balance.friendly}
          </span>
        )}
      </div>

      {hasDebt && (
        <Link to="/ciudadano/pagos/nuevo" className={styles.cta}>
          <Button block>Informar pago</Button>
        </Link>
      )}
    </section>
  );
}