import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/Card/Card';
import { Spinner } from '@/components/Spinner/Spinner';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Button } from '@/components/Button/Button';
import { PricingRuleForm } from '../components/PricingRuleForm';
import { usePricingRule } from '../hooks/usePricingRules';
import {
  useCreatePricingRule,
  useUpdatePricingRule,
} from '../hooks/usePricingRuleMutations';
import { ApiError } from '@/services/api';
import type {
  CreatePricingRulePayload,
  UpdatePricingRulePayload,
} from '../types/pricing-rules.types';
import styles from './AdminPricingRuleEditorPage.module.css';

function getApiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      return 'Ya existe una regla activa equivalente. Desactive la existente o cambie la prioridad.';
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
    return err.message || 'No fue posible guardar la regla.';
  }
  return 'Error inesperado. Intente nuevamente.';
}

export function AdminPricingRuleEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id) && id !== 'nueva';
  const ruleId = isEditing ? (id as string) : undefined;

  const { data, isLoading, isError, error } = usePricingRule(ruleId);
  const createMutation = useCreatePricingRule();
  const updateMutation = useUpdatePricingRule(ruleId ?? '');

  const [serverError, setServerError] = useState<string | null>(null);

  if (isEditing && isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Cargando regla..." />
      </div>
    );
  }

  if (isEditing && isError) {
    return (
      <ErrorState
        title="No pudimos cargar la regla"
        description={error instanceof Error ? error.message : 'Intente nuevamente.'}
        action={
          <Link to="/admin/reglas-precio">
            <Button variant="ghost">Volver al listado</Button>
          </Link>
        }
      />
    );
  }

  const rule = data?.rule;
  if (isEditing && !rule) {
    return (
      <ErrorState
        title="Regla no encontrada"
        description="La regla solicitada no existe o fue eliminada."
        action={
          <Link to="/admin/reglas-precio">
            <Button variant="ghost">Volver al listado</Button>
          </Link>
        }
      />
    );
  }

  const submitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (
    payload: CreatePricingRulePayload | UpdatePricingRulePayload,
  ) => {
    setServerError(null);
    try {
      if (ruleId) {
        await updateMutation.mutateAsync(payload as UpdatePricingRulePayload);
        navigate('/admin/reglas-precio', { replace: true });
      } else {
        await createMutation.mutateAsync(payload as CreatePricingRulePayload);
        navigate('/admin/reglas-precio', { replace: true });
      }
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    }
  };

  const pageTitle = isEditing
    ? `Editar regla${rule ? `: ${rule.name}` : ''}`
    : 'Nueva regla';

  const submitLabel = isEditing ? 'Guardar cambios' : 'Crear regla';

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <Link to="/admin/reglas-precio" className={styles.backLink}>
          ← Volver al listado
        </Link>
        <h1>{pageTitle}</h1>
      </header>

      <Card>
        <PricingRuleForm
          initial={rule}
          submitLabel={submitLabel}
          submitting={submitting}
          serverError={serverError}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/reglas-precio')}
        />
      </Card>
    </div>
  );
}
