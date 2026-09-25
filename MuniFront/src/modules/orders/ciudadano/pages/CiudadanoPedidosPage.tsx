import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { OrdersList } from '../../components/OrdersList';
import { useMyOrders } from '../../hooks/useOrders';
import { useCancelMyOrder } from '../../hooks/useOrderMutations';
import { Button } from '@/components/Button/Button';
import styles from './CiudadanoPedidosPage.module.css';

const DEFAULT_LIMIT = 20;

export function CiudadanoPedidosPage() {
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch, isFetching } = useMyOrders({
    page,
    limit: DEFAULT_LIMIT,
  });
  const cancelMutation = useCancelMyOrder();

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    await cancelMutation.mutateAsync({
      id: cancelTarget,
      payload: { reason: cancelReason || undefined },
    });
    setCancelTarget(null);
    setCancelReason('');
  };

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <h1>Mis pedidos</h1>
          <p>Revisá el estado de tus pedidos y el historial.</p>
        </div>
        <Button onClick={() => navigate('/ciudadano/pedidos/nuevo')}>
          Hacer pedido
        </Button>
      </header>

      <OrdersList
        title="Pedidos"
        subtitle="Mostrando tus pedidos confirmados, en curso y entregados."
        orders={data?.items}
        isLoading={isLoading}
        isError={isError}
        error={error}
        refetch={() => refetch()}
        isFetching={isFetching}
        pagination={data?.pagination}
        onPageChange={setPage}
        onCancel={(order) => setCancelTarget(order.id)}
        detailPathBuilder={(order) => `/ciudadano/pedidos/${order.id}`}
        showDeliveryAddress
      />

      {cancelTarget && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <Card>
            <CardTitle>Cancelar pedido</CardTitle>
            <CardSubtitle>
              Vamos a anular el pedido y devolver el cargo de tu cuenta
              corriente. ¿Querés continuar?
            </CardSubtitle>
            <label className={styles.label} htmlFor="cancelReason">
              Motivo (opcional)
            </label>
            <textarea
              id="cancelReason"
              className={styles.textarea}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Me equivoqué, etc."
              rows={3}
            />
            {cancelMutation.isError && (
              <div className={styles.error} role="alert">
                {(cancelMutation.error as { message?: string })?.message ??
                  'No se pudo cancelar el pedido'}
              </div>
            )}
            <div className={styles.modalActions}>
              <Button
                variant="ghost"
                onClick={() => {
                  setCancelTarget(null);
                  setCancelReason('');
                }}
              >
                Volver
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmCancel}
                loading={cancelMutation.isPending}
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
