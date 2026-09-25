import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { Spinner } from '@/components/Spinner/Spinner';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { Badge } from '@/components/Badge/Badge';
import { ApiError } from '@/services/api';
import { formatMinorAsARS } from '@/shared/money';
import { clientsApi } from '@/modules/admin/clients/services/clients.api';
import { productsApi } from '@/modules/admin/products/services/products.api';
import { quoteApi } from '@/modules/admin/quote-simulator/services/quote.api';
import type {
  Client,
} from '@/modules/admin/clients/types/clients.types';
import type {
  Product,
} from '@/modules/admin/products/types/products.types';
import type {
  QuoteResult,
} from '@/modules/admin/quote-simulator/types/quote.types';
import { useCreateDirectOrder } from '../../hooks/useOrderMutations';
import styles from './RepartidorNuevaEntregaPage.module.css';

type Step = 'search' | 'products' | 'review' | 'submitted';

export function RepartidorNuevaEntregaPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('search');
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Search clients
  const clientsQuery = useQuery({
    queryKey: ['driver-search-clients', search],
    queryFn: () => clientsApi.list({ search: search.trim() || undefined, limit: 10 }),
    enabled: step === 'search',
    retry: false,
  });

  // Active products for selection
  const productsQuery = useQuery({
    queryKey: ['driver-products'],
    queryFn: () => productsApi.list({ active: true, limit: 100 }),
    enabled: step === 'products' || step === 'review',
  });

  // Live quote for the selected client + cart
  const items = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, q]) => q > 0)
        .map(([productId, quantity]) => ({ productId, quantity })),
    [cart],
  );

  const quoteQuery = useQuery<QuoteResult>({
    queryKey: ['driver-quote', selectedClient?.id, items],
    queryFn: () =>
      quoteApi.quote({
        clientId: selectedClient!.id,
        items,
      }),
    enabled: step === 'review' && items.length > 0 && Boolean(selectedClient),
    retry: false,
  });

  const createMutation = useCreateDirectOrder();

  useEffect(() => {
    if (submittedId && step !== 'submitted') {
      setStep('submitted');
    }
  }, [submittedId, step]);

  const products = useMemo(
    () => productsQuery.data?.items ?? [],
    [productsQuery.data],
  );

  const handleConfirm = async () => {
    if (!selectedClient) return;
    const result = await createMutation.mutateAsync({
      clientId: selectedClient.id,
      items,
    });
    setSubmittedId(result.order.id);
  };

  // -------- RENDER --------

  if (step === 'submitted' && submittedId) {
    return (
      <div className={styles.page}>
        <Card>
          <CardTitle>Entrega creada</CardTitle>
          <CardSubtitle>
            Registramos la entrega. Ahora podés dirigirte al domicilio.
          </CardSubtitle>
          <div className={styles.confirmActions}>
            <Button onClick={() => navigate(`/repartidor/entregas/${submittedId}`)}>
              Ver entrega
            </Button>
            <Button variant="secondary" onClick={() => navigate('/repartidor')}>
              Volver al inicio
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 'search') {
    return (
      <div className={styles.page}>
        <header className={styles.heading}>
          <h1>Nueva entrega</h1>
          <p>Buscá el cliente para iniciar la entrega.</p>
        </header>

        <Card>
          <Input
            label="Buscar cliente"
            placeholder="Nombre, apellido, documento o dirección"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />

          {clientsQuery.isLoading && (
            <div className={styles.loading}>
              <Spinner label="Buscando clientes..." />
            </div>
          )}

          {clientsQuery.isError && !(clientsQuery.error instanceof ApiError && clientsQuery.error.code === 'FORBIDDEN') && (
            <ErrorState
              title="No pudimos buscar clientes"
              description="Intente nuevamente."
              onRetry={() => clientsQuery.refetch()}
            />
          )}

          {clientsQuery.data && clientsQuery.data.items.length === 0 && (
            <EmptyState
              title="Sin resultados"
              description="Ajustá la búsqueda o pedí a administración que registre al cliente."
            />
          )}

          {clientsQuery.data && clientsQuery.data.items.length > 0 && (
            <ul className={styles.list}>
              {clientsQuery.data.items.map((c) => (
                <li key={c.id} className={styles.item}>
                  <button
                    type="button"
                    className={styles.itemBtn}
                    onClick={() => {
                      setSelectedClient(c);
                      setStep('products');
                    }}
                  >
                    <span className={styles.itemName}>{c.fullName}</span>
                    <span className={styles.itemMeta}>
                      {c.documentType} {c.documentNumber} · {c.clientType}
                    </span>
                    <span className={styles.itemAddress}>
                      {c.address.street} {c.address.number}, {c.address.locality}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    );
  }

  if (step === 'products') {
    return (
      <div className={styles.page}>
        <header className={styles.heading}>
          <h1>Nueva entrega</h1>
          <p>Seleccioná los productos para {selectedClient?.fullName}.</p>
        </header>

        <Card>
          <div className={styles.clientSummary}>
            <div>
              <strong>{selectedClient?.fullName}</strong>
              <p className={styles.muted}>
                {selectedClient?.documentType} {selectedClient?.documentNumber} ·{' '}
                {selectedClient?.clientType}
              </p>
            </div>
            <Button variant="ghost" onClick={() => setStep('search')}>
              Cambiar cliente
            </Button>
          </div>

          {productsQuery.isLoading && (
            <Spinner label="Cargando productos..." />
          )}
          {productsQuery.isError && (
            <ErrorState
              title="No pudimos cargar los productos"
              description="Intente nuevamente."
              onRetry={() => productsQuery.refetch()}
            />
          )}

          {products.length > 0 && (
            <ul className={styles.productList}>
              {products.map((p: Product) => {
                const q = cart[p.id] ?? 0;
                return (
                  <li key={p.id} className={styles.productRow}>
                    <div className={styles.productInfo}>
                      <strong>{p.name}</strong>
                      <span className={styles.muted}>
                        {formatMinorAsARS(p.basePriceMinor)}
                      </span>
                    </div>
                    <div className={styles.qtyRow}>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() =>
                          setCart((prev) => {
                            const cur = prev[p.id] ?? 0;
                            const next = { ...prev };
                            if (cur <= 1) delete next[p.id];
                            else next[p.id] = cur - 1;
                            return next;
                          })
                        }
                        disabled={q === 0}
                      >
                        −
                      </button>
                      <span className={styles.qtyValue}>{q}</span>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() =>
                          setCart((prev) => ({
                            ...prev,
                            [p.id]: Math.min(1000, (prev[p.id] ?? 0) + 1),
                          }))
                        }
                      >
                        +
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className={styles.actions}>
            <Button variant="ghost" onClick={() => setStep('search')}>
              ← Volver
            </Button>
            <Button
              disabled={items.length === 0}
              onClick={() => setStep('review')}
            >
              Continuar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // step === 'review'
  const total = quoteQuery.data?.totals.finalMinor ?? 0;
  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <h1>Nueva entrega</h1>
        <p>Confirmá el pedido para {selectedClient?.fullName}.</p>
      </header>

      <Card>
        <CardTitle>Resumen</CardTitle>
        <CardSubtitle>
          {selectedClient?.fullName} ·{' '}
          {selectedClient?.address.street} {selectedClient?.address.number},{' '}
          {selectedClient?.address.locality}
        </CardSubtitle>

        {quoteQuery.isLoading && <Spinner label="Cotizando..." />}
        {quoteQuery.isError && (
          <ErrorState
            title="No pudimos cotizar"
            description={
              quoteQuery.error instanceof ApiError
                ? quoteQuery.error.message
                : 'Intente nuevamente.'
            }
            onRetry={() => quoteQuery.refetch()}
          />
        )}

        {quoteQuery.data && (
          <ul className={styles.list}>
            {quoteQuery.data.items.map((line) => (
              <li key={line.productId} className={styles.row}>
                <div>
                  <strong>{line.productName}</strong> × {line.quantity}
                </div>
                <div>
                  {line.adjustmentPercentage !== 0 && (
                    <Badge tone="info">
                      {line.adjustmentPercentage > 0 ? '+' : ''}
                      {line.adjustmentPercentage}%
                    </Badge>
                  )}{' '}
                  {formatMinorAsARS(line.subtotalFinalMinor)}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.totalRow}>
          <span>Total</span>
          <strong>{formatMinorAsARS(total)}</strong>
        </div>

        {total === 0 && (
          <p className={styles.zeroNote}>
            Este pedido no generará deuda.
          </p>
        )}

        {createMutation.isError && (
          <div className={styles.error} role="alert">
            {(createMutation.error as { message?: string })?.message ??
              'No se pudo crear la entrega'}
          </div>
        )}

        <div className={styles.actions}>
          <Button variant="ghost" onClick={() => setStep('products')}>
            ← Volver
          </Button>
          <Button
            onClick={handleConfirm}
            loading={createMutation.isPending}
            disabled={items.length === 0 || total === undefined}
          >
            Confirmar y entregar
          </Button>
        </div>
      </Card>
    </div>
  );
}
