import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '@/components/Input/Input';
import { Button } from '@/components/Button/Button';
import {
  CLIENT_TYPE_OPTIONS,
  type ClientType,
} from '../types/clients.types';
import type { ClientFiltersValue } from './ClientFilters.helpers';
import styles from './ClientFilters.module.css';

interface ClientFiltersProps {
  initial: ClientFiltersValue;
  onApply: (next: ClientFiltersValue) => void;
  onReset: () => void;
}

export function ClientFilters({ initial, onApply, onReset }: ClientFiltersProps) {
  const [search, setSearch] = useState(initial.search);
  const [clientType, setClientType] = useState<ClientType | ''>(
    initial.clientType ?? '',
  );
  const [active, setActive] = useState<'all' | 'active' | 'inactive'>(
    initial.active === undefined ? 'all' : initial.active ? 'active' : 'inactive',
  );

  useEffect(() => {
    setSearch(initial.search);
    setClientType(initial.clientType ?? '');
    setActive(
      initial.active === undefined ? 'all' : initial.active ? 'active' : 'inactive',
    );
  }, [initial]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: ClientFiltersValue = {
      search: search.trim(),
      ...(clientType ? { clientType: clientType as ClientType } : {}),
      ...(active === 'all' ? {} : { active: active === 'active' }),
    };
    onApply(next);
  };

  const handleReset = () => {
    setSearch('');
    setClientType('');
    setActive('all');
    onReset();
  };

  return (
    <form className={styles.filters} onSubmit={handleSubmit}>
      <div className={styles.search}>
        <Input
          label="Buscar"
          placeholder="Nombre, documento, teléfono o calle"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="filter-clientType">
          Tipo de cliente
        </label>
        <select
          id="filter-clientType"
          className={styles.select}
          value={clientType}
          onChange={(e) => setClientType(e.target.value as ClientType | '')}
        >
          <option value="">Todos</option>
          {CLIENT_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="filter-active">
          Estado
        </label>
        <select
          id="filter-active"
          className={styles.select}
          value={active}
          onChange={(e) => setActive(e.target.value as 'all' | 'active' | 'inactive')}
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
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
