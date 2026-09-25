import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/Input/Input';
import { Button } from '@/components/Button/Button';
import {
  CLIENT_TYPE_OPTIONS,
  PRICING_SCOPE_OPTIONS,
  PRODUCT_TYPE_OPTIONS,
  type CreatePricingRulePayload,
  type PricingRule,
  type UpdatePricingRulePayload,
} from '../types/pricing-rules.types';
import {
  pricingRuleFormSchema,
  type PricingRuleFormValues,
} from './PricingRuleForm.schema';
import {
  defaultPricingRuleFormValues,
  toPricingRulePayload,
} from './PricingRuleForm.helpers';
import { productsApi } from '../../products/services/products.api';
import styles from './PricingRuleForm.module.css';

export interface PricingRuleFormProps {
  initial?: PricingRule;
  submitLabel: string;
  submitting?: boolean;
  serverError?: string | null;
  onSubmit: (payload: CreatePricingRulePayload | UpdatePricingRulePayload) => void;
  onCancel?: () => void;
}

export function PricingRuleForm({
  initial,
  submitLabel,
  submitting,
  serverError,
  onSubmit,
  onCancel,
}: PricingRuleFormProps) {
  const { register, handleSubmit, formState, control } = useForm<PricingRuleFormValues>({
    resolver: zodResolver(pricingRuleFormSchema),
    defaultValues: defaultPricingRuleFormValues(initial),
    mode: 'onBlur',
  });
  const errors = formState.errors;
  const scope = useWatch({ control, name: 'scope' });

  const { data: productsData } = useQuery({
    queryKey: ['pricing-rule-form', 'products'],
    queryFn: () => productsApi.list({ active: true, limit: 100, sortBy: 'name', sortOrder: 'asc' }),
  });

  const handleFormSubmit = (values: PricingRuleFormValues) => {
    onSubmit(toPricingRulePayload(values));
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Datos básicos</h3>
        <div className={styles.gridTwo}>
          <Input
            label="Nombre"
            {...register('name')}
            error={errors.name?.message}
          />
          <div className={styles.field}>
            <label className={styles.label} htmlFor="clientType">Tipo de cliente</label>
            <select id="clientType" className={styles.select} {...register('clientType')}>
              {CLIENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.clientType?.message && (
              <span className={styles.error}>{errors.clientType.message}</span>
            )}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Alcance</h3>
        <div className={styles.gridTwo}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="scope">Alcance</label>
            <select id="scope" className={styles.select} {...register('scope')}>
              {PRICING_SCOPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.scope?.message && (
              <span className={styles.error}>{errors.scope.message}</span>
            )}
          </div>

          {scope === 'PRODUCT_TYPE' && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="productType">Tipo de producto</label>
              <select id="productType" className={styles.select} {...register('productType')}>
                <option value="">Seleccione…</option>
                {PRODUCT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.productType?.message && (
                <span className={styles.error}>{errors.productType.message}</span>
              )}
            </div>
          )}

          {scope === 'PRODUCT' && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="productId">Producto</label>
              <select id="productId" className={styles.select} {...register('productId')}>
                <option value="">Seleccione…</option>
                {productsData?.items.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
              {errors.productId?.message && (
                <span className={styles.error}>{errors.productId.message}</span>
              )}
            </div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Ajuste</h3>
        <div className={styles.gridTwo}>
          <Input
            label="Ajuste %"
            type="number"
            step="1"
            {...register('adjustmentValue', { valueAsNumber: true })}
            error={errors.adjustmentValue?.message}
            hint="Negativo = descuento, positivo = recargo. Mínimo -100, máximo 1000."
          />
          <Input
            label="Prioridad"
            type="number"
            step="1"
            {...register('priority', { valueAsNumber: true })}
            error={errors.priority?.message}
            hint="Mayor prioridad gana dentro de la misma especificidad."
          />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Estado</h3>
        <Controller
          control={control}
          name="active"
          render={({ field }) => (
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={Boolean(field.value)}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              <span>Regla activa</span>
            </label>
          )}
        />
      </section>

      {serverError && (
        <div className={styles.serverError} role="alert">{serverError}</div>
      )}

      <div className={styles.actions}>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
