import { useMemo, useState } from 'react';
import { Card } from '@/components/Card/Card';
import { Spinner } from '@/components/Spinner/Spinner';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import {
  AdminListHeading,
  AdminListLayout,
} from '@/shared/layouts/AdminListLayout';
import { AccountFilters } from '../components/AccountFilters';
import { buildAccountFiltersFromQuery } from '../components/AccountFilters.helpers';
import { AccountsTable } from '../components/AccountsTable';
import { AccountsCards } from '../components/AccountsCards';
import { AccountsPagination } from '../components/AccountsPagination';
import { useAccounts } from '../hooks/useAccounts';
import type { AccountListFilters } from '../types/accounts.types';
import styles from './AdminAccountsPage.module.css';

const DEFAULT_LIMIT = 20;

function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 900px)').matches;
}

export function AdminAccountsPage() {
  const [filters, setFilters] = useState<Partial<AccountListFilters>>({
    page: 1,
    limit: DEFAULT_LIMIT,
  });
  const [mobile] = useState(() => isMobileViewport());

  const { data, isLoading, isError, error, refetch, isFetching } = useAccounts(filters);

  const filterValues = useMemo(() => buildAccountFiltersFromQuery(filters), [filters]);

  const handleApply = (next: ReturnType<typeof buildAccountFiltersFromQuery>) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      search: next.search || undefined,
      clientType: next.clientType,
      clientActive: next.clientActive,
      balanceStatus: next.balanceStatus,
    }));
  };

  const handleReset = () => {
    setFilters({ page: 1, limit: DEFAULT_LIMIT });
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <AdminListLayout
      toolbar={
        <>
          <AdminListHeading
            title="Cuentas corrientes"
            description="Saldos y movimientos de los clientes registrados. El saldo se calcula desde el libro contable (ledger), no se almacena en el cliente."
          />
          <AccountFilters
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
            <Spinner label="Cargando cuentas..." />
          </div>
        ) : isError ? (
          <ErrorState
            title="No pudimos cargar las cuentas"
            description={error instanceof Error ? error.message : 'Intente nuevamente.'}
            onRetry={() => refetch()}
          />
        ) : data && data.items.length === 0 ? (
          <EmptyState
            title="Sin cuentas para mostrar"
            description="Ajusta los filtros para ver otras cuentas corrientes."
          />
        ) : data ? (
          <>
            {mobile ? (
              <AccountsCards items={data.items} />
            ) : (
              <AccountsTable items={data.items} />
            )}
            <AccountsPagination
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
