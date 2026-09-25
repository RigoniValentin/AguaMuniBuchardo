import { Input } from '@/components/Input/Input';
import { Button } from '@/components/Button/Button';
import { PRODUCT_TYPE_OPTIONS } from '../types/products.types';
import type { ProductFilterValues } from './ProductFilters.helpers';
import styles from './ProductFilters.module.css';

interface ProductFiltersProps {
  initial: ProductFilterValues;
  onApply: (values: ProductFilterValues) => void;
  onReset: () => void;
}

export function ProductFilters({ initial, onApply, onReset }: ProductFiltersProps) {
  return (
    <form
      className={styles.filters}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        onApply({
          search: String(fd.get('search') ?? ''),
          productType: (String(fd.get('productType') ?? '') || '') as ProductFilterValues['productType'],
          active: (String(fd.get('active') ?? 'all') || 'all') as ProductFilterValues['active'],
        });
      }}
    >
      <div className={styles.field} style={{ flex: '2 1 240px' }}>
        <Input
          label="Buscar"
          name="search"
          defaultValue={initial.search}
          placeholder="Código o nombre"
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="productType">Tipo</label>
        <select
          id="productType"
          name="productType"
          className={styles.select}
          defaultValue={initial.productType ?? ''}
        >
          <option value="">Todos</option>
          {PRODUCT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="active">Estado</label>
        <select
          id="active"
          name="active"
          className={styles.select}
          defaultValue={initial.active}
        >
          <option value="all">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>
      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onReset}>
          Limpiar
        </Button>
        <Button type="submit">Aplicar</Button>
      </div>
    </form>
  );
}
