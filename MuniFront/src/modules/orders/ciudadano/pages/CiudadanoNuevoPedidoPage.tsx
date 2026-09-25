import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Spinner } from '@/components/Spinner/Spinner';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { Badge } from '@/components/Badge/Badge';
import { ApiError } from '@/services/api';
import { formatMinorAsARS } from '@/shared/money';
import { productsApi } from '@/modules/admin/products/services/products.api';
import { useMyClient } from '@/modules/ciudadano/shared/useMyClient';
import { myPricingApi } from '@/modules/ciudadano/prices/services/myPricing.api';
import type { CitizenQuote } from '@/modules/ciudadano/prices/prices.types';
import { useCreateMyOrder } from '../../hooks/useOrderMutations';
import styles from './CiudadanoNuevoPedidoPage.module.css';

interface CartLine {
  productId: string;
  quantity: number;
}

function isClientNotLinked(err: unknown): boolean {
  return Boolean((err as { code?: string } | null)?.code === 'CLIENT_NOT_LINKED');
}

type View = 'cart' | 'review';

export function CiudadanoNuevoPedidoPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');
  const [view, setView] = useState<View>('cart');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const { data: clientData, isLoading: clientLoading, isError: clientError, error: clientErr, refetch: refetchClient } = useMyClient();
  const clientActive = clientData?.client.active === true;

  const productsQuery = useQuery({
    queryKey: ['citizen-products', 'active-for-order'],
    queryFn: () => productsApi.list({ active: true, limit: 100 }),
    enabled: Boolean(clientData?.client),
    retry: (failureCount, error) => {
      const code = (error as { code?: string } | null)?.code;
      if (code === 'FORBIDDEN') return false;
      return failureCount < 2;
    },
  });

  const products = useMemo(() => productsQuery.data?.items ?? [], [productsQuery.data]);

  // Quote whenever the cart changes.
  const quoteItems: CartLine[] = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, q]) => q > 0)
        .map(([productId, quantity]) => ({ productId, quantity })),
    [cart],
  );

  const quoteQuery = useQuery<CitizenQuote>({
    queryKey: ['citizen-pricing', 'order-cart', quoteItems],
    queryFn: () => myPricingApi.quote({ items: quoteItems }),
    enabled: quoteItems.length > 0 && clientActive,
    retry: false,
  });

  const createMutation = useCreateMyOrder();

  // Keep cart to only valid products (e.g. if list refreshes).
  useEffect(() => {
    setCart((prev) => {
      const validIds = new Set(products.map((p) => p.id));
      const next: Record<string, number> = {};
      for (const [id, q] of Object.entries(prev)) {
        if (validIds.has(id)) next[id] = q;
      }
      return next;
    });
  }, [products]);

  const total = quoteQuery.data?.totals.finalMinor ?? 0;
  const totalIsZero = total === 0;

  const handleIncrement = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: Math.min(1000, (prev[productId] ?? 0) + 1),
    }));
  };

  const handleDecrement = (productId: string) => {
    setCart((prev) => {
      const current = prev[productId] ?? 0;
      const next = { ...prev };
      if (current <= 1) {
        delete next[productId];
      } else {
        next[productId] = current - 1;
      }
      return next;
    });
  };

  const handleConfirm = async () => {
    const result = await createMutation.mutateAsync({
      items: quoteItems,
      customerNote: note.trim() || undefined,
    });
    setSubmittedId(result.order.id);
  };

  // ---- Render ----

  const lineByProductId = new Map(
    (quoteQuery.data?.items ?? []).map((l) => [l.productId, l]),
  );

  if (view === 'review') {
    if (!clientData) {
      return (
        <div className={styles.loading}>
          <Spinner label="Cargando información..." />
        </div>
      );
    }
    return (
      <div className={styles.page}>
        <header className={styles.heading}>
          <h1>Confirmar pedido</h1>
          <p>
            Revisá el detalle antes de enviar. Una vez confirmado, el pedido
            queda registrado y no se puede modificar.
          </p>
        </header>

        <Card>
          <CardTitle>Tu pedido</CardTitle>
          <CardSubtitle>
            {quoteItems.length === 1
              ? '1 producto'
              : `${quoteItems.length} productos`}
          </CardSubtitle>

          <ul className={styles.reviewList}>
            {quoteQuery.data?.items.map((line) => (
              <li key={line.productId} className={styles.reviewItem}>
                <div className={styles.reviewItemMain}>
                  <span className={styles.reviewQty}>{line.quantity}×</span>
                  <span className={styles.reviewName}>{line.productName}</span>
                </div>
                <span className={styles.reviewSubtotal}>
                  {formatMinorAsARS(line.subtotalFinalMinor)}
                </span>
              </li>
            ))}
          </ul>

          <div className={styles.totalRow}>
            <span>Total</span>
            <strong>
              {quoteQuery.isLoading
                ? '…'
                : formatMinorAsARS(quoteQuery.data?.totals.finalMinor ?? 0)}
            </strong>
          </div>

          <div className={styles.addressBlock}>
            <strong>Dirección de entrega</strong>
            <p>
              {clientData.client.address.street} {clientData.client.address.number}
              {clientData.client.address.floor
                ? `, ${clientData.client.address.floor}`
                : ''}
              {clientData.client.address.apartment
                ? ` ${clientData.client.address.apartment}`
                : ''}
              <br />
              {clientData.client.address.locality}
              {clientData.client.address.neighborhood
                ? ` (${clientData.client.address.neighborhood})`
                : ''}
            </p>
          </div>

          {note.trim() && (
            <div className={styles.addressBlock}>
              <strong>Nota para el repartidor</strong>
              <p>{note.trim()}</p>
            </div>
          )}

          <p className={styles.commitNotice}>
            Al confirmar, estás registrando este pedido a tu nombre y aceptás
            que el importe{' '}
            {totalIsZero
              ? 'no se registre como deuda'
              : 'se registre en tu cuenta corriente municipal'}
            .
          </p>

          {createMutation.isError && (
            <div className={styles.error} role="alert">
              {(createMutation.error as { message?: string })?.message ??
                'No se pudo confirmar el pedido'}
            </div>
          )}

          <div className={styles.actions}>
            <Button
              variant="ghost"
              onClick={() => setView('cart')}
              disabled={createMutation.isPending}
            >
              Volver
            </Button>
            <Button
              onClick={handleConfirm}
              loading={createMutation.isPending}
            >
              Confirmar y enviar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (submittedId) {
    return (
      <div className={styles.page}>
        <Card>
          <CardTitle>Pedido confirmado</CardTitle>
          <CardSubtitle>
            Registramos tu pedido. Si tu zona reparte hoy, queda pendiente
            para que un repartidor lo tome; si no, esperaremos al día que
            corresponda.
          </CardSubtitle>
          <div className={styles.confirmRow}>
            <span className={styles.confirmTotal}>
              {formatMinorAsARS(quoteQuery.data?.totals.finalMinor ?? 0)}
            </span>
            <Badge tone="warning">Pendiente</Badge>
          </div>
          <div className={styles.confirmActions}>
            <Button onClick={() => navigate(`/ciudadano/pedidos/${submittedId}`)}>
              Ver pedido
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/ciudadano/pagos/nuevo')}
            >
              Informar pago
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (clientLoading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Cargando información..." />
      </div>
    );
  }

  if (clientError && isClientNotLinked(clientErr)) {
    return (
      <Card>
        <CardTitle>Tu cuenta no está vinculada</CardTitle>
        <CardSubtitle>
          Para hacer pedidos necesitás un cliente municipal vinculado.
        </CardSubtitle>
      </Card>
    );
  }

  if (clientError || !clientData) {
    return (
      <ErrorState
        title="No pudimos cargar tu información"
        description={
          clientErr instanceof Error ? clientErr.message : 'Intente nuevamente.'
        }
        onRetry={() => refetchClient()}
      />
    );
  }

  if (!clientData.client.active) {
    return (
      <Card>
        <CardTitle>Tu cuenta no está habilitada para nuevos pedidos</CardTitle>
        <CardSubtitle>
          Contactá a la Municipalidad para regularizar tu situación.
        </CardSubtitle>
      </Card>
    );
  }

  if (productsQuery.isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Cargando productos..." />
      </div>
    );
  }

  if (productsQuery.isError) {
    return (
      <ErrorState
        title="No pudimos cargar los productos"
        description="Intente nuevamente."
        onRetry={() => productsQuery.refetch()}
      />
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Sin productos disponibles"
          description="Por el momento no hay productos activos en el catálogo."
        />
      </Card>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <h1>Hacer pedido</h1>
        <p>Elegí los productos y la cantidad. Te mostraremos el precio final personalizado.</p>
      </header>

      <Card>
        <CardTitle>Tu pedido</CardTitle>
        <CardSubtitle>Ajustá las cantidades con + y −.</CardSubtitle>

        <ul className={styles.productList}>
          {products.map((p) => {
            const quantity = cart[p.id] ?? 0;
            const line = lineByProductId.get(p.id);
            const unitPrice = line?.unitFinalPriceMinor ?? p.basePriceMinor;
            const subtotal = line?.subtotalFinalMinor ?? 0;
            return (
              <li key={p.id} className={styles.productItem}>
                <div className={styles.productInfo}>
                  <span className={styles.productName}>{p.name}</span>
                  <span className={styles.productPrice}>
                    {line && line.adjustmentPercentage !== 0 ? (
                      <>
                        <span className={styles.basePrice}>
                          {formatMinorAsARS(line.unitBasePriceMinor)}
                        </span>{' '}
                        <span className={styles.finalPrice}>
                          {formatMinorAsARS(unitPrice)}
                        </span>
                      </>
                    ) : (
                      <span className={styles.finalPrice}>
                        {formatMinorAsARS(unitPrice)}
                      </span>
                    )}
                  </span>
                </div>
                <div className={styles.qtyRow}>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() => handleDecrement(p.id)}
                    disabled={quantity === 0}
                    aria-label={`Quitar ${p.name}`}
                  >
                    −
                  </button>
                  <span className={styles.qtyValue}>{quantity}</span>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() => handleIncrement(p.id)}
                    aria-label={`Agregar ${p.name}`}
                  >
                    +
                  </button>
                  {quantity > 0 && (
                    <span className={styles.subtotal}>
                      {formatMinorAsARS(subtotal)}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className={styles.totalRow}>
          <span>Total</span>
          <strong>
            {quoteQuery.isLoading
              ? '…'
              : formatMinorAsARS(quoteQuery.data?.totals.finalMinor ?? 0)}
          </strong>
        </div>

        <div className={styles.addressBlock}>
          <strong>Dirección de entrega</strong>
          <p>
            {clientData.client.address.street} {clientData.client.address.number}
            {clientData.client.address.floor
              ? `, ${clientData.client.address.floor}`
              : ''}
            {clientData.client.address.apartment
              ? ` ${clientData.client.address.apartment}`
              : ''}
            <br />
            {clientData.client.address.locality}
            {clientData.client.address.neighborhood
              ? ` (${clientData.client.address.neighborhood})`
              : ''}
          </p>
        </div>

        <Input
          label="Nota (opcional)"
          placeholder="Timbre, referencias, horario preferido…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
        />

        {quoteQuery.isError && quoteItems.length > 0 && (
          <ErrorState
            title="No pudimos cotizar tu pedido"
            description={
              quoteQuery.error instanceof ApiError
                ? quoteQuery.error.message
                : 'Intente nuevamente.'
            }
            onRetry={() => quoteQuery.refetch()}
          />
        )}

        {createMutation.isError && (
          <div className={styles.error} role="alert">
            {(createMutation.error as { message?: string })?.message ??
              'No se pudo confirmar el pedido'}
          </div>
        )}

        <p className={styles.disclaimer}>
          Al confirmar, el importe se registrará en tu cuenta corriente.
        </p>
        {totalIsZero && quoteItems.length > 0 && (
          <p className={styles.zeroDisclaimer}>
            Este pedido no generará deuda.
          </p>
        )}

        <div className={styles.actions}>
          <Button
            variant="ghost"
            onClick={() => navigate('/ciudadano/pedidos')}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => setView('review')}
            disabled={quoteItems.length === 0}
          >
            Revisar pedido
          </Button>
        </div>
      </Card>
    </div>
  );
}
