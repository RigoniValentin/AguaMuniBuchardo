import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Spinner } from '@/components/Spinner/Spinner';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { formatMinorAsARS } from '@/shared/money';
import { formatDate } from '@/shared/date';
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  type OrderStatus,
} from '../../types/orders.types';
import { useMyOrder } from '../../hooks/useOrders';
import { useCancelMyOrder } from '../../hooks/useOrderMutations';
import styles from './CiudadanoPedidoDetallePage.module.css';

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return formatDate(value);
}

export function CiudadanoPedidoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const { data, isLoading, isError, error, refetch } = useMyOrder(id);
  const cancelMutation = useCancelMyOrder();

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Cargando pedido..." />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="No pudimos cargar el pedido"
        description={
          error instanceof Error ? error.message : 'Pedido no encontrado.'
        }
        onRetry={() => refetch()}
      />
    );
  }

  const order = data.order;
  // Mientras nadie tomó el pedido, el ciudadano puede cancelar.
  // Una vez que un repartidor lo reclama (ASSIGNED) lo cancela el admin.
  const canCancel = order.status === 'CONFIRMED' || order.status === 'PENDING';

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <h1>Pedido #{order.id.slice(-6).toUpperCase()}</h1>
          <p>Fecha {formatDate(order.createdAt)}</p>
        </div>
        <Badge tone={ORDER_STATUS_TONE[order.status as OrderStatus]}>
          {ORDER_STATUS_LABEL[order.status as OrderStatus]}
        </Badge>
      </header>

      <Card>
        <CardTitle>Productos</CardTitle>
        <CardSubtitle>{order.items.length} ítem(s) en este pedido.</CardSubtitle>

        <ul className={styles.list}>
          {order.items.map((item) => (
            <li key={item.productId} className={styles.row}>
              <div className={styles.rowMain}>
                <span className={styles.productName}>{item.productName}</span>
                <span className={styles.qty}>× {item.quantity}</span>
              </div>
              <div className={styles.rowMeta}>
                <span>
                  {item.adjustmentPercentage !== 0 && (
                    <span className={styles.adjustment}>
                      {formatMinorAsARS(item.unitBasePriceMinor)} ·{' '}
                      {item.adjustmentPercentage > 0 ? '+' : ''}
                      {item.adjustmentPercentage}%
                    </span>
                  )}
                  <strong> {formatMinorAsARS(item.unitFinalPriceMinor)} c/u</strong>
                </span>
                <span className={styles.subtotal}>
                  = {formatMinorAsARS(item.subtotalFinalMinor)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        <div className={styles.totalRow}>
          <span>Total</span>
          <strong>{formatMinorAsARS(order.totalFinalMinor)}</strong>
        </div>
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
        </CardSubtitle>
        {order.deliveryAddress.references && (
          <p className={styles.note}>
            <strong>Referencias:</strong> {order.deliveryAddress.references}
          </p>
        )}
      </Card>

      {order.customerNote && (
        <Card>
          <CardTitle>Nota</CardTitle>
          <CardSubtitle>{order.customerNote}</CardSubtitle>
        </Card>
      )}

      <Card>
        <CardTitle>Línea de tiempo</CardTitle>
        <ul className={styles.timeline}>
          <li>
            <span>Creado</span>
            <span>{formatDateTime(order.createdAt)}</span>
          </li>
          {order.assignedAt && (
            <li>
              <span>Asignado</span>
              <span>{formatDateTime(order.assignedAt)}</span>
            </li>
          )}
          {order.startedDeliveryAt && (
            <li>
              <span>En reparto</span>
              <span>{formatDateTime(order.startedDeliveryAt)}</span>
            </li>
          )}
          {order.deliveredAt && (
            <li>
              <span>Entregado</span>
              <span>{formatDateTime(order.deliveredAt)}</span>
            </li>
          )}
          {order.cancelledAt && (
            <li>
              <span>Cancelado</span>
              <span>{formatDateTime(order.cancelledAt)}</span>
            </li>
          )}
        </ul>
        {order.cancellationReason && (
          <p className={styles.note}>
            <strong>Motivo cancelación:</strong> {order.cancellationReason}
          </p>
        )}
      </Card>

      <div className={styles.actions}>
        <Link to="/ciudadano/pedidos">
          <Button variant="ghost">← Volver al listado</Button>
        </Link>
        {canCancel && (
          <Button variant="danger" onClick={() => setCancelOpen(true)}>
            Cancelar pedido
          </Button>
        )}
        <Link to="/ciudadano/pagos/nuevo">
          <Button variant="secondary">Informar pago</Button>
        </Link>
      </div>

      {cancelOpen && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <Card>
            <CardTitle>Cancelar pedido</CardTitle>
            <CardSubtitle>
              Vamos a anular el pedido y devolver el cargo de tu cuenta
              corriente.
            </CardSubtitle>
            <label htmlFor="cancelReason" className={styles.label}>
              Motivo (opcional)
            </label>
            <textarea
              id="cancelReason"
              className={styles.textarea}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
            {cancelMutation.isError && (
              <div className={styles.error} role="alert">
                {(cancelMutation.error as { message?: string })?.message ??
                  'No se pudo cancelar el pedido'}
              </div>
            )}
            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={() => setCancelOpen(false)}>
                Volver
              </Button>
              <Button
                variant="danger"
                loading={cancelMutation.isPending}
                onClick={async () => {
                  await cancelMutation.mutateAsync({
                    id: order.id,
                    payload: { reason: cancelReason || undefined },
                  });
                  setCancelOpen(false);
                  navigate('/ciudadano/pedidos');
                }}
              >
                Sí, cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
