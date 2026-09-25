import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/Badge/Badge';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Spinner } from '@/components/Spinner/Spinner';
import { Button } from '@/components/Button/Button';
import { formatMinorAsARS } from '@/shared/money';
import { formatDate } from '@/shared/date';
import { useMyPayments } from '../hooks/useMyPayments';
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_TONE,
  type CitizenPayment,
} from '../types/payments.types';
import styles from './MyPaymentsList.module.css';

export function MyPaymentsList() {
  const { data, isLoading, isError, refetch } = useMyPayments({ page: 1, limit: 50 });

  const items = useMemo(() => data?.items ?? [], [data]);

  if (isLoading) {
    return (
      <Card>
        <Spinner label="Cargando pagos..." />
      </Card>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="No pudimos cargar tus pagos"
        description="Intente nuevamente."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <Card>
      <div className={styles.headerRow}>
        <div>
          <CardTitle>Mis pagos</CardTitle>
          <CardSubtitle>
            {items.length === 0
              ? 'Aún no informaste pagos.'
              : `${items.length} pago${items.length === 1 ? '' : 's'} registrado${items.length === 1 ? '' : 's'}.`}
          </CardSubtitle>
        </div>
        <Link to="/ciudadano/pagos/nuevo">
          <Button>+ Informar pago</Button>
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Sin pagos registrados"
          description="Cuando informes un pago a la Municipalidad aparecerá aquí."
        />
      ) : (
        <ul className={styles.list}>
          {items.map((p: CitizenPayment) => (
            <PaymentRow key={p.id} payment={p} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function PaymentRow({ payment }: { payment: CitizenPayment }) {
  return (
    <li className={styles.item}>
      <Link to={`/ciudadano/pagos/${payment.id}`} className={styles.itemLink}>
        <div className={styles.itemHead}>
          <span className={styles.amount}>{formatMinorAsARS(payment.amountMinor)}</span>
          <Badge tone={PAYMENT_STATUS_TONE[payment.status]}>
            {PAYMENT_STATUS_LABEL[payment.status]}
          </Badge>
        </div>
        <div className={styles.itemMeta}>
          <span>{PAYMENT_METHOD_LABEL[payment.paymentMethod]}</span>
          <span className={styles.dot}>·</span>
          <span>{formatDate(payment.submittedAt)}</span>
        </div>
        <PaymentStatusNote payment={payment} />
      </Link>
    </li>
  );
}

function PaymentStatusNote({ payment }: { payment: CitizenPayment }) {
  if (payment.status === 'APPROVED') {
    return <p className={styles.noteSuccess}>Acreditado en tu cuenta.</p>;
  }
  if (payment.status === 'REVERSED') {
    return <p className={styles.noteNeutral}>Aprobación revertida.</p>;
  }
  if (payment.status === 'REJECTED' && payment.rejectionReason) {
    return (
      <p className={styles.noteDanger}>
        Motivo: {payment.rejectionReason}
      </p>
    );
  }
  return null;
}