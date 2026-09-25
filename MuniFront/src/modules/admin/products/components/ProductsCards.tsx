import { Link } from 'react-router-dom';
import { ProductTypeBadge } from './ProductTypeBadge';
import { ProductStatusBadge } from './ProductStatusBadge';
import { ProductPrice } from './ProductPrice';
import { Badge } from '@/components/Badge/Badge';
import type { Product } from '../types/products.types';
import styles from './ProductsCards.module.css';

interface ProductsCardsProps {
  items: Product[];
}

export function ProductsCards({ items }: ProductsCardsProps) {
  return (
    <div className={styles.cards}>
      {items.map((p) => (
        <article key={p.id} className={styles.card}>
          <header className={styles.cardHeader}>
            <div>
              <div className={styles.code}>{p.code}</div>
              <h3 className={styles.name}>{p.name}</h3>
            </div>
            <ProductTypeBadge value={p.productType} />
          </header>
          {p.description && <p className={styles.description}>{p.description}</p>}
          <div className={styles.row}>
            <span>Precio base</span>
            <ProductPrice basePriceMinor={p.basePriceMinor} />
          </div>
          <div className={styles.row}>
            <span>Stock</span>
            {p.tracksStock ? <Badge tone="info">Habilitado</Badge> : <span>No</span>}
          </div>
          <div className={styles.row}>
            <span>Estado</span>
            <ProductStatusBadge active={p.active} />
          </div>
          <div className={styles.actions}>
            <Link to={`/admin/productos/${p.id}/editar`} className={styles.viewLink}>
              Editar
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
