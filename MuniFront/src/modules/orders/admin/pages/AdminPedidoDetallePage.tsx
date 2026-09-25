import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { Spinner } from '@/components/Spinner/Spinner';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import { formatMinorAsARS } from '@/shared/money';
import { formatDate } from '@/shared/date';
import {
  ORDER_ORIGIN_LABEL,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TONE,
  type OrderOrigin,
  type OrderStatus,
} from '../../types/orders.types';
import { useAdminOrder } from '../../hooks/useOrders';
import { useCancelOrderAdmin } from '../../hooks/useOrderMutations';
import styles from './AdminPedidoDetallePage.module.css';

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return formatDate(value);
}

export function AdminPedidoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const { data, isLoading, isError, error, refetch } = useAdminOrder(id);
  const cancelMutation = useCancelOrderAdmin();

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
  // En el nuevo flujo la administración NO asigna repartidores: los
  // pedidos los toman los repartidores directamente del pool PENDING.
  // El admin solo cancela (en estados no terminales) y hace seguimiento.
  const canCancel =
    order.status === 'CONFIRMED' ||
    order.status === 'PENDING' ||
    order.status === 'ASSIGNED';

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    await cancelMutation.mutateAsync({
      id: order.id,
      reason: cancelReason.trim(),
    });
    setCancelOpen(false);
    setCancelReason('');
  };

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <h1>Pedido #{order.id.slice(-6).toUpperCase()}</h1>
          <p>
            {order.client?.fullName ?? 'Cliente'} ·{' '}
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div className={styles.headingRight}>
          <Badge tone="neutral">
            {ORDER_ORIGIN_LABEL[order.origin as OrderOrigin]}
          </Badge>
          <Badge tone={ORDER_STATUS_TONE[order.status as OrderStatus]}>
            {ORDER_STATUS_LABEL[order.status as OrderStatus]}
          </Badge>
        </div>
      </header>

      <div className={styles.grid}>
        <Card>
          <CardTitle>Cliente</CardTitle>
          {order.client && (
            <CardSubtitle>
              {order.client.fullName}
              <br />
              {order.client.documentType} {order.client.documentNumber}
              <br />
              {order.client.clientType}
            </CardSubtitle>
          )}
          <p className={styles.note}>
            Consultá la ficha del cliente para ver teléfono y demás datos de
            contacto.
          </p>
        </Card>

        <Card>
          <CardTitle>Dirección</CardTitle>
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
            {order.deliveryAddress.postalCode
              ? ` (${order.deliveryAddress.postalCode})`
              : ''}
          </CardSubtitle>
          {order.deliveryAddress.references && (
            <p className={styles.note}>
              <strong>Referencias:</strong> {order.deliveryAddress.references}
            </p>
          )}
          {order.customerNote && (
            <p className={styles.note}>
              <strong>Nota:</strong> {order.customerNote}
            </p>
          )}
          {order.zona && (
            <p className={styles.note}>
              <strong>Zona:</strong> {order.zona}
            </p>
          )}
        </Card>

        <Card>
          <CardTitle>Repartidor</CardTitle>
          <CardSubtitle>
            {order.assignedToName ?? (order.status === 'PENDING'
              ? 'Disponible en el pool'
              : 'Sin asignar')}
          </CardSubtitle>
          {order.assignedAt && (
            <p className={styles.note}>
              Asignado el {formatDateTime(order.assignedAt)}
            </p>
          )}
        </Card>

        <Card>
          <CardTitle>Total</CardTitle>
          <CardSubtitle>{formatMinorAsARS(order.totalFinalMinor)}</CardSubtitle>
          {order.totalBaseMinor !== order.totalFinalMinor && (
            <p className={styles.note}>
              Base {formatMinorAsARS(order.totalBaseMinor)}
            </p>
          )}
          <p className={styles.note}>
            Cuenta corriente: ver módulo Cuentas corrientes
          </p>
        </Card>
      </div>

      <Card>
        <CardTitle>Productos</CardTitle>
        <ul className={styles.list}>
          {order.items.map((item) => (
            <li key={item.productId} className={styles.row}>
              <div>
                <span className={styles.productName}>{item.productName}</span>{' '}
                <span className={styles.qty}>× {item.quantity}</span>
              </div>
              <div className={styles.rowMeta}>
                {item.adjustmentPercentage !== 0 && (
                  <span>
                    base {formatMinorAsARS(item.unitBasePriceMinor)} ·{' '}
                    {item.adjustmentPercentage > 0 ? '+' : ''}
                    {item.adjustmentPercentage}%
                  </span>
                )}
                <span>final {formatMinorAsARS(item.subtotalFinalMinor)}</span>
              </div>
            </li>
          ))}
        </ul>
      </Card>

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
            <strong>Motivo:</strong> {order.cancellationReason}
          </p>
        )}
      </Card>

      <div className={styles.actions}>
        <Link to="/admin/pedidos">
          <Button variant="ghost">← Volver al listado</Button>
        </Link>
        {canCancel && (
          <Button variant="danger" onClick={() => setCancelOpen(true)}>
            Cancelar pedido
          </Button>
        )}
      </div>

      {cancelOpen && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <h3>Cancelar pedido</h3>
            <p>
              Vas a cancelar el pedido y revertir el cargo en la cuenta
              corriente.
            </p>
            <label htmlFor="cancelReason" className={styles.label}>
              Motivo (obligatorio)
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
                disabled={!cancelReason.trim()}
                onClick={handleCancel}
              >
                Sí, cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}