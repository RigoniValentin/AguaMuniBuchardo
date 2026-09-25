import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { OrdersList } from '../../components/OrdersList';
import { Button } from '@/components/Button/Button';
import { useMyDeliveries } from '../../hooks/useOrders';
import { useClaimOrder } from '../../hooks/useOrderMutations';
import { ApiError } from '@/services/api';
import styles from './RepartidorHomePage.module.css';

const DEFAULT_LIMIT = 50;

function formatTodayBanner(today: {
  weekdayLabel: string;
  zones: string[];
}) {
  if (today.zones.length === 0) {
    return {
      tone: 'off' as const,
      headline: `Hoy es ${today.weekdayLabel}`,
      zonesLabel: 'No reparte ninguna zona',
      hint:
        'No hay entregas programadas para hoy. Si necesitás registrar una, usá "Nueva entrega".',
    };
  }
  return {
    tone: 'on' as const,
    headline: `Hoy es ${today.weekdayLabel}`,
    zonesLabel: today.zones.join(' y '),
    hint:
      today.zones.length === 1
        ? `Tomá los pedidos pendientes de ${today.zones[0]} (y los de clientes sin zona asignada).`
        : `Tomá los pedidos pendientes de las zonas que reparten hoy.`,
  };
}

export function RepartidorHomePage() {
  const navigate = useNavigate();
  const [page] = useState(1);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useMyDeliveries({ page, limit: DEFAULT_LIMIT });
  const claimMutation = useClaimOrder();

  const items = useMemo(() => data?.items ?? [], [data]);
  const poolCount = items.filter((o) => o.status === 'PENDING').length;
  const assignedCount = items.filter((o) => o.status === 'ASSIGNED').length;
  const outCount = items.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;
  const banner = data?.today ? formatTodayBanner(data.today) : null;

  const handleClaim = async (order: { id: string }) => {
    try {
      await claimMutation.mutateAsync(order.id);
      navigate(`/repartidor/entregas/${order.id}`);
    } catch {
      // Mutation error is rendered below via claimMutation.error.
    }
  };

  const claimErrorMsg = (() => {
    if (!claimMutation.error) return null;
    if (claimMutation.error instanceof ApiError) return claimMutation.error.message;
    return 'No se pudo tomar el pedido';
  })();

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <h1>Repartos de hoy</h1>
        <p>
          Tomá los pedidos pendientes de tu zona o seguí con los tuyos en
          curso.
        </p>
      </header>

      {banner && (
        <div className={styles.todayBanner} data-tone={banner.tone}>
          <span className={styles.todayHeadline}>{banner.headline}</span>
          <span className={styles.todayZones}>Reparte: {banner.zonesLabel}</span>
          <span className={styles.todayHint}>{banner.hint}</span>
        </div>
      )}

      <div className={styles.summary}>
        <Card>
          <CardSubtitle>En el pool</CardSubtitle>
          <CardTitle>
            <span className={styles.bigNumber}>{poolCount}</span>
          </CardTitle>
        </Card>
        <Card>
          <CardSubtitle>Asignados</CardSubtitle>
          <CardTitle>
            <span className={styles.bigNumber}>{assignedCount}</span>
          </CardTitle>
        </Card>
        <Card>
          <CardSubtitle>En reparto</CardSubtitle>
          <CardTitle>
            <span className={styles.bigNumber}>{outCount}</span>
          </CardTitle>
        </Card>
      </div>

      <div className={styles.cta}>
        <Button size="lg" onClick={() => navigate('/repartidor/nueva-entrega')}>
          + Nueva entrega
        </Button>
      </div>

      {claimErrorMsg && (
        <div className={styles.error} role="alert">
          {claimErrorMsg}
        </div>
      )}

      <OrdersList
        title="Pedidos del día"
        subtitle="Pendientes del pool más tus pedidos en curso."
        orders={items}
        isLoading={isLoading}
        isError={isError}
        error={error}
        refetch={() => refetch()}
        isFetching={isFetching}
        pagination={data?.pagination}
        detailPathBuilder={(o) => `/repartidor/entregas/${o.id}`}
        onClaim={handleClaim}
        claimPendingId={
          claimMutation.isPending && claimMutation.variables
            ? claimMutation.variables
            : null
        }
        showClient
        showDeliveryAddress
        showZone
      />

      <p className={styles.emptyHint}>
        ¿No hay repartos?{' '}
        <Link to="/repartidor/nueva-entrega">Iniciá una entrega directa</Link>.
      </p>
    </div>
  );
}
