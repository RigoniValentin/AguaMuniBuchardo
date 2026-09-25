import { Input } from '@/components/Input/Input';
import { Button } from '@/components/Button/Button';
import {
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  type PaymentListFilters,
  type PaymentMethod,
  type PaymentStatus,
} from '../types/payments.types';
import styles from './PaymentsFilters.module.css';

export interface PaymentsFiltersProps {
  value: PaymentListFilters;
  onChange: (next: PaymentListFilters) => void;
  onApply: () => void;
  onReset: () => void;
}

export function PaymentsFilters({
  value,
  onChange,
  onApply,
  onReset,
}: PaymentsFiltersProps) {
  const handleSearchChange = (next: string) => {
    onChange({ ...value, search: next || undefined, page: 1 });
  };

  const handleStatusChange = (next: string) => {
    onChange({
      ...value,
      status: next ? (next as PaymentStatus) : undefined,
      page: 1,
    });
  };

  const handleMethodChange = (next: string) => {
    onChange({
      ...value,
      paymentMethod: next ? (next as PaymentMethod) : undefined,
      page: 1,
    });
  };

  return (
    <form
      className={styles.filters}
      onSubmit={(e) => {
        e.preventDefault();
        onApply();
      }}
    >
      <Input
        label="Buscar cliente"
        value={value.search ?? ''}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Nombre o documento"
      />
      <div className={styles.selectCol}>
        <label htmlFor="status" className={styles.label}>
          Estado
        </label>
        <select
          id="status"
          className={styles.select}
          value={value.status ?? ''}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          {PAYMENT_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.selectCol}>
        <label htmlFor="method" className={styles.label}>
          Método
        </label>
        <select
          id="method"
          className={styles.select}
          value={value.paymentMethod ?? ''}
          onChange={(e) => handleMethodChange(e.target.value)}
        >
          <option value="">Todos</option>
          {PAYMENT_METHOD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.actions}>
        <Button type="submit" size="sm">
          Aplicar
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          Limpiar
        </Button>
      </div>
    </form>
  );
}
