import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Spinner } from '@/components/Spinner/Spinner';
import { Input } from '@/components/Input/Input';
import { useAuth } from '@/hooks/auth-context';
import { ApiError } from '@/services/api';
import { formatMinorAsARS } from '@/shared/money';
import { formatDate } from '@/shared/date';
import { usePayment } from '../hooks/usePayments';
import { paymentsApi } from '../services/payments.api';
import { useReceiptObjectUrl } from '../hooks/useReceiptObjectUrl';
import {
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_TONE,
  formatBytes,
  type AdminPayment,
  type PaymentStatus,
} from '../types/payments.types';
import styles from './AdminPagoDetailPage.module.css';

type Modal =
  | 'approve'
  | { type: 'reject' }
  | { type: 'reverse' }
  | null;

function isImageMime(mime: string | null | undefined): boolean {
  return Boolean(mime && mime.startsWith('image/'));
}

export function AdminPagoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const canReview = user?.permissions.includes('payments.review') ?? false;
  const canReverse = user?.permissions.includes('payments.reverse') ?? false;

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = usePayment(id);

  const approveMutation = useApproveMutation(id ?? '');
  const rejectMutation = useRejectMutation(id ?? '');
  const reverseMutation = useReverseMutation(id ?? '');

  const [modal, setModal] = useState<Modal>(null);
  const [reason, setReason] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setReason('');
    setSubmitError(null);
  }, [modal]);

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
        description={error instanceof Error ? error.message : 'Intente nuevamente.'}
        onRetry={() => refetch()}
        action={
          <Link to="/admin/pagos">
            <Button variant="ghost">Volver al listado</Button>
          </Link>
        }
      />
    );
  }

  const payment = data.payment;

  const handleApprove = async () => {
    setSubmitError(null);
    try {
      await approveMutation.mutateAsync();
      setModal(null);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo aprobar el pago.',
      );
    }
  };

  const handleReject = async () => {
    if (reason.trim().length === 0) {
      setSubmitError('El motivo es obligatorio.');
      return;
    }
    setSubmitError(null);
    try {
      await rejectMutation.mutateAsync({ reason: reason.trim() });
      setModal(null);
      setReason('');
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo rechazar el pago.',
      );
    }
  };

  const handleReverse = async () => {
    if (reason.trim().length === 0) {
      setSubmitError('El motivo es obligatorio.');
      return;
    }
    setSubmitError(null);
    try {
      await reverseMutation.mutateAsync({ reason: reason.trim() });
      setModal(null);
      setReason('');
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo revertir la aprobación.',
      );
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <Link to="/admin/pagos" className={styles.backLink}>
            ← Pagos
          </Link>
          <div className={styles.titleRow}>
            <h1>{formatMinorAsARS(payment.amountMinor)}</h1>
            <Badge tone={PAYMENT_STATUS_TONE[payment.status]}>
              {PAYMENT_STATUS_LABEL[payment.status]}
            </Badge>
          </div>
          <p className={styles.docLine}>
            {payment.client.fullName} · {payment.client.documentType}{' '}
            {payment.client.documentNumber}
          </p>
        </div>
        <ActionButtons
          status={payment.status}
          canReview={canReview}
          canReverse={canReverse}
          onApprove={() => setModal('approve')}
          onReject={() => setModal({ type: 'reject' })}
          onReverse={() => setModal({ type: 'reverse' })}
        />
      </header>

      {payment.status === 'REJECTED' && payment.rejectionReason && (
        <Card>
          <CardTitle>Pago rechazado</CardTitle>
          <CardSubtitle>Motivo: {payment.rejectionReason}</CardSubtitle>
        </Card>
      )}

      {payment.status === 'REVERSED' && (
        <Card>
          <CardTitle>Aprobación revertida</CardTitle>
          <CardSubtitle>
            {payment.reversalReason
              ? `Motivo: ${payment.reversalReason}`
              : 'Revertido administrativamente.'}
          </CardSubtitle>
        </Card>
      )}

      <Card>
        <CardTitle>Datos del pago</CardTitle>
        <CardSubtitle>Información registrada para auditoría.</CardSubtitle>
        <dl className={styles.dl}>
          <div>
            <dt>Cliente</dt>
            <dd>{payment.client.fullName}</dd>
          </div>
          <div>
            <dt>Documento</dt>
            <dd>
              {payment.client.documentType} {payment.client.documentNumber}
            </dd>
          </div>
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
              <dt>Nota del ciudadano</dt>
              <dd>{payment.note}</dd>
            </div>
          )}
          {payment.reviewedAt && (
            <div>
              <dt>Revisado</dt>
              <dd>{formatDate(payment.reviewedAt)}</dd>
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

      {modal === 'approve' && (
        <ConfirmModal
          title="Aprobar pago"
          warning="Al aprobar este pago se acreditará automáticamente el importe en la cuenta corriente del cliente."
          confirmLabel="Aprobar pago"
          onCancel={() => setModal(null)}
          onConfirm={handleApprove}
          submitting={approveMutation.isPending}
          submitError={submitError}
        >
          <dl className={styles.modalDl}>
            <div>
              <dt>Cliente</dt>
              <dd>{payment.client.fullName}</dd>
            </div>
            <div>
              <dt>Monto</dt>
              <dd>{formatMinorAsARS(payment.amountMinor)}</dd>
            </div>
            <div>
              <dt>Estado actual</dt>
              <dd>{PAYMENT_STATUS_LABEL[payment.status]}</dd>
            </div>
          </dl>
        </ConfirmModal>
      )}

      {modal && typeof modal === 'object' && modal.type === 'reject' && (
        <ReasonModal
          title="Rechazar pago"
          warning="El pago quedará rechazado y no modificará la cuenta corriente."
          confirmLabel="Rechazar pago"
          reason={reason}
          onReasonChange={setReason}
          onCancel={() => setModal(null)}
          onConfirm={handleReject}
          submitting={rejectMutation.isPending}
          submitError={submitError}
        />
      )}

      {modal && typeof modal === 'object' && modal.type === 'reverse' && (
        <ReasonModal
          title="Revertir aprobación"
          warning="El crédito original no será eliminado. Se generará un movimiento inverso para conservar la trazabilidad."
          confirmLabel="Revertir aprobación"
          reason={reason}
          onReasonChange={setReason}
          onCancel={() => setModal(null)}
          onConfirm={handleReverse}
          submitting={reverseMutation.isPending}
          submitError={submitError}
        />
      )}
    </div>
  );
}

function ActionButtons({
  status,
  canReview,
  canReverse,
  onApprove,
  onReject,
  onReverse,
}: {
  status: PaymentStatus;
  canReview: boolean;
  canReverse: boolean;
  onApprove: () => void;
  onReject: () => void;
  onReverse: () => void;
}) {
  if (status === 'PENDING' && canReview) {
    return (
      <div className={styles.actions}>
        <Button variant="primary" onClick={onApprove}>
          Aprobar
        </Button>
        <Button variant="danger" onClick={onReject}>
          Rechazar
        </Button>
      </div>
    );
  }
  if (status === 'APPROVED' && canReverse) {
    return (
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onReverse}>
          Revertir aprobación
        </Button>
      </div>
    );
  }
  return null;
}

function ConfirmModal({
  title,
  warning,
  confirmLabel,
  onCancel,
  onConfirm,
  submitting,
  submitError,
  children,
}: {
  title: string;
  warning: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  submitting: boolean;
  submitError: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <header className={styles.modalHeader}>
          <h2>{title}</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onCancel}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>
        <div className={styles.modalBody}>{children}</div>
        <p className={styles.modalWarning}>{warning}</p>
        {submitError && <div className={styles.modalError}>{submitError}</div>}
        <div className={styles.modalActions}>
          <Button variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onConfirm} loading={submitting}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReasonModal({
  title,
  warning,
  confirmLabel,
  reason,
  onReasonChange,
  onCancel,
  onConfirm,
  submitting,
  submitError,
}: {
  title: string;
  warning: string;
  confirmLabel: string;
  reason: string;
  onReasonChange: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  submitting: boolean;
  submitError: string | null;
}) {
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <header className={styles.modalHeader}>
          <h2>{title}</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onCancel}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>
        <div className={styles.modalBody}>
          <Input
            label="Motivo"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Explicá brevemente el motivo"
            required
            maxLength={500}
          />
        </div>
        <p className={styles.modalWarning}>{warning}</p>
        {submitError && <div className={styles.modalError}>{submitError}</div>}
        <div className={styles.modalActions}>
          <Button variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onConfirm} loading={submitting}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReceiptViewer({ payment }: { payment: AdminPayment }) {
  const fetcher = useMemo(
    () => () => paymentsApi.receiptBlob(payment.id),
    [payment.id],
  );
  const { url, contentType, loading, error } = useReceiptObjectUrl(fetcher);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (loading) {
    return <Spinner label="Cargando comprobante..." />;
  }
  if (error) {
    return (
      <ErrorState
        title="No pudimos cargar el comprobante"
        description={error instanceof Error ? error.message : 'Intente nuevamente.'}
      />
    );
  }
  if (!url) return null;

  const downloadName =
    payment.receipt.originalName || `comprobante-${payment.id}`;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isImageMime(contentType)) {
    return (
      <>
        <div className={styles.receiptFrame}>
          <button
            type="button"
            className={styles.receiptThumbBtn}
            onClick={() => setLightboxOpen(true)}
            aria-label="Ver comprobante en grande"
          >
            <img
              src={url}
              alt={`Comprobante del pago ${payment.id}`}
              className={styles.receiptImage}
            />
          </button>
        </div>
        <div className={styles.receiptActions}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setLightboxOpen(true)}
          >
            Ver en grande
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            Descargar
          </Button>
          <span className={styles.receiptMeta}>
            {payment.receipt.originalName} · {payment.receipt.mimeType} ·{' '}
            {formatBytes(payment.receipt.size)}
          </span>
        </div>
        {lightboxOpen && (
          <ReceiptLightbox
            src={url}
            alt={`Comprobante del pago ${payment.id}`}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <p className={styles.fileMeta}>
        {payment.receipt.originalName} · {payment.receipt.mimeType} ·{' '}
        {formatBytes(payment.receipt.size)}
      </p>
      <div className={styles.receiptActions}>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className={styles.pdfLink}
        >
          Abrir comprobante (PDF)
        </a>
        <Button variant="ghost" size="sm" onClick={handleDownload}>
          Descargar
        </Button>
      </div>
    </>
  );
}

function ReceiptLightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      className={styles.lightboxOverlay}
      role="dialog"
      aria-modal="true"
      aria-label="Vista ampliada del comprobante"
      onClick={onClose}
    >
      <button
        type="button"
        className={styles.lightboxClose}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Cerrar"
      >
        ×
      </button>
      <div
        className={styles.lightboxContent}
        onClick={(e) => e.stopPropagation()}
      >
        <img src={src} alt={alt} className={styles.lightboxImage} />
      </div>
    </div>
  );
}

// Local hooks to keep this file readable. They simply wire up the
// shared usePayments mutations with the current paymentId.
import { useApprovePayment, useRejectPayment, useReversePayment } from '../hooks/usePayments';

function useApproveMutation(paymentId: string) {
  return useApprovePayment(paymentId);
}
function useRejectMutation(paymentId: string) {
  return useRejectPayment(paymentId);
}
function useReverseMutation(paymentId: string) {
  return useReversePayment(paymentId);
}