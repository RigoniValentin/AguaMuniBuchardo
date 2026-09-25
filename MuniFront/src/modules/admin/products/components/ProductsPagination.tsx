import { Button } from '@/components/Button/Button';
import type { ProductPagination } from '../types/products.types';
import styles from './ProductsPagination.module.css';

interface ProductsPaginationProps {
  pagination: ProductPagination;
  onPageChange: (page: number) => void;
}

export function ProductsPagination({ pagination, onPageChange }: ProductsPaginationProps) {
  const { page, total, pages } = pagination;
  if (total === 0) return null;
  return (
    <div className={styles.pagination}>
      <span className={styles.info}>
        Página {page} de {pages} — {total} producto{total === 1 ? '' : 's'}
      </span>
      <div className={styles.controls}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Anterior
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
