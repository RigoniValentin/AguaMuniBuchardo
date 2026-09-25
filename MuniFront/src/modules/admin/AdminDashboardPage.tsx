import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { Spinner } from '@/components/Spinner/Spinner';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Badge } from '@/components/Badge/Badge';
import { ordersApi } from '@/modules/orders/services/orders.api';
import { paymentsApi } from '@/modules/payments/services/payments.api';
import { useAuth } from '@/hooks/auth-context';
import type { Permission } from '@/types/auth';
import styles from './AdminDashboardPage.module.css';

interface QuickLink {
  to: string;
  label: string;
  description: string;
  permission?: Permission;
}

const QUICK_LINKS: QuickLink[] = [
  {
    to: '/admin/pedidos',
    label: 'Pedidos',
    description: 'Hacé seguimiento de los pedidos en curso.',
    permission: 'orders.read',
  },
  {
    to: '/admin/pagos',
    label: 'Pagos',
    description: 'Aprobá o rechazá los comprobantes recibidos.',
    permission: 'payments.read',
  },
  {
    to: '/admin/clientes',
    label: 'Clientes',
    description: 'Gestioná los clientes del padrón municipal.',
    permission: 'clients.read',
  },
  {
    to: '/admin/cuentas-corrientes',
    label: 'Cuentas corrientes',
    description: 'Saldos, cargos, créditos y ajustes.',
    permission: 'accounts.read',
  },
];

export function AdminDashboardPage() {
  const { user } = useAuth();
  const userPerms = user?.permissions ?? [];

  // Show pending counters only when we have a chance of succeeding (i.e.
  // the user has the relevant read permission). The list endpoint returns
  // pagination.total, which is enough for a "pending: N" badge.
  const canSeeOrders = userPerms.includes('orders.read');
  const canSeePayments = userPerms.includes('payments.read');

  const pendingOrdersQuery = useQuery({
    queryKey: ['admin-dashboard', 'pending-orders'],
    // Pedidos que todavía no se entregaron ni se cancelaron: cubren el
    // ciclo CONFIRMED → PENDING → ASSIGNED → OUT_FOR_DELIVERY.
    queryFn: () =>
      ordersApi.listOrders({ status: 'PENDING', limit: 1, page: 1 }),
    enabled: canSeeOrders,
    staleTime: 30_000,
    retry: false,
  });

  const pendingPaymentsQuery = useQuery({
    queryKey: ['admin-dashboard', 'pending-payments'],
    queryFn: () => paymentsApi.list({ status: 'PENDING', limit: 1, page: 1 }),
    enabled: canSeePayments,
    staleTime: 30_000,
    retry: false,
  });

  const visibleLinks = QUICK_LINKS.filter(
    (link) => !link.permission || userPerms.includes(link.permission),
  );

  const pendingOrdersCount = pendingOrdersQuery.data?.pagination.total ?? null;
  const pendingPaymentsCount = pendingPaymentsQuery.data?.pagination.total ?? null;

  const countersError =
    (pendingOrdersQuery.isError && pendingPaymentsQuery.isError) ||
    (canSeeOrders && pendingOrdersQuery.isError) ||
    (canSeePayments && pendingPaymentsQuery.isError);

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <h1>Bienvenido/a{user ? `, ${user.firstName}` : ''}</h1>
        <p>Resumen rápido y accesos directos a los módulos principales.</p>
      </header>

      <section className={styles.kpis} aria-label="Pendientes">
        {canSeeOrders && (
          <Card>
            <CardSubtitle>Pedidos pendientes</CardSubtitle>
            {pendingOrdersQuery.isLoading ? (
              <div className={styles.kpiSpinner}>
                <Spinner size="sm" />
              </div>
            ) : pendingOrdersQuery.isError ? (
              <p className={styles.kpiMuted}>—</p>
            ) : (
              <CardTitle>
                <span className={styles.kpiValue}>{pendingOrdersCount ?? 0}</span>
                {pendingOrdersCount !== null && pendingOrdersCount > 0 && (
                  <Badge tone="warning">En el pool</Badge>
                )}
              </CardTitle>
            )}
            <Link to="/admin/pedidos" className={styles.kpiLink}>
              Ir a Pedidos →
            </Link>
          </Card>
        )}
        {canSeePayments && (
          <Card>
            <CardSubtitle>Pagos por revisar</CardSubtitle>
            {pendingPaymentsQuery.isLoading ? (
              <div className={styles.kpiSpinner}>
                <Spinner size="sm" />
              </div>
            ) : pendingPaymentsQuery.isError ? (
              <p className={styles.kpiMuted}>—</p>
            ) : (
              <CardTitle>
                <span className={styles.kpiValue}>{pendingPaymentsCount ?? 0}</span>
                {pendingPaymentsCount !== null && pendingPaymentsCount > 0 && (
                  <Badge tone="warning">Pendientes</Badge>
                )}
              </CardTitle>
            )}
            <Link to="/admin/pagos" className={styles.kpiLink}>
              Ir a Pagos →
            </Link>
          </Card>
        )}
      </section>

      {countersError && (
        <ErrorState
          title="No pudimos cargar los pendientes"
          description="Intente nuevamente."
          onRetry={() => {
            void pendingOrdersQuery.refetch();
            void pendingPaymentsQuery.refetch();
          }}
        />
      )}

      <section className={styles.modules}>
        {visibleLinks.map((link) => (
          <Link key={link.to} to={link.to} className={styles.moduleLink}>
            <Card>
              <CardTitle>{link.label}</CardTitle>
              <CardSubtitle>{link.description}</CardSubtitle>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
