import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Spinner } from '@/components/Spinner/Spinner';
import { myPaymentsApi } from '../services/payments.api';
import { useMyPayment } from '../hooks/useMyPayments';
import { useReceiptObjectUrl } from '../hooks/useReceiptObjectUrl';
import { formatMinorAsARS } from '@/shared/money';
import { formatDate } from '@/shared/date';
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_TONE,
  type CitizenPayment,
} from '../types/payments.types';
import styles from './CiudadanoPagoDetailPage.module.css';

function isImageMime(mime: string | null | undefined): boolean {
  return Boolean(mime && mime.startsWith('image/'));
}

export function CiudadanoPagoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useMyPayment(id);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Cargando pago..." />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="No pudimos cargar el pago"
        description="Intente nuevamente."
        onRetry={() => refetch()}
        action={
          <Link to="/ciudadano/pagos">
            <Button variant="ghost">Volver al listado</Button>
          </Link>
        }
      />
    );
  }

  const payment = data.payment;
  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <Link to="/ciudadano/pagos" className={styles.backLink}>
            ← Mis pagos
          </Link>
          <div className={styles.titleRow}>
            <h1>{formatMinorAsARS(payment.amountMinor)}</h1>
            <Badge tone={PAYMENT_STATUS_TONE[payment.status]}>
              {PAYMENT_STATUS_LABEL[payment.status]}
            </Badge>
          </div>
          <p className={styles.docLine}>
            {PAYMENT_METHOD_LABEL[payment.paymentMethod]} · {formatDate(payment.submittedAt)}
          </p>
        </div>
      </header>

      <PaymentStatusBanner payment={payment} />

      <Card>
        <CardTitle>Datos del pago</CardTitle>
        <CardSubtitle>Información registrada para auditoría.</CardSubtitle>
        <dl className={styles.dl}>
          <div>
            <dt>Monto</dt>
            <dd>{formatMinorAsARS(payment.amountMinor)}</dd>
          </div>
          <div>
            <dt>Método</dt>
            <dd>{PAYMENT_METHOD_LABEL[payment.paymentMethod]}</dd>
          </div>
          <div>
            <dt>Fecha de envío</dt>
            <dd>{formatDate(payment.submittedAt)}</dd>
          </div>
          {payment.note && (
            <div>
              <dt>Nota</dt>
              <dd>{payment.note}</dd>
            </div>
          )}
        </dl>
      </Card>

      <Card>
        <CardTitle>Comprobante</CardTitle>
        <CardSubtitle>
          El archivo se almacena de forma segura. No se expone por URL pública.
        </CardSubtitle>
        <ReceiptViewer payment={payment} />
      </Card>
    </div>
  );
}

function PaymentStatusBanner({ payment }: { payment: CitizenPayment }) {
  if (payment.status === 'PENDING') {
    return (
      <Card>
        <CardTitle>Pendiente de revisión</CardTitle>
        <CardSubtitle>
          La Municipalidad revisará el comprobante antes de acreditarlo en
          tu cuenta. Estado: Pendiente.
        </CardSubtitle>
      </Card>
    );
  }
  if (payment.status === 'APPROVED') {
    return (
      <Card>
        <CardTitle>Pago aprobado</CardTitle>
        <CardSubtitle>
          Acreditado en tu cuenta.
          {payment.reviewedAt && (
            <> Revisado el {formatDate(payment.reviewedAt)}.</>
          )}
        </CardSubtitle>
      </Card>
    );
  }
  if (payment.status === 'REJECTED') {
    return (
      <Card>
        <CardTitle>Pago rechazado</CardTitle>
        <CardSubtitle>
          {payment.rejectionReason
            ? `Motivo: ${payment.rejectionReason}`
            : 'El pago fue rechazado.'}
        </CardSubtitle>
      </Card>
    );
  }
  if (payment.status === 'REVERSED') {
    return (
      <Card>
        <CardTitle>Aprobación revertida</CardTitle>
        <CardSubtitle>
          Este pago fue revertido administrativamente.
          {payment.reversedAt && (
            <> Revertido el {formatDate(payment.reversedAt)}.</>
          )}
        </CardSubtitle>
      </Card>
    );
  }
  return null;
}

function ReceiptViewer({ payment }: { payment: CitizenPayment }) {
  const fetcher = useMemo(
    () => () => myPaymentsApi.receiptBlob(payment.id),
    [payment.id],
  );
  const { url, contentType, loading, error } = useReceiptObjectUrl(fetcher);

  if (loading) {
    return <Spinner label="Cargando comprobante..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="No pudimos cargar el comprobante"
        description={
          error instanceof Error ? error.message : 'Intente nuevamente.'
        }
      />
    );
  }

  if (!url) return null;

  if (isImageMime(contentType)) {
    return (
      <img
        src={url}
        alt={`Comprobante del pago ${payment.id}`}
        className={styles.receiptImage}
      />
    );
  }

  return (
    <p className={styles.fileMeta}>
      {payment.receipt.mimeType} · {payment.receipt.originalName}
    </p>
  );
}