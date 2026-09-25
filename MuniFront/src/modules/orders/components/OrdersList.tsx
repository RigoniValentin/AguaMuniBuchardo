import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { Spinner } from '@/components/Spinner/Spinner';
import { formatMinorAsARS } from '@/shared/money';
import { formatDate } from '@/shared/date';
import { OrderStatusBadge } from './OrderStatusBadge';
import type { Order, OrderStatus } from '../types/orders.types';
import styles from './OrdersList.module.css';

const DEFAULT_LIMIT = 20;

export interface OrdersListProps {
  title: string;
  subtitle?: string;
  orders: Order[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
  isFetching: boolean;
  pagination?: { page: number; pages: number; total: number; limit: number };
  onPageChange?: (page: number) => void;
  onCancel?: (order: Order) => void;
  /**
   * Driver pool: surface a "Tomar pedido" button on PENDING rows. The
   * parent owns the claim mutation and progress UI; the list just calls.
   */
  onClaim?: (order: Order) => void;
  claimPendingId?: string | null;
  detailPathBuilder: (order: Order) => string;
  showClient?: boolean;
  showDriver?: boolean;
  showDeliveryAddress?: boolean;
  showZone?: boolean;
}

export function OrdersList(props: OrdersListProps) {
  const {
    title,
    subtitle,
    orders,
    isLoading,
    isError,
    refetch,
    isFetching,
    pagination,
    onPageChange,
    onCancel,
    onClaim,
    claimPendingId,
    detailPathBuilder,
    showClient,
    showDriver,
    showDeliveryAddress,
    showZone,
  } = props;

  const items = useMemo(() => orders ?? [], [orders]);

  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}

      {isLoading ? (
        <Spinner label="Cargando pedidos..." />
      ) : items.length === 0 ? (
        isError ? (
          <EmptyState
            title="No pudimos cargar los pedidos"
            description="Tuvimos un problema para obtener el listado. Reintentá en unos instantes."
            icon={<PackageIcon />}
            action={
              <Button
                variant="ghost"
                onClick={() => refetch()}
                leftIcon={<RefreshIcon />}
              >
                Reintentar
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="Sin pedidos"
            description="Cuando los clientes confirmen pedidos los vas a ver acá. Si aplicaste filtros, probá ajustarlos o limpiarlos para ampliar la búsqueda."
            icon={<PackageIcon />}
          />
        )
      ) : (
        <>
          <ul className={styles.list}>
            {items.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                detailPath={detailPathBuilder(order)}
                onCancel={onCancel}
                onClaim={onClaim}
                claimPending={claimPendingId === order.id}
                showClient={showClient}
                showDriver={showDriver}
                showDeliveryAddress={showDeliveryAddress}
                showZone={showZone}
              />
            ))}
          </ul>
          {pagination && onPageChange && (
            <Pagination
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}

      {isFetching && !isLoading && (
        <div className={styles.fetchingHint}>Actualizando...</div>
      )}
    </Card>
  );
}

function OrderRow({
  order,
  detailPath,
  onCancel,
  onClaim,
  claimPending,
  showClient,
  showDriver,
  showDeliveryAddress,
  showZone,
}: {
  order: Order;
  detailPath: string;
  onCancel?: (order: Order) => void;
  onClaim?: (order: Order) => void;
  claimPending?: boolean;
  showClient?: boolean;
  showDriver?: boolean;
  showDeliveryAddress?: boolean;
  showZone?: boolean;
}) {
  const summary = order.items
    .map((i) => `${i.quantity}× ${i.productName}`)
    .slice(0, 3)
    .join(', ');
  const extra = order.items.length > 3 ? ` +${order.items.length - 3}` : '';

  return (
    <li className={styles.item}>
      <Link to={detailPath} className={styles.itemLink}>
        <div className={styles.headRow}>
          <span className={styles.total}>
            {formatMinorAsARS(order.totalFinalMinor)}
          </span>
          <OrderStatusBadge status={order.status as OrderStatus} />
        </div>
        <div className={styles.metaRow}>{summary}{extra}</div>
        <div className={styles.subRow}>
          <span>{formatDate(order.createdAt)}</span>
          {showClient && order.client && (
            <>
              <span className={styles.dot}>·</span>
              <span>{order.client.fullName}</span>
            </>
          )}
          {showDriver && order.assignedToName && (
            <>
              <span className={styles.dot}>·</span>
              <span>Repartidor: {order.assignedToName}</span>
            </>
          )}
          {showDeliveryAddress && (
            <>
              <span className={styles.dot}>·</span>
              <span>
                {order.deliveryAddress.street} {order.deliveryAddress.number}
              </span>
            </>
          )}
          {showZone && (
            <>
              <span className={styles.dot}>·</span>
              <span className={styles.zone}>
                {order.zona ?? 'Sin zona'}
              </span>
            </>
          )}
        </div>
      </Link>
      {onCancel && (order.status === 'CONFIRMED' || order.status === 'PENDING') && (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCancel(order);
            }}
          >
            Cancelar pedido
          </button>
        </div>
      )}
      {onClaim && order.status === 'PENDING' && (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.claimBtn}
            disabled={claimPending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClaim(order);
            }}
          >
            {claimPending ? 'Tomando…' : 'Tomar pedido'}
          </button>
        </div>
      )}
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
  if (pages <= 1) {
    return (
      <div className={styles.summary}>
        Mostrando {total} resultado{total === 1 ? '' : 's'}
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
        <button
          type="button"
          className={styles.pageBtn}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </button>
        <span className={styles.pageInfo}>
          Página {page} de {pages}
        </span>
        <button
          type="button"
          className={styles.pageBtn}
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

// Avoid unused-import warnings
void DEFAULT_LIMIT;

function PackageIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 7.5 12 3l9 4.5L12 12 3 7.5Z" />
      <path d="M3 7.5V16.5L12 21" />
      <path d="M21 7.5V16.5L12 21" />
      <path d="M12 12V21" />
      <path d="M7.5 5.25 16.5 9.75" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
