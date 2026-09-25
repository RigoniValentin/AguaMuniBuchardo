import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { Spinner } from '@/components/Spinner/Spinner';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { formatMinorAsARS } from '@/shared/money';
import { formatDate } from '@/shared/date';
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  type OrderStatus,
} from '../../types/orders.types';
import { useMyDelivery } from '../../hooks/useOrders';
import {
  useClaimOrder,
  useDeliverOrder,
  useStartDelivery,
} from '../../hooks/useOrderMutations';
import styles from './RepartidorEntregaDetallePage.module.css';

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return formatDate(value);
}

export function RepartidorEntregaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [confirmAction, setConfirmAction] = useState<'start' | 'deliver' | null>(
    null,
  );
  const { data, isLoading, isError, error, refetch } = useMyDelivery(id);
  const startMutation = useStartDelivery();
  const deliverMutation = useDeliverOrder();
  const claimMutation = useClaimOrder();

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Cargando entrega..." />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="No pudimos cargar la entrega"
        description={
          error instanceof Error ? error.message : 'Entrega no encontrada.'
        }
        onRetry={() => refetch()}
      />
    );
  }

  const order = data.order;
  const status = order.status as OrderStatus;

  const handleStart = async () => {
    await startMutation.mutateAsync(order.id);
    setConfirmAction(null);
  };

  const handleDeliver = async () => {
    await deliverMutation.mutateAsync(order.id);
    setConfirmAction(null);
    navigate('/repartidor');
  };

  const handleClaim = async () => {
    await claimMutation.mutateAsync(order.id);
  };

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <h1>Entrega #{order.id.slice(-6).toUpperCase()}</h1>
          <p>{order.client?.fullName ?? 'Cliente'}</p>
        </div>
        <Badge tone={ORDER_STATUS_TONE[status]}>
          {ORDER_STATUS_LABEL[status]}
        </Badge>
      </header>

      <Card>
        <CardTitle>Cliente</CardTitle>
        <CardSubtitle>
          {order.client?.fullName}
          <br />
          {order.client?.documentType} {order.client?.documentNumber}
        </CardSubtitle>
        {order.client && 'phone' in order.client &&
          (order.client as { phone?: string | null }).phone && (
            <p className={styles.note}>
              Tel: {(order.client as { phone?: string }).phone}
            </p>
          )}
      </Card>

      <Card>
        <CardTitle>Dirección de entrega</CardTitle>
        <CardSubtitle>
          {order.deliveryAddress.street} {order.deliveryAddress.number}
          {order.deliveryAddress.floor
            ? `, ${order.deliveryAddress.floor}`
            : ''}
          {order.deliveryAddress.apartment
            ? ` ${order.deliveryAddress.apartment}`
            : ''}
          <br />
          {order.deliveryAddress.locality}
          {order.deliveryAddress.neighborhood
            ? ` (${order.deliveryAddress.neighborhood})`
            : ''}
        </CardSubtitle>
        {order.deliveryAddress.references && (
          <p className={styles.note}>
            <strong>Referencias:</strong> {order.deliveryAddress.references}
          </p>
        )}
      </Card>

      <Card>
        <CardTitle>Productos y total</CardTitle>
        <ul className={styles.list}>
          {order.items.map((item) => (
            <li key={item.productId} className={styles.row}>
              <div>
                <strong>{item.productName}</strong> × {item.quantity}
              </div>
              <div>{formatMinorAsARS(item.subtotalFinalMinor)}</div>
            </li>
          ))}
        </ul>
        <div className={styles.totalRow}>
          <span>Total</span>
          <strong>{formatMinorAsARS(order.totalFinalMinor)}</strong>
        </div>
        {order.customerNote && (
          <p className={styles.note}>
            <strong>Nota:</strong> {order.customerNote}
          </p>
        )}
        <p className={styles.note}>
          Creado {formatDateTime(order.createdAt)}
          {order.startedDeliveryAt
            ? ` · Iniciado ${formatDateTime(order.startedDeliveryAt)}`
            : ''}
          {order.deliveredAt
            ? ` · Entregado ${formatDateTime(order.deliveredAt)}`
            : ''}
        </p>
        {order.zona && (
          <p className={styles.note}>
            <strong>Zona:</strong> {order.zona}
          </p>
        )}
      </Card>

      <div className={styles.actions}>
        {status === 'PENDING' && (
          <Button
            size="lg"
            block
            onClick={handleClaim}
            loading={claimMutation.isPending}
          >
            Tomar pedido
          </Button>
        )}
        {status === 'ASSIGNED' && (
          <Button
            size="lg"
            block
            onClick={() => setConfirmAction('start')}
          >
            Iniciar reparto
          </Button>
        )}
        {status === 'OUT_FOR_DELIVERY' && (
          <Button
            size="lg"
            block
            variant="primary"
            onClick={() => setConfirmAction('deliver')}
          >
            Marcar como entregado
          </Button>
        )}
        {status === 'DELIVERED' && (
          <Button block variant="ghost" onClick={() => navigate('/repartidor')}>
            ← Volver al listado
          </Button>
        )}
        {status === 'PENDING' && claimMutation.isError && (
          <p className={styles.note} role="alert">
            {(claimMutation.error as { message?: string })?.message ??
              'No se pudo tomar el pedido'}
          </p>
        )}
      </div>

      {confirmAction && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <h3>
              {confirmAction === 'start'
                ? '¿Iniciar el reparto?'
                : '¿Confirmás que la entrega fue completada?'}
            </h3>
            <p>
              {confirmAction === 'start'
                ? 'A partir de ahora el pedido figura como en reparto.'
                : 'Esta acción no se puede deshacer. El pedido quedará entregado.'}
            </p>
            <div className={styles.modalActions}>
              <Button
                variant="ghost"
                onClick={() => setConfirmAction(null)}
              >
                Volver
              </Button>
              <Button
                loading={
                  startMutation.isPending || deliverMutation.isPending
                }
                onClick={confirmAction === 'start' ? handleStart : handleDeliver}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
