import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/Input/Input';
import { Button } from '@/components/Button/Button';
import {
  CLIENT_TYPE_OPTIONS,
  DOCUMENT_TYPE_OPTIONS,
  type Client,
  type CreateClientPayload,
  type UpdateClientPayload,
} from '../types/clients.types';
import {
  clientFormSchema,
  type ClientFormValues,
} from './ClientForm.schema';
import {
  defaultClientFormValues,
  toPayload,
} from './ClientForm.helpers';
import styles from './ClientForm.module.css';

export interface ClientFormProps {
  initial?: Client;
  submitLabel: string;
  submitting?: boolean;
  serverError?: string | null;
  onSubmit: (payload: CreateClientPayload | UpdateClientPayload) => void;
  onCancel?: () => void;
}

export function ClientForm({
  initial,
  submitLabel,
  submitting,
  serverError,
  onSubmit,
  onCancel,
}: ClientFormProps) {
  const { register, handleSubmit, formState, control } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: defaultClientFormValues(initial),
    mode: 'onBlur',
  });
  const errors = formState.errors;

  const handleFormSubmit = (values: ClientFormValues) => {
    onSubmit(toPayload(values));
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Datos personales</h3>
        <div className={styles.gridTwo}>
          <Input
            label="Nombre"
            {...register('firstName')}
            error={errors.firstName?.message}
            autoComplete="given-name"
          />
          <Input
            label="Apellido"
            {...register('lastName')}
            error={errors.lastName?.message}
            autoComplete="family-name"
          />
          <div className={styles.field}>
            <label className={styles.label} htmlFor="documentType">Tipo de documento</label>
            <select id="documentType" className={styles.select} {...register('documentType')}>
              {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.documentType?.message && (
              <span className={styles.error}>{errors.documentType.message}</span>
            )}
          </div>
          <Input
            label="Número de documento"
            {...register('documentNumber')}
            error={errors.documentNumber?.message}
          />
          <Input
            label="Teléfono"
            type="tel"
            {...register('phone')}
            error={errors.phone?.message}
            autoComplete="tel"
          />
          <Input
            label="Email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            autoComplete="email"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Tipo de cliente</h3>
        <Controller
          control={control}
          name="clientType"
          render={({ field }) => (
            <div className={styles.typeGrid}>
              {CLIENT_TYPE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`${styles.typeOption} ${field.value === opt.value ? styles.typeOptionActive : ''}`}
                >
                  <input
                    type="radio"
                    value={opt.value}
                    checked={field.value === opt.value}
                    onChange={() => field.onChange(opt.value)}
                    onBlur={field.onBlur}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          )}
        />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Dirección</h3>
        <div className={styles.gridTwo}>
          <Input label="Calle" {...register('address.street')} error={errors.address?.street?.message} />
          <Input label="Número" {...register('address.number')} error={errors.address?.number?.message} />
          <Input label="Piso" {...register('address.floor')} error={errors.address?.floor?.message} />
          <Input label="Departamento" {...register('address.apartment')} error={errors.address?.apartment?.message} />
          <Input label="Barrio" {...register('address.neighborhood')} error={errors.address?.neighborhood?.message} />
          <Input label="Localidad" {...register('address.locality')} error={errors.address?.locality?.message} />
          <Input label="Código postal" {...register('address.postalCode')} error={errors.address?.postalCode?.message} />
          <Input label="Referencia" {...register('address.references')} error={errors.address?.references?.message} />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Reparto</h3>
        <div className={styles.field}>
          <Input
            label="Zona de reparto"
            placeholder="Ej: ZONA 1"
            {...register('zona')}
            error={errors.zona?.message}
            hint='Etiqueta del padrón municipal (ej. "ZONA 1", "ZONA 2"). Define los días que pasa el repartidor.'
          />
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Observaciones</h3>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="notes">Notas internas (opcional)</label>
          <textarea id="notes" className={styles.textarea} rows={3} {...register('notes')} />
          {errors.notes?.message && (
            <span className={styles.error}>{errors.notes.message}</span>
          )}
        </div>
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
              <span>Cliente activo</span>
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
