import { Link } from 'react-router-dom';
import { PricingRuleTarget } from './PricingRuleTarget';
import { PricingRuleStatusBadge } from './PricingRuleStatusBadge';
import { formatPercentage } from '@/shared/money';
import { CLIENT_TYPE_LABEL, type PricingRule } from '../types/pricing-rules.types';
import styles from './PricingRulesTable.module.css';

interface PricingRulesTableProps {
  items: PricingRule[];
}

export function PricingRulesTable({ items }: PricingRulesTableProps) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo de cliente</th>
            <th>Alcance</th>
            <th>Objetivo</th>
            <th>Ajuste</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th aria-label="Acciones" />
          </tr>
        </thead>
        <tbody>
          {items.map((r) => {
            const adjClass =
              r.adjustmentValue > 0
                ? styles.adjustmentPositive
                : r.adjustmentValue < 0
                  ? styles.adjustmentNegative
                  : styles.adjustmentZero;
            return (
              <tr key={r.id} className={styles.row}>
                <td data-label="Nombre">
                  <Link to={`/admin/reglas-precio/${r.id}/editar`}>
                    <strong>{r.name}</strong>
                  </Link>
                </td>
                <td data-label="Tipo de cliente">{CLIENT_TYPE_LABEL[r.clientType]}</td>
                <td data-label="Alcance">{r.scope}</td>
                <td data-label="Objetivo">
                  <PricingRuleTarget rule={r} />
                </td>
                <td data-label="Ajuste">
                  <span className={`${styles.adjustment} ${adjClass}`}>
                    {formatPercentage(r.adjustmentValue)}
                  </span>
                </td>
                <td data-label="Prioridad">{r.priority}</td>
                <td data-label="Estado">
                  <PricingRuleStatusBadge active={r.active} />
                </td>
                <td data-label="Acciones" className={styles.actions}>
                  <Link to={`/admin/reglas-precio/${r.id}/editar`} className={styles.viewLink}>
                    Editar
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
