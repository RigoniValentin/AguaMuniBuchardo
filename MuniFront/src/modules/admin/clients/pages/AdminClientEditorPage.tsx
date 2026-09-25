import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Card } from '@/components/Card/Card';
import { Spinner } from '@/components/Spinner/Spinner';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Button } from '@/components/Button/Button';
import { ClientForm } from '../components/ClientForm';
import { useClient } from '../hooks/useClients';
import { useCreateClient, useUpdateClient } from '../hooks/useClientMutations';
import { ApiError } from '@/services/api';
import type {
  CreateClientPayload,
  UpdateClientPayload,
} from '../types/clients.types';
import styles from './AdminClientEditorPage.module.css';

function getApiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      return 'Ya existe un cliente registrado con ese documento.';
    }
    if (err.status === 400) {
      const details = err.details;
      if (Array.isArray(details) && details.length > 0) {
        const first = details[0] as { message?: string; path?: string };
        if (first?.message) {
          return `Datos inválidos${first.path ? ` (${first.path})` : ''}: ${first.message}`;
        }
      }
      return err.message;
    }
    return err.message || 'No fue posible guardar los datos.';
  }
  return 'Error inesperado. Intente nuevamente.';
}

export function AdminClientEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id) && id !== 'nuevo';
  const clientId = isEditing ? (id as string) : undefined;

  const { data, isLoading, isError, error } = useClient(clientId);
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient(clientId ?? '');

  const [serverError, setServerError] = useState<string | null>(null);

  if (isEditing && isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Cargando cliente..." />
      </div>
    );
  }

  if (isEditing && isError) {
    return (
      <ErrorState
        title="No pudimos cargar el cliente"
        description={error instanceof Error ? error.message : 'Intente nuevamente.'}
        action={
          <Link to="/admin/clientes">
            <Button variant="ghost">Volver al listado</Button>
          </Link>
        }
      />
    );
  }

  const client = data?.client;
  if (isEditing && !client) {
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

  const submitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (
    payload: CreateClientPayload | UpdateClientPayload,
  ) => {
    setServerError(null);
    try {
      if (clientId) {
        await updateMutation.mutateAsync(payload as UpdateClientPayload);
        navigate(`/admin/clientes/${clientId}`, { replace: true });
      } else {
        const result = await createMutation.mutateAsync(payload as CreateClientPayload);
        navigate(`/admin/clientes/${result.client.id}`, { replace: true });
      }
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    }
  };

  const pageTitle = isEditing ? `Editar cliente${client ? `: ${client.fullName}` : ''}` : 'Nuevo cliente';
  const submitLabel = isEditing ? 'Guardar cambios' : 'Crear cliente';

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <Link to="/admin/clientes" className={styles.backLink}>
            ← Volver al listado
          </Link>
          <h1>{pageTitle}</h1>
        </div>
      </header>

      <Card>
        <ClientForm
          initial={client}
          submitLabel={submitLabel}
          submitting={submitting}
          serverError={serverError}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/clientes')}
        />
      </Card>
    </div>
  );
}
