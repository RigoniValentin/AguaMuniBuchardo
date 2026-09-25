import { Button } from '@/components/Button/Button';
import {
  CLIENT_TYPE_OPTIONS,
  PRICING_SCOPE_OPTIONS,
} from '../types/pricing-rules.types';
import type { PricingRuleFilterValues } from './PricingRuleFilters.helpers';
import styles from './PricingRuleFilters.module.css';

interface PricingRuleFiltersProps {
  initial: PricingRuleFilterValues;
  onApply: (values: PricingRuleFilterValues) => void;
  onReset: () => void;
}

export function PricingRuleFilters({
  initial,
  onApply,
  onReset,
}: PricingRuleFiltersProps) {
  return (
    <form
      className={styles.filters}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        onApply({
          clientType: (String(fd.get('clientType') ?? '') || '') as PricingRuleFilterValues['clientType'],
          scope: (String(fd.get('scope') ?? '') || '') as PricingRuleFilterValues['scope'],
          active: (String(fd.get('active') ?? 'all') || 'all') as PricingRuleFilterValues['active'],
        });
      }}
    >
      <div className={styles.field}>
        <label className={styles.label} htmlFor="clientType">Tipo de cliente</label>
        <select
          id="clientType"
          name="clientType"
          className={styles.select}
          defaultValue={initial.clientType ?? ''}
        >
          <option value="">Todos</option>
          {CLIENT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="scope">Alcance</label>
        <select
          id="scope"
          name="scope"
          className={styles.select}
          defaultValue={initial.scope ?? ''}
        >
          <option value="">Todos</option>
          {PRICING_SCOPE_OPTIONS.map((opt) => (
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
          <option value="true">Activas</option>
          <option value="false">Inactivas</option>
        </select>
      </div>
      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onReset}>Limpiar</Button>
        <Button type="submit">Aplicar</Button>
      </div>
    </form>
  );
}
