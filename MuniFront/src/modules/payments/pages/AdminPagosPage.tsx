import { useState } from 'react';
import { Card } from '@/components/Card/Card';
import {
  AdminListHeading,
  AdminListLayout,
} from '@/shared/layouts/AdminListLayout';
import { PaymentsFilters } from '../components/PaymentsFilters';
import { PaymentsGrid } from '../components/PaymentsGrid';
import { usePayments } from '../hooks/usePayments';
import type { PaymentListFilters } from '../types/payments.types';

const DEFAULT_LIMIT = 20;

export function AdminPagosPage() {
  const [filters, setFilters] = useState<PaymentListFilters>({
    page: 1,
    limit: DEFAULT_LIMIT,
  });

  const { data, isLoading, isError, error, refetch, isFetching } =
    usePayments(filters);

  const handleApply = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
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
            title="Pagos"
            description="Revisá los pagos informados por los ciudadanos. La aprobación registra un movimiento de crédito en la cuenta corriente del cliente."
          />
          <PaymentsFilters
            value={filters}
            onChange={setFilters}
            onApply={handleApply}
            onReset={handleReset}
          />
        </>
      }
    >
      <Card>
        <PaymentsGrid
          items={data?.items}
          pagination={data?.pagination}
          isLoading={isLoading}
          isError={isError}
          error={error}
          isFetching={isFetching}
          refetch={() => refetch()}
          onPageChange={handlePageChange}
        />
      </Card>
    </AdminListLayout>
  );
}
