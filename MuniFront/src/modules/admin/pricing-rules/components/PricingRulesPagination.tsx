import { Button } from '@/components/Button/Button';

interface PricingRulesPaginationProps {
  pagination: { page: number; total: number; pages: number };
  onPageChange: (page: number) => void;
}

export function PricingRulesPagination({
  pagination,
  onPageChange,
}: PricingRulesPaginationProps) {
  const { page, total, pages } = pagination;
  if (total === 0) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, gap: 12, flexWrap: 'wrap' }}>
      <span style={{ color: 'var(--color-text-secondary, #475569)', fontSize: '0.85rem' }}>
        Página {page} de {pages} — {total} regla{total === 1 ? '' : 's'}
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        <Button variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Anterior
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= pages}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}
