import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/Button/Button';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { Spinner } from '@/components/Spinner/Spinner';
import { ApiError } from '@/services/api';
import { formatMinorAsARS, formatMinorWithSign, formatPercentage } from '@/shared/money';
import { useClients } from '@/modules/admin/clients/hooks/useClients';
import { useProducts } from '@/modules/admin/products/hooks/useProducts';
import { usePricingQuote } from '../hooks/usePricingQuote';
import type { QuoteResult } from '../types/quote.types';
import styles from './AdminQuoteSimulatorPage.module.css';

interface ItemRow {
  productId: string;
  quantity: number;
}

function newItem(): ItemRow {
  return { productId: '', quantity: 1 };
}

export function AdminQuoteSimulatorPage() {
  const [clientId, setClientId] = useState<string>('');
  const [items, setItems] = useState<ItemRow[]>([newItem()]);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const clientsQuery = useClients({ page: 1, limit: 100, sortBy: 'lastName', sortOrder: 'asc' });
  const productsQuery = useProducts({ page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc', active: true });

  useEffect(() => {
    if (!clientId && clientsQuery.data?.items[0]) {
      setClientId(clientsQuery.data.items[0].id);
    }
  }, [clientsQuery.data, clientId]);

  useEffect(() => {
    if (!items[0]?.productId && productsQuery.data?.items[0]) {
      setItems([{ productId: productsQuery.data.items[0].id, quantity: 1 }]);
    }
  }, [productsQuery.data, items]);

  const mutation = usePricingQuote();

  const canSubmit = useMemo(
    () =>
      Boolean(clientId) &&
      items.length > 0 &&
      items.every((it) => it.productId && Number.isInteger(it.quantity) && it.quantity >= 1),
    [clientId, items],
  );

  const handleAdd = () => setItems((prev) => [...prev, newItem()]);

  const handleRemove = (idx: number) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  const handleItemChange = (idx: number, patch: Partial<ItemRow>) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    );
  };

  const handleSubmit = async () => {
    setServerError(null);
    try {
      const data = await mutation.mutateAsync({
        clientId,
        items: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
        })),
      });
      setResult(data);
    } catch (err) {
      setResult(null);
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('Error inesperado. Intente nuevamente.');
      }
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <h1>Simulador de precios</h1>
        <p>Cotice productos para un cliente y visualice la regla aplicada.</p>
      </header>

      <div className={styles.layout}>
        <Card>
          <CardTitle>Parámetros</CardTitle>
          <CardSubtitle>Seleccione cliente, productos y cantidades.</CardSubtitle>
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
          >
            <div className={styles.field}>
              <label className={styles.label} htmlFor="clientId">Cliente</label>
              <select
                id="clientId"
                className={styles.select}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">Seleccione…</option>
                {clientsQuery.data?.items.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} — {c.clientType}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Productos</span>
              <div className={styles.itemsList}>
                {items.map((it, idx) => (
                  <div key={idx} className={styles.itemRow}>
                    <select
                      className={styles.select}
                      value={it.productId}
                      onChange={(e) =>
                        handleItemChange(idx, { productId: e.target.value })
                      }
                    >
                      <option value="">Seleccione…</option>
                      {productsQuery.data?.items.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                    </select>
                    <input
                      className={styles.select}
                      type="number"
                      min={1}
                      max={1000}
                      step={1}
                      value={it.quantity}
                      onChange={(e) =>
                        handleItemChange(idx, {
                          quantity: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(idx)}
                      disabled={items.length === 1}
                    >
                      Quitar
                    </Button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="button" variant="ghost" size="sm" onClick={handleAdd}>
                  + Agregar producto
                </Button>
              </div>
            </div>

            {serverError && (
              <div className={styles.serverError} role="alert">
                {serverError}
              </div>
            )}

            <div className={styles.actions}>
              <Button type="submit" loading={mutation.isPending} disabled={!canSubmit}>
                Cotizar
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardTitle>Resultado</CardTitle>
          <CardSubtitle>
            {result
              ? `Cotización para ${result.client.name} (${result.client.clientType})`
              : 'Aún no se ha cotizado.'}
          </CardSubtitle>
          {mutation.isPending ? (
            <div className={styles.empty}>
              <Spinner label="Cotizando..." />
            </div>
          ) : result ? (
            <div className={styles.result}>
              {result.items.map((line) => (
                <div key={line.productId} className={styles.itemResult}>
                  <div className={styles.itemHeader}>
                    <strong>
                      {line.productName}{' '}
                      <span className={styles.muted}>×{line.quantity}</span>
                    </strong>
                    <strong>{formatMinorAsARS(line.subtotalFinalMinor)}</strong>
                  </div>
                  <div className={styles.muted}>
                    Base: {formatMinorAsARS(line.subtotalBaseMinor)} · Unitario:{' '}
                    {formatMinorAsARS(line.unitFinalPriceMinor)}
                  </div>
                  {line.appliedRule ? (
                    <div className={styles.appliedRule}>
                      Regla aplicada: <strong>{line.appliedRule.name}</strong>{' '}
                      ({formatPercentage(line.adjustmentPercentage)}) ·{' '}
                      <span className={styles.muted}>scope: {line.appliedRule.scope}</span>
                    </div>
                  ) : (
                    <div className={styles.noRule}>
                      Sin regla aplicada — se cobra el precio base.
                    </div>
                  )}
                </div>
              ))}

              <div className={styles.totals}>
                <div className={styles.totalsRow}>
                  <span>Subtotal base</span>
                  <span>{formatMinorAsARS(result.totals.baseMinor)}</span>
                </div>
                <div className={styles.totalsRow}>
                  <span>Ajuste total</span>
                  <span>{formatMinorWithSign(result.totals.adjustmentMinor)}</span>
                </div>
                <div className={`${styles.totalsRow} ${styles.totalsFinal}`}>
                  <span>Total final</span>
                  <span>{formatMinorAsARS(result.totals.finalMinor)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.empty}>
              Presione <strong>Cotizar</strong> para obtener el resultado.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
