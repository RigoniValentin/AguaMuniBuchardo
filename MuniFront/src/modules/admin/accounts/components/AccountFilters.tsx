import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '@/components/Input/Input';
import { Button } from '@/components/Button/Button';
import { CLIENT_TYPE_OPTIONS } from '@/modules/admin/clients/types/clients.types';
import {
  BALANCE_STATUS_FILTER_OPTIONS,
  CLIENT_ACTIVE_FILTER_OPTIONS,
  type AccountStatus,
  type ClientType,
} from '../types/accounts.types';
import styles from './AccountFilters.module.css';

export interface AccountFiltersValue {
  search: string;
  clientType?: ClientType;
  clientActive?: boolean;
  balanceStatus?: AccountStatus;
}

interface AccountFiltersProps {
  initial: AccountFiltersValue;
  onApply: (next: AccountFiltersValue) => void;
  onReset: () => void;
}

export function AccountFilters({ initial, onApply, onReset }: AccountFiltersProps) {
  const [search, setSearch] = useState(initial.search);
  const [clientType, setClientType] = useState<ClientType | ''>(initial.clientType ?? '');
  const [clientActive, setClientActive] = useState<'all' | 'active' | 'inactive'>(
    initial.clientActive === undefined
      ? 'all'
      : initial.clientActive
        ? 'active'
        : 'inactive',
  );
  const [balanceStatus, setBalanceStatus] = useState<AccountStatus | ''>(
    initial.balanceStatus ?? '',
  );

  useEffect(() => {
    setSearch(initial.search);
    setClientType(initial.clientType ?? '');
    setClientActive(
      initial.clientActive === undefined
        ? 'all'
        : initial.clientActive
          ? 'active'
          : 'inactive',
    );
    setBalanceStatus(initial.balanceStatus ?? '');
  }, [initial]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: AccountFiltersValue = {
      search: search.trim(),
    };
    if (clientType) next.clientType = clientType as ClientType;
    if (clientActive !== 'all') next.clientActive = clientActive === 'active';
    if (balanceStatus) next.balanceStatus = balanceStatus as AccountStatus;
    onApply(next);
  };

  const handleReset = () => {
    setSearch('');
    setClientType('');
    setClientActive('all');
    setBalanceStatus('');
    onReset();
  };

  return (
    <form className={styles.filters} onSubmit={handleSubmit}>
      <div className={styles.search}>
        <Input
          label="Buscar"
          placeholder="Nombre, apellido, documento o calle"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="account-filter-clientType">
          Tipo de cliente
        </label>
        <select
          id="account-filter-clientType"
          className={styles.select}
          value={clientType}
          onChange={(e) => setClientType(e.target.value as ClientType | '')}
        >
          <option value="">Todos</option>
          {CLIENT_TYPE_OPTIONS.map((opt: { value: ClientType; label: string }) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="account-filter-status">
          Estado de cuenta
        </label>
        <select
          id="account-filter-status"
          className={styles.select}
          value={balanceStatus}
          onChange={(e) => setBalanceStatus(e.target.value as AccountStatus | '')}
        >
          {BALANCE_STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="account-filter-active">
          Estado del cliente
        </label>
        <select
          id="account-filter-active"
          className={styles.select}
          value={clientActive}
          onChange={(e) =>
            setClientActive(e.target.value as 'all' | 'active' | 'inactive')
          }
        >
          {CLIENT_ACTIVE_FILTER_OPTIONS.map((opt) => (
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
        <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
          Limpiar
        </Button>
      </div>
    </form>
  );
}
