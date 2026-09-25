import { useMemo, useState } from 'react';
import { OrdersList } from '../../components/OrdersList';
import { Input } from '@/components/Input/Input';
import { Card } from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';
import {
  AdminListHeading,
  AdminListLayout,
} from '@/shared/layouts/AdminListLayout';
import { useAdminOrders } from '../../hooks/useOrders';
import { useCancelOrderAdmin } from '../../hooks/useOrderMutations';
import { ApiError } from '@/services/api';
import {
  ORDER_STATUS_OPTIONS,
  ORDER_ORIGIN_OPTIONS,
  type AdminOrdersFilters,
  type Order,
  type OrderOrigin,
  type OrderStatus,
} from '../../types/orders.types';
import styles from './AdminPedidosPage.module.css';

const DEFAULT_LIMIT = 20;
const CLIENT_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Todos' },
  { value: 'LOCAL', label: 'Local' },
  { value: 'JUBILADO', label: 'Jubilado' },
  { value: 'NO_LOCAL', label: 'No local' },
  { value: 'AYUDA_SOCIAL', label: 'Ayuda social' },
];

export function AdminPedidosPage() {
  const [filters, setFilters] = useState<AdminOrdersFilters>({
    page: 1,
    limit: DEFAULT_LIMIT,
  });
  const [search, setSearch] = useState('');
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const cancelMutation = useCancelOrderAdmin();

  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminOrders(filters);

  const applyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      search: search.trim() || undefined,
      page: 1,
    }));
  };

  const handleReset = () => {
    setSearch('');
    setFilters({ page: 1, limit: DEFAULT_LIMIT });
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    if (!cancelReason.trim()) return;
    await cancelMutation.mutateAsync({
      id: cancelTarget.id,
      reason: cancelReason.trim(),
    });
    setCancelTarget(null);
    setCancelReason('');
  };

  const cancelError = cancelMutation.error;
  const cancelErrorMsg =
    cancelError instanceof ApiError
      ? cancelError.message
      : cancelError
        ? 'No se pudo cancelar el pedido'
        : null;

  const rows = useMemo(() => data?.items ?? [], [data]);

  return (
    <AdminListLayout
      toolbar={
        <>
          <AdminListHeading
            title="Pedidos"
            description="Hacé seguimiento de los pedidos. Los repartidores gestionan y reparten, y vos podés cancelar o consultar la cuenta corriente de cada cliente."
          />
          <div className={styles.filters}>
            <Input
              label="Buscar cliente"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre o documento"
            />
            <div className={styles.selectCol}>
              <label htmlFor="status" className={styles.label}>Estado</label>
              <select
                id="status"
                className={styles.select}
                value={filters.status ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setFilters((prev) => ({
                    ...prev,
                    status: v ? (v as OrderStatus | 'ALL') : undefined,
                    page: 1,
                  }));
                }}
              >
                {ORDER_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.selectCol}>
              <label htmlFor="origin" className={styles.label}>Origen</label>
              <select
                id="origin"
                className={styles.select}
                value={filters.origin ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setFilters((prev) => ({
                    ...prev,
                    origin: v ? (v as OrderOrigin) : undefined,
                    page: 1,
                  }));
                }}
              >
                {ORDER_ORIGIN_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.selectCol}>
              <label htmlFor="clientType" className={styles.label}>Tipo cliente</label>
              <select
                id="clientType"
                className={styles.select}
                value={filters.clientType ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setFilters((prev) => ({
                    ...prev,
                    clientType: v || undefined,
                    page: 1,
                  }));
                }}
              >
                {CLIENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.filterActions}>
              <Button onClick={applyFilters}>Aplicar</Button>
              <Button variant="ghost" onClick={handleReset}>
                Limpiar
              </Button>
            </div>
          </div>
        </>
      }
    >
      <Card>
        <OrdersList
          title="Listado"
          subtitle="Los pedidos más recientes aparecen primero."
          orders={rows}
          isLoading={isLoading}
          isError={isError}
          error={error}
          refetch={() => refetch()}
          isFetching={isFetching}
          pagination={data?.pagination}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          detailPathBuilder={(o) => `/admin/pedidos/${o.id}`}
          showClient
          showDriver
          showDeliveryAddress
        />
      </Card>

      {cancelTarget && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <h3>Cancelar pedido</h3>
            <p>
              Vas a cancelar el pedido de <strong>{cancelTarget.client?.fullName ?? cancelTarget.clientId}</strong>.
              Esta acción revierte el cargo en la cuenta corriente.
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
              required
            />
            {cancelErrorMsg && (
              <div className={styles.error} role="alert">{cancelErrorMsg}</div>
            )}
            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={() => setCancelTarget(null)}>
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
    </AdminListLayout>
  );
}
