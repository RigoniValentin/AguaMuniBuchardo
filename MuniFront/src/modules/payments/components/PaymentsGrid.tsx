import { Link } from 'react-router-dom';
import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Spinner } from '@/components/Spinner/Spinner';
import { formatMinorAsARS } from '@/shared/money';
import { formatDate } from '@/shared/date';
import { CLIENT_TYPE_LABEL } from '@/modules/admin/clients/types/clients.types';

const DOCUMENT_TYPE_LABEL_ADMIN: Record<string, string> = {
  DNI: 'DNI',
  CUIT: 'CUIT',
  CUIT_TEMP: 'CUIL',
  OTHER: 'Otro',
};
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_TONE,
  type AdminPayment,
  type PaymentPagination,
} from '../types/payments.types';
import styles from './PaymentsGrid.module.css';

export interface PaymentsGridProps {
  items: AdminPayment[] | undefined;
  pagination?: PaymentPagination;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isFetching: boolean;
  refetch: () => void;
  onPageChange: (page: number) => void;
}

export function PaymentsGrid({
  items,
  pagination,
  isLoading,
  isError,
  error,
  isFetching,
  refetch,
  onPageChange,
}: PaymentsGridProps) {
  if (isLoading) {
    return <Spinner label="Cargando pagos..." />;
  }
  if (isError) {
    return (
      <ErrorState
        title="No pudimos cargar los pagos"
        description={error instanceof Error ? error.message : 'Intente nuevamente.'}
        onRetry={() => refetch()}
      />
    );
  }
  if (!items || items.length === 0) {
    return (
      <EmptyState
        title="Sin pagos para mostrar"
        description="Ajustá los filtros para ver otros pagos."
      />
    );
  }

  const page = pagination?.page ?? 1;
  const pages = pagination?.pages ?? 1;
  const limit = pagination?.limit ?? items.length;
  const total = pagination?.total ?? items.length;

  return (
    <>
      <ul className={styles.list}>
        {items.map((p) => (
          <PaymentRow key={p.id} payment={p} />
        ))}
      </ul>
      <Pagination
        page={page}
        pages={pages}
        total={total}
        limit={limit}
        onPageChange={onPageChange}
      />
      {isFetching && (
        <div className={styles.fetchingHint}>Actualizando…</div>
      )}
    </>
  );
}

function PaymentRow({ payment }: { payment: AdminPayment }) {
  return (
    <li className={styles.item}>
      <Link to={`/admin/pagos/${payment.id}`} className={styles.itemLink}>
        <div className={styles.headRow}>
          <span className={styles.client}>
            {payment.client.fullName}
          </span>
          <Badge tone={PAYMENT_STATUS_TONE[payment.status]}>
            {PAYMENT_STATUS_LABEL[payment.status]}
          </Badge>
        </div>
        <div className={styles.metaRow}>
          <span>{formatMinorAsARS(payment.amountMinor)}</span>
          <span className={styles.dot}>·</span>
          <span>{PAYMENT_METHOD_LABEL[payment.paymentMethod]}</span>
          <span className={styles.dot}>·</span>
          <span>{formatDate(payment.submittedAt)}</span>
        </div>
        <div className={styles.subRow}>
          <span>
            {DOCUMENT_TYPE_LABEL_ADMIN[payment.client.documentType]}{' '}
            {payment.client.documentNumber}
          </span>
          <span className={styles.dot}>·</span>
          <span>{CLIENT_TYPE_LABEL[payment.client.clientType]}</span>
        </div>
      </Link>
    </li>
  );
}

function Pagination({
  page,
  pages,
  total,
  limit,
  onPageChange,
}: {
  page: number;
  pages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}) {
  if (total <= limit && pages <= 1) {
    return (
      <div className={styles.summary}>
        {total === 0
          ? 'Sin resultados'
          : `Mostrando ${total} resultado${total === 1 ? '' : 's'}`}
      </div>
    );
  }
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return (
    <div className={styles.pagination}>
      <span className={styles.summary}>
        Mostrando {from}-{to} de {total}
      </span>
      <div className={styles.controls}>
        <Button
          variant="ghost"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <span className={styles.pageInfo}>
          Página {page} de {pages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
