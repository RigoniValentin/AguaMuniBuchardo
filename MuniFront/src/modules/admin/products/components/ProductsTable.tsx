import { Link } from 'react-router-dom';
import { ProductTypeBadge } from './ProductTypeBadge';
import { ProductStatusBadge } from './ProductStatusBadge';
import { ProductPrice } from './ProductPrice';
import { Badge } from '@/components/Badge/Badge';
import type { Product } from '../types/products.types';
import styles from './ProductsTable.module.css';

interface ProductsTableProps {
  items: Product[];
}

export function ProductsTable({ items }: ProductsTableProps) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Precio base</th>
            <th>Stock</th>
            <th>Estado</th>
            <th aria-label="Acciones" />
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id} className={styles.row}>
              <td data-label="Código">
                <span className={styles.code}>{p.code}</span>
              </td>
              <td data-label="Nombre">
                <Link to={`/admin/productos/${p.id}/editar`}>
                  <strong>{p.name}</strong>
                </Link>
                {p.description && (
                  <div className={styles.muted}>{p.description}</div>
                )}
              </td>
              <td data-label="Tipo">
                <ProductTypeBadge value={p.productType} />
              </td>
              <td data-label="Precio base">
                <ProductPrice basePriceMinor={p.basePriceMinor} />
              </td>
              <td data-label="Stock">
                {p.tracksStock ? (
                  <Badge tone="info">Habilitado</Badge>
                ) : (
                  <span className={styles.muted}>No</span>
                )}
              </td>
              <td data-label="Estado">
                <ProductStatusBadge active={p.active} />
              </td>
              <td data-label="Acciones" className={styles.actions}>
                <Link to={`/admin/productos/${p.id}/editar`} className={styles.viewLink}>
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
