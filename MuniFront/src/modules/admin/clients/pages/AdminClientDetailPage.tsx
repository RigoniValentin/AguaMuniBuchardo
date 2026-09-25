import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';
import { Spinner } from '@/components/Spinner/Spinner';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { ClientTypeBadge } from '../components/ClientTypeBadge';
import { ClientStatusBadge } from '../components/ClientStatusBadge';
import { CitizenAccessCard } from '../components/CitizenAccessCard';
import { useClient } from '../hooks/useClients';
import { useAuth } from '@/hooks/auth-context';
import {
  DOCUMENT_TYPE_OPTIONS,
  formatAddress,
} from '../types/clients.types';
import { useAccountSummary } from '@/modules/admin/accounts/hooks/useAccounts';
import { describeBalance } from '@/modules/admin/accounts/types/accounts.types';
import styles from './AdminClientDetailPage.module.css';

const DOCUMENT_TYPE_LABEL: Record<string, string> = DOCUMENT_TYPE_OPTIONS.reduce(
  (acc, opt) => ({ ...acc, [opt.value]: opt.label }),
  {} as Record<string, string>,
);

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString('es-AR');
  } catch {
    return value;
  }
}

export function AdminClientDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch } = useClient(id);
  const { user } = useAuth();
  const canReadAccounts = user?.permissions.includes('accounts.read') ?? false;
  const { data: accountData, isLoading: accountLoading } = useAccountSummary(
    canReadAccounts ? id : undefined,
  );
  const account = accountData?.account;
  const balance = account ? describeBalance(account.balanceMinor) : null;

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Cargando cliente..." />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="No pudimos cargar el cliente"
        description={error instanceof Error ? error.message : 'Intente nuevamente.'}
        onRetry={() => refetch()}
        action={
          <Link to="/admin/clientes">
            <Button variant="ghost">Volver al listado</Button>
          </Link>
        }
      />
    );
  }

  const client = data?.client;
  if (!client) {
    return (
      <ErrorState
        title="Cliente no encontrado"
        description="El cliente solicitado no existe o fue eliminado."
        action={
          <Link to="/admin/clientes">
            <Button variant="ghost">Volver al listado</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <Link to="/admin/clientes" className={styles.backLink}>
            ← Volver al listado
          </Link>
          <div className={styles.titleRow}>
            <h1>{client.fullName}</h1>
            <ClientTypeBadge value={client.clientType} />
            <ClientStatusBadge active={client.active} />
          </div>
          <p className={styles.docLine}>
            {client.documentType ? `${client.documentType} ${client.documentNumber ?? ''}` : 'Sin documento'}
          </p>
        </div>
        <Button onClick={() => navigate(`/admin/clientes/${client.id}/editar`)}>
          Editar
        </Button>
      </header>

      <div className={styles.grid}>
        <Card>
          <CardTitle>Contacto</CardTitle>
          <CardSubtitle>Datos de contacto del cliente.</CardSubtitle>
          <dl className={styles.dl}>
            <div>
              <dt>Teléfono</dt>
              <dd>{client.phone ?? '—'}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{client.email ?? '—'}</dd>
            </div>
            <div>
              <dt>Cuenta de usuario</dt>
              <dd>{client.hasUserAccount ? 'Vinculada' : 'No vinculada'}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardTitle>Documento</CardTitle>
          <CardSubtitle>Identidad del cliente.</CardSubtitle>
          <dl className={styles.dl}>
            <div>
              <dt>Tipo</dt>
              <dd>{client.documentType ? DOCUMENT_TYPE_LABEL[client.documentType] : 'Sin documento'}</dd>
            </div>
            <div>
              <dt>Número</dt>
              <dd className={styles.docNumber}>{client.documentNumber ?? '—'}</dd>
            </div>
            <div>
              <dt>Tipo de cliente</dt>
              <dd>
                <ClientTypeBadge value={client.clientType} />
              </dd>
            </div>
          </dl>
        </Card>

        <Card>
          <CardTitle>Dirección</CardTitle>
          <CardSubtitle>{formatAddress(client.address)}</CardSubtitle>
          <dl className={styles.dl}>
            <div>
              <dt>Calle</dt>
              <dd>{client.address.street} {client.address.number}</dd>
            </div>
            {client.address.floor && (
              <div>
                <dt>Piso</dt>
                <dd>{client.address.floor}</dd>
              </div>
            )}
            {client.address.apartment && (
              <div>
                <dt>Departamento</dt>
                <dd>{client.address.apartment}</dd>
              </div>
            )}
            {client.address.neighborhood && (
              <div>
                <dt>Barrio</dt>
                <dd>{client.address.neighborhood}</dd>
              </div>
            )}
            <div>
              <dt>Localidad</dt>
              <dd>{client.address.locality}</dd>
            </div>
            {client.address.postalCode && (
              <div>
                <dt>Código postal</dt>
                <dd>{client.address.postalCode}</dd>
              </div>
            )}
            {client.address.references && (
              <div>
                <dt>Referencias</dt>
                <dd>{client.address.references}</dd>
              </div>
            )}
          </dl>
        </Card>

        {client.zona && (
          <Card>
            <CardTitle>Zona de reparto</CardTitle>
            <CardSubtitle>
              Etiqueta del padrón municipal. Define los días que pasa el repartidor.
            </CardSubtitle>
            <p className={styles.notes}>
              <strong>{client.zona}</strong>
              {client.zona === 'ZONA 1' && ' — Lunes, miércoles y viernes'}
              {client.zona === 'ZONA 2' && ' — Martes, jueves y sábado'}
            </p>
          </Card>
        )}

        <Card>
          <CardTitle>Observaciones</CardTitle>
          <CardSubtitle>Notas internas registradas.</CardSubtitle>
          <p className={styles.notes}>{client.notes || 'Sin observaciones.'}</p>
          <dl className={styles.dl}>
            <div>
              <dt>Creado</dt>
              <dd>{formatDate(client.createdAt)}</dd>
            </div>
            <div>
              <dt>Última actualización</dt>
              <dd>{formatDate(client.updatedAt)}</dd>
            </div>
          </dl>
        </Card>

        {canReadAccounts && (
          <Card>
            <CardTitle>Cuenta corriente</CardTitle>
            <CardSubtitle>
              Saldo calculado desde el libro contable de movimientos.
            </CardSubtitle>
            <div className={styles.accountRow}>
              {accountLoading ? (
                <span className={styles.muted}>Cargando saldo…</span>
              ) : balance ? (
                <span className={`${styles.balanceValue} ${styles[`balance-${balance.kind}`]}`}>
                  {balance.label}
                </span>
              ) : (
                <span className={styles.muted}>Sin datos de cuenta</span>
              )}
              <Link
                to={`/admin/clientes/${client.id}/cuenta`}
                className={styles.accountLink}
              >
                Ver cuenta corriente
              </Link>
            </div>
          </Card>
        )}

        <CitizenAccessCard clientId={client.id} clientName={client.fullName} />
      </div>
    </div>
  );
}
