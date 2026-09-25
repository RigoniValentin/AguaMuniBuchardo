import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import {
  formatMinorAsARS,
  parseArsToMinor,
  toMajorUnits,
} from '@/shared/money';
import type { Direction } from '../types/accounts.types';
import styles from './AdjustmentForm.module.css';

interface AdjustmentFormProps {
  onSubmit: (payload: {
    direction: Direction;
    amountMinor: number;
    description: string;
  }) => void;
  onCancel: () => void;
  submitting?: boolean;
}

type Kind = 'DEBIT' | 'CREDIT';

const KIND_OPTIONS: Array<{ value: Kind; label: string; help: string }> = [
  {
    value: 'DEBIT',
    label: 'Agregar deuda',
    help: 'Incrementa lo que el cliente debe.',
  },
  {
    value: 'CREDIT',
    label: 'Agregar crédito',
    help: 'Reduce la deuda o genera saldo a favor.',
  },
];

export function AdjustmentForm({
  onSubmit,
  onCancel,
  submitting,
}: AdjustmentFormProps) {
  const [kind, setKind] = useState<Kind>('DEBIT');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setKind('DEBIT');
    setAmount('');
    setDescription('');
    setError(null);
  }, []);

  const parsedMinor = parseArsToMinor(amount);
  const preview = Number.isFinite(parsedMinor)
    ? formatMinorAsARS(parsedMinor)
    : '—';

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Ingrese un motivo / descripción.');
      return;
    }
    if (!Number.isFinite(parsedMinor) || parsedMinor <= 0) {
      setError('Ingrese un monto mayor a 0.');
      return;
    }
    setError(null);
    onSubmit({
      direction: kind,
      amountMinor: parsedMinor,
      description: description.trim(),
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Tipo de ajuste</legend>
        <div className={styles.kindRow}>
          {KIND_OPTIONS.map((opt) => (
            <label key={opt.value} className={styles.kindOption}>
              <input
                type="radio"
                name="kind"
                value={opt.value}
                checked={kind === opt.value}
                onChange={() => setKind(opt.value)}
              />
              <span className={styles.kindLabel}>{opt.label}</span>
              <span className={styles.kindHelp}>{opt.help}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Input
        label="Monto (ARS)"
        placeholder="0,00"
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <Input
        label="Motivo / descripción"
        placeholder="Ej. Saldo inicial pendiente"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className={styles.preview}>
        <span className={styles.previewLabel}>Resumen</span>
        <span className={styles.previewValue}>
          {kind === 'DEBIT' ? 'Agregar deuda' : 'Agregar crédito'}
          {' · '}
          {preview}
          {description.trim() ? ` · ${description.trim()}` : ''}
        </span>
        {Number.isFinite(parsedMinor) && parsedMinor > 0 && (
          <span className={styles.muted}>
            ({parsedMinor} minor · {toMajorUnits(parsedMinor).toFixed(2)} ARS)
          </span>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Registrando…' : 'Confirmar ajuste'}
        </Button>
      </div>
    </form>
  );
}
