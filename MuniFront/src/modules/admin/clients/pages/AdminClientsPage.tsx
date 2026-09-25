import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { Spinner } from '@/components/Spinner/Spinner';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import {
  AdminListHeading,
  AdminListLayout,
} from '@/shared/layouts/AdminListLayout';
import { ClientFilters } from '../components/ClientFilters';
import {
  buildFiltersFromQuery,
  filtersToSearchParams,
  parseFiltersFromSearchParams,
} from '../components/ClientFilters.helpers';
import { ClientsTable } from '../components/ClientsTable';
import { ClientsCards } from '../components/ClientsCards';
import { ClientsPagination } from '../components/ClientsPagination';
import { useClients } from '../hooks/useClients';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import type { ClientListFilters } from '../types/clients.types';
import styles from './AdminClientsPage.module.css';

const DEFAULT_LIMIT = 20;

const DEFAULT_FILTERS: Partial<ClientListFilters> = {
  page: 1,
  limit: DEFAULT_LIMIT,
  sortBy: 'lastName',
  sortOrder: 'asc',
};

function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 900px)').matches;
}

export function AdminClientsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobile] = useState(() => isMobileViewport());

  const filters = useMemo<Partial<ClientListFilters>>(
    () => ({
      ...DEFAULT_FILTERS,
      ...parseFiltersFromSearchParams(searchParams),
    }),
    [searchParams],
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useClients(filters);

  const filterValues = useMemo(() => buildFiltersFromQuery(filters), [filters]);

  const updateFilters = useCallback(
    (next: Partial<ClientListFilters>) => {
      const merged: Partial<ClientListFilters> = { ...filters, ...next };
      setSearchParams(filtersToSearchParams(merged), { replace: true });
    },
    [filters, setSearchParams],
  );

  const handleApply = (next: ReturnType<typeof buildFiltersFromQuery>) => {
    updateFilters({
      page: 1,
      search: next.search || undefined,
      clientType: next.clientType,
      active: next.active,
    });
  };

  const handleReset = () => {
    setSearchParams(
      filtersToSearchParams({
        page: 1,
        limit: DEFAULT_LIMIT,
        sortBy: 'lastName',
        sortOrder: 'asc',
      }),
      { replace: true },
    );
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  useScrollRestoration({
    storageKey: 'admin-clients-list-scroll',
    ready: !isLoading && !!data,
  });

  return (
    <AdminListLayout
      toolbar={
        <>
          <AdminListHeading
            title="Clientes"
            description="Administre los clientes registrados del servicio municipal."
            action={
              <Link to="/admin/clientes/nuevo">
                <Button>+ Nuevo cliente</Button>
              </Link>
            }
          />
          <ClientFilters
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
            <Spinner label="Cargando clientes..." />
          </div>
        ) : isError ? (
          <ErrorState
            title="No pudimos cargar los clientes"
            description={error instanceof Error ? error.message : 'Intente nuevamente.'}
            onRetry={() => refetch()}
          />
        ) : data && data.items.length === 0 ? (
          <EmptyState
            title="Aún no hay clientes"
            description="Comience registrando el primer cliente del padrón municipal."
            action={
              <Link to="/admin/clientes/nuevo">
                <Button>+ Nuevo cliente</Button>
              </Link>
            }
          />
        ) : data ? (
          <>
            {mobile ? (
              <ClientsCards items={data.items} />
            ) : (
              <ClientsTable items={data.items} />
            )}
            <ClientsPagination
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
