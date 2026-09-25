import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { Spinner } from '@/components/Spinner/Spinner';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import {
  AdminListHeading,
  AdminListLayout,
} from '@/shared/layouts/AdminListLayout';
import { PricingRuleFilters } from '../components/PricingRuleFilters';
import { buildPricingRuleFiltersFromQuery } from '../components/PricingRuleFilters.helpers';
import { PricingRulesTable } from '../components/PricingRulesTable';
import { PricingRulesPagination } from '../components/PricingRulesPagination';
import { usePricingRules } from '../hooks/usePricingRules';
import { useAuth } from '@/hooks/auth-context';
import type { PricingRuleListFilters } from '../types/pricing-rules.types';
import styles from './AdminPricingRulesPage.module.css';

const DEFAULT_LIMIT = 20;

export function AdminPricingRulesPage() {
  const { user } = useAuth();
  const canManage = user?.permissions.includes('pricing.manage') ?? false;

  const [filters, setFilters] = useState<Partial<PricingRuleListFilters>>({
    page: 1,
    limit: DEFAULT_LIMIT,
    sortBy: 'priority',
    sortOrder: 'desc',
  });

  const { data, isLoading, isError, error, refetch, isFetching } =
    usePricingRules(filters);

  const filterValues = useMemo(
    () => buildPricingRuleFiltersFromQuery(filters),
    [filters],
  );

  const handleApply = (next: ReturnType<typeof buildPricingRuleFiltersFromQuery>) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      clientType: next.clientType || undefined,
      scope: next.scope || undefined,
      active: next.active === 'all' ? undefined : next.active === 'true',
    }));
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      limit: DEFAULT_LIMIT,
      sortBy: 'priority',
      sortOrder: 'desc',
    });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <AdminListLayout
      toolbar={
        <>
          <AdminListHeading
            title="Reglas de precios"
            description="Administre los descuentos y recargos por tipo de cliente."
            action={
              canManage ? (
                <Link to="/admin/reglas-precio/nueva">
                  <Button>+ Nueva regla</Button>
                </Link>
              ) : undefined
            }
          />
          <PricingRuleFilters
            initial={filterValues}
            onApply={handleApply}
            onReset={handleReset}
          />
        </>
      }
    >
      <Card>
        {isLoading ? (
          <div className={styles.loading}>
            <Spinner label="Cargando reglas..." />
          </div>
        ) : isError ? (
          <ErrorState
            title="No pudimos cargar las reglas"
            description={error instanceof Error ? error.message : 'Intente nuevamente.'}
            onRetry={() => refetch()}
          />
        ) : data && data.items.length === 0 ? (
          <EmptyState
            title="Aún no hay reglas"
            description="Comience creando la primera regla comercial."
            action={
              canManage ? (
                <Link to="/admin/reglas-precio/nueva">
                  <Button>+ Nueva regla</Button>
                </Link>
              ) : undefined
            }
          />
        ) : data ? (
          <>
            <PricingRulesTable items={data.items} />
            <PricingRulesPagination
              pagination={data.pagination}
              onPageChange={handlePageChange}
            />
          </>
        ) : null}

        {isFetching && !isLoading && (
          <div className={styles.fetchingHint}>Actualizando...</div>
        )}
      </Card>
    </AdminListLayout>
  );
}
