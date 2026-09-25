import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/Input/Input';
import { Button } from '@/components/Button/Button';
import {
  PRODUCT_TYPE_OPTIONS,
  type CreateProductPayload,
  type Product,
  type UpdateProductPayload,
} from '../types/products.types';
import {
  productFormSchema,
  type ProductFormValues,
} from './ProductForm.schema';
import {
  defaultProductFormValues,
  toCreatePayload,
  toUpdatePayload,
} from './ProductForm.helpers';
import styles from './ProductForm.module.css';

export interface ProductFormProps {
  initial?: Product;
  submitLabel: string;
  submitting?: boolean;
  serverError?: string | null;
  onSubmit: (payload: CreateProductPayload | UpdateProductPayload) => void;
  onCancel?: () => void;
}

export function ProductForm({
  initial,
  submitLabel,
  submitting,
  serverError,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const { register, handleSubmit, formState, control } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultProductFormValues(initial),
    mode: 'onBlur',
  });
  const errors = formState.errors;

  const handleFormSubmit = (values: ProductFormValues) => {
    const payload = initial ? toUpdatePayload(values) : toCreatePayload(values);
    onSubmit(payload);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Identificación</h3>
        <div className={styles.gridTwo}>
          <Input
            label="Código"
            {...register('code')}
            error={errors.code?.message}
            hint="Mayúsculas, números y guion bajo (ej. AGUA_RECARGA)"
            autoComplete="off"
          />
          <Input
            label="Nombre"
            {...register('name')}
            error={errors.name?.message}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="description">Descripción (opcional)</label>
          <textarea
            id="description"
            className={styles.select}
            rows={3}
            {...register('description')}
          />
          {errors.description?.message && (
            <span className={styles.error}>{errors.description.message}</span>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Tipo y precio</h3>
        <div className={styles.gridTwo}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="productType">Tipo de producto</label>
            <select
              id="productType"
              className={styles.select}
              {...register('productType')}
            >
              {PRODUCT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.productType?.message && (
              <span className={styles.error}>{errors.productType.message}</span>
            )}
          </div>
          <Input
            label="Precio base (ARS)"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            {...register('basePriceArs')}
            error={errors.basePriceArs?.message}
            hint="Importe en pesos, con hasta 2 decimales"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Estado</h3>
        <Controller
          control={control}
          name="tracksStock"
          render={({ field }) => (
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={Boolean(field.value)}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              <span>Controla stock</span>
            </label>
          )}
        />
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
              <span>Producto activo</span>
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
