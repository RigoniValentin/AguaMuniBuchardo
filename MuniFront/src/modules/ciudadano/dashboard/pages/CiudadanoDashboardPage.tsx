import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Spinner } from '@/components/Spinner/Spinner';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import {
  CITIZEN_CLIENT_TYPE_LABEL,
  CITIZEN_CLIENT_TYPE_TONE,
  formatCitizenAddress,
} from '@/modules/ciudadano/shared/client.types';
import { useMyClient } from '@/modules/ciudadano/shared/useMyClient';
import {
  useMyAccountMovements,
  useMyAccountSummary,
} from '@/modules/ciudadano/account/hooks/useMyAccount';
import { CitizenBalanceCard } from '../components/CitizenBalanceCard';
import { CitizenQuickLinks } from '../components/CitizenQuickLinks';
import { CitizenRecentMovements } from '../components/CitizenRecentMovements';
import styles from './CiudadanoDashboardPage.module.css';

function isClientNotLinked(err: unknown): boolean {
  return Boolean((err as { code?: string } | null)?.code === 'CLIENT_NOT_LINKED');
}

export function CiudadanoDashboardPage() {
  const {
    data: clientData,
    isLoading: clientLoading,
    isError: clientError,
    error: clientErr,
    refetch: refetchClient,
  } = useMyClient();

  const summaryQuery = useMyAccountSummary(Boolean(clientData?.client));
  const movementsQuery = useMyAccountMovements(
    { page: 1, limit: 5 },
    Boolean(clientData?.client),
  );

  if (clientLoading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Cargando tu información..." />
      </div>
    );
  }

  if (clientError && isClientNotLinked(clientErr)) {
    return (
      <Card>
        <CardTitle>Tu cuenta todavía no está vinculada</CardTitle>
        <CardSubtitle>
          Para acceder al portal ciudadano necesitamos vincular tu usuario a un
          registro de cliente.
        </CardSubtitle>
        <EmptyState
          title="Vinculá tu cuenta en la Municipalidad"
          description="Contactá a la Municipalidad para habilitar el acceso a tus servicios. No podemos crear el registro automáticamente."
        />
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

  const client = clientData.client;
  const summary = summaryQuery.data;
  const movements = movementsQuery.data?.items ?? [];

  return (
    <div className={styles.page}>
      <CitizenBalanceCard
        client={client}
        balanceMinor={summary?.account.balanceMinor ?? null}
        loading={summaryQuery.isLoading}
      />

      {!client.active && (
        <Card>
          <CardTitle>Cuenta no habilitada</CardTitle>
          <CardSubtitle>
            Tu cuenta no está habilitada actualmente para nuevas operaciones.
            Podés seguir consultando tu cuenta y movimientos. Si tenés dudas,
            contactá a la Municipalidad.
          </CardSubtitle>
        </Card>
      )}

      <Card>
        <CardTitle>Datos básicos</CardTitle>
        <CardSubtitle>
          Tu información principal como cliente municipal.
        </CardSubtitle>
        <dl className={styles.dl}>
          <div>
            <dt>Tipo de cliente</dt>
            <dd>
              <span
                className={`${styles.tag} ${
                  styles[`tone-${CITIZEN_CLIENT_TYPE_TONE[client.clientType]}`]
                }`}
              >
                {CITIZEN_CLIENT_TYPE_LABEL[client.clientType]}
              </span>
            </dd>
          </div>
          <div>
            <dt>Domicilio</dt>
            <dd>{formatCitizenAddress(client.address)}</dd>
          </div>
        </dl>
      </Card>

      <CitizenQuickLinks />

      <CitizenRecentMovements
        items={movements}
        loading={movementsQuery.isLoading}
      />

      {movementsQuery.isError && (
        <ErrorState
          title="No pudimos cargar tus movimientos"
          description="Intente nuevamente."
          onRetry={() => movementsQuery.refetch()}
        />
      )}
    </div>
  );
}