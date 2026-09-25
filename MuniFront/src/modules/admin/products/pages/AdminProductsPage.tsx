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
import { ProductFilters } from '../components/ProductFilters';
import { buildProductFiltersFromQuery } from '../components/ProductFilters.helpers';
import { ProductsTable } from '../components/ProductsTable';
import { ProductsCards } from '../components/ProductsCards';
import { ProductsPagination } from '../components/ProductsPagination';
import { useProducts } from '../hooks/useProducts';
import type { ProductListFilters } from '../types/products.types';
import styles from './AdminProductsPage.module.css';

const DEFAULT_LIMIT = 20;

function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 900px)').matches;
}

export function AdminProductsPage() {
  const [filters, setFilters] = useState<Partial<ProductListFilters>>({
    page: 1,
    limit: DEFAULT_LIMIT,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [mobile] = useState(() => isMobileViewport());

  const { data, isLoading, isError, error, refetch, isFetching } = useProducts(filters);

  const filterValues = useMemo(() => buildProductFiltersFromQuery(filters), [filters]);

  const handleApply = (next: ReturnType<typeof buildProductFiltersFromQuery>) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      search: next.search || undefined,
      productType: next.productType || undefined,
      active: next.active === 'all' ? undefined : next.active === 'true',
    }));
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      limit: DEFAULT_LIMIT,
      sortBy: 'name',
      sortOrder: 'asc',
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
            title="Productos"
            description="Administre el catálogo de productos y servicios municipales."
            action={
              <Link to="/admin/productos/nuevo">
                <Button>+ Nuevo producto</Button>
              </Link>
            }
          />
          <ProductFilters
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
            <Spinner label="Cargando productos..." />
          </div>
        ) : isError ? (
          <ErrorState
            title="No pudimos cargar los productos"
            description={error instanceof Error ? error.message : 'Intente nuevamente.'}
            onRetry={() => refetch()}
          />
        ) : data && data.items.length === 0 ? (
          <EmptyState
            title="Aún no hay productos"
            description="Comience registrando el primer producto del catálogo municipal."
            action={
              <Link to="/admin/productos/nuevo">
                <Button>+ Nuevo producto</Button>
              </Link>
            }
          />
        ) : data ? (
          <>
            {mobile ? (
              <ProductsCards items={data.items} />
            ) : (
              <ProductsTable items={data.items} />
            )}
            <ProductsPagination
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
