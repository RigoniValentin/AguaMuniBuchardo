import { useMemo } from 'react';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Spinner } from '@/components/Spinner/Spinner';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/modules/admin/products/services/products.api';
import { ApiError } from '@/services/api';
import { useMyClient } from '@/modules/ciudadano/shared/useMyClient';
import { myPricingApi } from '../services/myPricing.api';
import { formatMinorAsARS } from '@/shared/money';
import {
  PRODUCT_TYPE_LABEL,
  PRODUCT_TYPE_TONE,
  type Product,
} from '@/modules/admin/products/types/products.types';
import styles from './CiudadanoPreciosPage.module.css';

function isClientNotLinked(err: unknown): boolean {
  return Boolean((err as { code?: string } | null)?.code === 'CLIENT_NOT_LINKED');
}

function isInactiveClientMessage(message: string): boolean {
  return /inactiv/i.test(message);
}

export function CiudadanoPreciosPage() {
  const {
    data: clientData,
    isLoading: clientLoading,
    isError: clientError,
    error: clientErr,
    refetch: refetchClient,
  } = useMyClient();

  const clientActive = clientData?.client.active === true;

  // 1) Fetch active products.
  const productsQuery = useQuery({
    queryKey: ['citizen-products', 'active'],
    queryFn: () => productsApi.list({ active: true, limit: 100 }),
    enabled: Boolean(clientData?.client),
    retry: (failureCount, error) => {
      const code = (error as { code?: string } | null)?.code;
      if (code === 'FORBIDDEN') return false;
      return failureCount < 2;
    },
  });

  const products: Product[] = useMemo(
    () => productsQuery.data?.items ?? [],
    [productsQuery.data],
  );

  // 2) Batch self-quote (qty=1) for the visible products.
  const batchItems = useMemo(
    () =>
      products.map((p) => ({
        productId: p.id,
        quantity: 1,
      })),
    [products],
  );

  const quoteQuery = useQuery({
    queryKey: ['citizen-pricing', 'batch', batchItems],
    queryFn: () => myPricingApi.quote({ items: batchItems }),
    enabled: batchItems.length > 0 && clientActive,
    retry: false,
  });

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
          Para ver precios personalizados necesitamos vincular tu usuario a un
          cliente municipal.
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
        <CardTitle>Tu cuenta no está habilitada para nuevas operaciones</CardTitle>
        <CardSubtitle>
          Podés seguir consultando tu cuenta y movimientos. Para cotizar
          productos necesitás una cuenta activa; contactá a la Municipalidad
          si necesitás más información.
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

  // Map of price lines (productId → adjusted/quote line).
  const lineByProductId = new Map(
    (quoteQuery.data?.items ?? []).map((l) => [l.productId, l]),
  );

  const quoteErrorIsInactiveClient =
    quoteQuery.error instanceof ApiError &&
    isInactiveClientMessage(quoteQuery.error.message);

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <h1>Precios</h1>
        <p>
          Productos disponibles con tu precio personalizado según tu tipo de
          cliente.
        </p>
      </header>

      {quoteQuery.isLoading && (
        <Card>
          <p className={styles.muted}>
            <Spinner size="sm" /> Calculando tu precio personalizado…
          </p>
        </Card>
      )}

      {quoteQuery.isError && quoteErrorIsInactiveClient && (
        <Card>
          <CardTitle>Tu cuenta no está habilitada para nuevas operaciones</CardTitle>
          <CardSubtitle>
            Podés seguir consultando tu cuenta y movimientos. Esta es una
            operación comercial y requiere cuenta activa.
          </CardSubtitle>
        </Card>
      )}

      {quoteQuery.isError && !quoteErrorIsInactiveClient && (
        <ErrorState
          title="No pudimos calcular tu cotización"
          description="Intente nuevamente."
          onRetry={() => quoteQuery.refetch()}
        />
      )}

      <ul className={styles.list}>
        {products.map((p) => {
          const line = lineByProductId.get(p.id);
          const baseMinor = line?.unitBasePriceMinor ?? p.basePriceMinor;
          const finalMinor = line?.unitFinalPriceMinor ?? p.basePriceMinor;
          const hasAdjustment = line && line.adjustmentPercentage !== 0;
          return (
            <li key={p.id} className={styles.item}>
              <header className={styles.headRow}>
                <div>
                  <p className={styles.name}>{p.name}</p>
                  {p.description && (
                    <p className={styles.description}>{p.description}</p>
                  )}
                </div>
                <span className={`${styles.tag} ${styles[`tone-${PRODUCT_TYPE_TONE[p.productType]}`]}`}>
                  {PRODUCT_TYPE_LABEL[p.productType]}
                </span>
              </header>

              <div className={styles.prices}>
                {hasAdjustment && (
                  <div className={styles.priceCol}>
                    <span className={styles.priceLabel}>Precio general</span>
                    <span className={styles.basePrice}>
                      {formatMinorAsARS(baseMinor)}
                    </span>
                  </div>
                )}
                <div className={styles.priceCol}>
                  <span className={styles.priceLabel}>
                    {hasAdjustment ? 'Tu precio' : 'Precio'}
                  </span>
                  <span className={styles.finalPrice}>
                    {formatMinorAsARS(finalMinor)}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}