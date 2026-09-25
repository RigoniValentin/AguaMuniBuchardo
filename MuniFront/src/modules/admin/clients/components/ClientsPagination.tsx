import { Button } from '@/components/Button/Button';
import type { ClientPagination } from '../types/clients.types';
import styles from './ClientsPagination.module.css';

interface ClientsPaginationProps {
  pagination: ClientPagination;
  onPageChange: (page: number) => void;
}

export function ClientsPagination({ pagination, onPageChange }: ClientsPaginationProps) {
  const { page, pages, total, limit } = pagination;
  if (total <= limit && pages <= 1) {
    return (
      <div className={styles.summary}>
        {total === 0 ? 'Sin resultados' : `Mostrando ${total} resultado${total === 1 ? '' : 's'}`}
      </div>
    );
  }

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className={styles.wrap}>
      <span className={styles.summary}>
        Mostrando {from}-{to} de {total}
      </span>
      <div className={styles.controls}>
        <Button
          variant="ghost"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <span className={styles.pageInfo}>
          Página {page} de {pages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
