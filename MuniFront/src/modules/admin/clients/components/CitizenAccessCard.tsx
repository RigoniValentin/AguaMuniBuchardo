import { useMemo, useState } from 'react';
import { Button } from '@/components/Button/Button';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Input } from '@/components/Input/Input';
import { Spinner } from '@/components/Spinner/Spinner';
import { Badge } from '@/components/Badge/Badge';
import { useAuth } from '@/hooks/auth-context';
import { ApiError } from '@/services/api';
import {
  useCitizenAccess,
  useLinkCitizenAccess,
  useUnlinkCitizenAccess,
} from '../hooks/useCitizenAccess';
import styles from './CitizenAccessCard.module.css';

interface CitizenAccessCardProps {
  clientId: string;
  clientName: string;
}

type IdentifierKind = 'email' | 'dni' | 'phone';

function detectKind(value: string): IdentifierKind {
  const trimmed = value.trim();
  if (trimmed.includes('@')) return 'email';
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length >= 10) return 'phone';
  return 'dni';
}

function validateIdentifier(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Ingresá el email, DNI o teléfono del usuario';
  const kind = detectKind(trimmed);
  if (kind === 'email') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return 'Email inválido';
    }
  } else if (kind === 'phone') {
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 16) {
      return 'Teléfono inválido (10-16 dígitos)';
    }
  } else {
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length < 6 || digits.length > 9) {
      return 'DNI inválido (6-9 dígitos)';
    }
  }
  return null;
}

export function CitizenAccessCard({ clientId, clientName }: CitizenAccessCardProps) {
  const { user } = useAuth();
  const canLink = user?.permissions.includes('clients.linkUser') ?? false;

  const { data, isLoading, isError, error, refetch } = useCitizenAccess(clientId);
  const linkMutation = useLinkCitizenAccess(clientId);
  const unlinkMutation = useUnlinkCitizenAccess(clientId);

  const [identifier, setIdentifier] = useState('');
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const kind = useMemo<IdentifierKind>(() => detectKind(identifier), [identifier]);

  if (!canLink) {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardTitle>Acceso ciudadano</CardTitle>
        <Spinner label="Cargando..." />
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardTitle>Acceso ciudadano</CardTitle>
        <ErrorState
          title="No pudimos cargar el acceso"
          description={
            error instanceof Error ? error.message : 'Intente nuevamente.'
          }
          onRetry={() => refetch()}
        />
      </Card>
    );
  }

  const access = data.access;

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);
    const errorMessage = validateIdentifier(identifier);
    if (errorMessage) {
      setIdentifierError(errorMessage);
      return;
    }
    try {
      await linkMutation.mutateAsync(identifier.trim());
      setIdentifier('');
      setIdentifierError(null);
      setSuccess('Cuenta vinculada correctamente.');
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : 'No se pudo vincular la cuenta.',
      );
    }
  };

  const handleUnlink = async () => {
    setSubmitError(null);
    setSuccess(null);
    try {
      await unlinkMutation.mutateAsync();
      setConfirming(false);
      setSuccess(`Cuenta desvinculada. ${clientName} ya no tiene portal ciudadano.`);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo desvincular la cuenta.',
      );
    }
  };

  return (
    <Card>
      <CardTitle>Acceso ciudadano</CardTitle>
      <CardSubtitle>
        Vinculación con un usuario CIUDADANO para habilitar el portal.
      </CardSubtitle>

      {access.linked && access.user ? (
        <div className={styles.linked}>
          <div className={styles.statusRow}>
            <Badge tone="success">Cuenta vinculada</Badge>
            {access.user.active ? (
              <Badge tone="info">Usuario activo</Badge>
            ) : (
              <Badge tone="warning">Usuario inactivo</Badge>
            )}
          </div>
          <p className={styles.email}>
            <strong>{access.user.firstName} {access.user.lastName}</strong>
            <br />
            <span>{access.user.email}</span>
          </p>
          {access.user.documentNumber && (
            <p className={styles.muted}>
              DNI: <strong>{access.user.documentNumber}</strong>
            </p>
          )}
          {confirming ? (
            <div className={styles.confirm}>
              <p>¿Desvincular la cuenta de {access.user.email}?</p>
              <p className={styles.muted}>
                {clientName} no podrá usar el portal. Su historial financiero se
                conserva.
              </p>
              <div className={styles.actions}>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleUnlink}
                  loading={unlinkMutation.isPending}
                  disabled={unlinkMutation.isPending}
                >
                  Confirmar desvinculación
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirming(false)}
                  disabled={unlinkMutation.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirming(true)}
            >
              Desvincular
            </Button>
          )}
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleLink}>
          <p className={styles.muted}>
            Esta cuenta no está vinculada a un usuario del portal.
          </p>
          <Input
            label="Email, DNI o teléfono del usuario CIUDADANO"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              setIdentifierError(null);
            }}
            placeholder={
              kind === 'email'
                ? 'ciudadano@email.com'
                : kind === 'phone'
                  ? '+54 9 358 555 0000'
                  : '12.345.678'
            }
            autoComplete="off"
            error={identifierError ?? undefined}
            hint={
              kind === 'email'
                ? 'Ingresando un email se busca el usuario registrado con ese email.'
                : kind === 'phone'
                  ? 'Ingresando un teléfono se busca el usuario registrado con ese número.'
                  : 'Ingresando un DNI se busca el usuario registrado con ese documento.'
            }
          />
          <div className={styles.actions}>
            <Button
              type="submit"
              loading={linkMutation.isPending}
              disabled={linkMutation.isPending || identifier.trim().length === 0}
            >
              Vincular cuenta
            </Button>
          </div>
        </form>
      )}

      {submitError && (
        <p className={styles.errorMsg} role="alert">
          {submitError}
        </p>
      )}
      {success && (
        <p className={styles.successMsg} role="status">
          {success}
        </p>
      )}
    </Card>
  );
}
