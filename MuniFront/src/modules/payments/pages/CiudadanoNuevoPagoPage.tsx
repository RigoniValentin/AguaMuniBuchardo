import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Input } from '@/components/Input/Input';
import { Button } from '@/components/Button/Button';
import { ApiError } from '@/services/api';
import {
  arsToWords,
  formatArsDisplay,
  normalizeArsInput,
  parseArsToMinor,
  toMajorUnits,
} from '@/shared/money';
import {
  PAYMENT_ALLOWED_MIME,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_RECEIPT_MAX_BYTES,
  formatBytes,
  isPaymentAllowedMime,
  type PaymentMethod,
} from '../types/payments.types';
import { useSubmitMyPayment } from '../hooks/useMyPayments';
import styles from './CiudadanoNuevoPagoPage.module.css';

export function CiudadanoNuevoPagoPage() {
  const navigate = useNavigate();
  const submit = useSubmitMyPayment();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    if (file.type.startsWith('image/')) return URL.createObjectURL(file);
    return null;
  }, [file]);

  const amountMinor = useMemo(() => {
    const parsed = parseArsToMinor(amount);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [amount]);
  const amountValid = amountMinor !== null;
  const fileValid = file !== null && isPaymentAllowedMime(file.type) && file.size <= PAYMENT_RECEIPT_MAX_BYTES;

  const submitDisabled = submit.isPending || !amountValid || !fileValid;

  const handleFile = (next: File | null) => {
    setFile(next);
    setSubmitError(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountValid || !file) {
      setSubmitError('Verificá el monto y adjuntá un comprobante válido.');
      return;
    }
    if (!isPaymentAllowedMime(file.type)) {
      setSubmitError('Tipo de archivo no permitido.');
      return;
    }
    setSubmitError(null);

    try {
      const res = await submit.mutateAsync({
        amountMinor: amountMinor as number,
        paymentMethod: method,
        note: note.trim().length > 0 ? note.trim() : null,
        receipt: file,
      });
      navigate(`/ciudadano/pagos/${res.payment.id}`);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos enviar el comprobante.',
      );
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <h1>Informar pago</h1>
        <p>
          Completá los datos y adjuntá el comprobante. La Municipalidad lo
          revisará antes de acreditarlo en tu cuenta.
        </p>
      </header>

      <Card>
        <CardTitle>Datos del pago</CardTitle>
        <CardSubtitle>Toda la información queda registrada para auditoría.</CardSubtitle>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <Input
            label="Monto (ARS)"
            value={formatArsDisplay(amount)}
            onChange={(e) => setAmount(normalizeArsInput(e.target.value))}
            inputMode="decimal"
            placeholder="0,00"
            required
            error={
              amount.length > 0 && !amountValid
                ? 'Ingresá un monto válido mayor a cero.'
                : undefined
            }
            hint={
              amountValid && amountMinor !== null
                ? arsToWords(toMajorUnits(amountMinor))
                : undefined
            }
          />

          <div className={styles.field}>
            <label htmlFor="paymentMethod" className={styles.label}>
              Método
            </label>
            <select
              id="paymentMethod"
              className={styles.select}
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            >
              {PAYMENT_METHOD_OPTIONS.map((opt: { value: PaymentMethod; label: string }) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Nota (opcional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej: transferencia del 10/03"
            maxLength={500}
          />

          <div className={styles.fileRow}>
            <div className={styles.field}>
              <label htmlFor="receipt" className={styles.label}>
                Comprobante
              </label>
              <input
                ref={fileInputRef}
                id="receipt"
                type="file"
                accept={PAYMENT_ALLOWED_MIME.join(',')}
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                className={styles.fileInput}
                required
              />
              <p className={styles.fileHint}>
                Formatos: JPEG, PNG, WEBP o PDF. Tamaño máximo 8 MB.
              </p>
              {file && (
                <div className={styles.filePreview}>
                  <div className={styles.fileInfo}>
                    <strong>{file.name}</strong>
                    <span className={styles.fileMeta}>
                      {file.type} · {formatBytes(file.size)}
                    </span>
                  </div>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Vista previa del comprobante"
                      className={styles.previewImage}
                    />
                  ) : (
                    <p className={styles.fileMeta}>PDF adjunto (sin vista previa).</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {submitError && (
            <ErrorState
              title="No pudimos enviar el pago"
              description={submitError}
            />
          )}

          <div className={styles.actions}>
            <Button
              type="submit"
              loading={submit.isPending}
              disabled={submitDisabled}
            >
              {submit.isPending ? 'Enviando comprobante...' : 'Enviar pago'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}