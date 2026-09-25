import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import {
  DIRECTION_LABEL,
  type AccountMovement,
} from '../types/accounts.types';
import { formatMinorAsARS } from '@/shared/money';
import styles from './ReversalForm.module.css';

interface ReversalFormProps {
  movement: AccountMovement;
  onSubmit: (payload: { description: string }) => void;
  onCancel: () => void;
  submitting?: boolean;
}

export function ReversalForm({
  movement,
  onSubmit,
  onCancel,
  submitting,
}: ReversalFormProps) {
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDescription('');
    setError(null);
  }, [movement.id]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Ingrese un motivo de reversión.');
      return;
    }
    setError(null);
    onSubmit({ description: description.trim() });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Movimiento original</span>
          <span className={styles.summaryValue}>
            {DIRECTION_LABEL[movement.direction]} ·{' '}
            {formatMinorAsARS(movement.amountMinor)}
          </span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Descripción original</span>
          <span className={styles.summaryValue}>{movement.description}</span>
        </div>
      </div>

      <div className={styles.warning}>
        El movimiento original no se eliminará. Se generará un movimiento inverso
        para mantener la trazabilidad.
      </div>

      <Input
        label="Motivo de la reversión"
        placeholder="Ej. Se registró el monto incorrectamente"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Revirtiendo…' : 'Confirmar reversión'}
        </Button>
      </div>
    </form>
  );
}
