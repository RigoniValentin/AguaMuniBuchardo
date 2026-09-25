import { useEffect, useState } from 'react';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Spinner } from '@/components/Spinner/Spinner';
import { Input } from '@/components/Input/Input';
import { Button } from '@/components/Button/Button';
import {
  CITIZEN_CLIENT_TYPE_LABEL,
  DOCUMENT_TYPE_LABEL,
  formatCitizenAddress,
  type CitizenClient,
  type UpdateMyClientPayload,
} from '@/modules/ciudadano/shared/client.types';
import { useMyClient, useUpdateMyClient } from '@/modules/ciudadano/shared/useMyClient';
import { ApiError } from '@/services/api';
import styles from './CiudadanoPerfilPage.module.css';

interface FormState {
  phone: string;
  email: string;
  street: string;
  number: string;
  floor: string;
  apartment: string;
  neighborhood: string;
  postalCode: string;
  references: string;
}

function clientToFormState(c: CitizenClient): FormState {
  return {
    phone: c.phone ?? '',
    email: c.email ?? '',
    street: c.address.street,
    number: c.address.number,
    floor: c.address.floor ?? '',
    apartment: c.address.apartment ?? '',
    neighborhood: c.address.neighborhood ?? '',
    postalCode: c.address.postalCode ?? '',
    references: c.address.references ?? '',
  };
}

function isClientNotLinked(err: unknown): boolean {
  return Boolean((err as { code?: string } | null)?.code === 'CLIENT_NOT_LINKED');
}

export function CiudadanoPerfilPage() {
  const {
    data: clientData,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyClient();

  const update = useUpdateMyClient();
  const [form, setForm] = useState<FormState | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (clientData?.client && !form) {
      setForm(clientToFormState(clientData.client));
    }
  }, [clientData, form]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Cargando tu perfil..." />
      </div>
    );
  }

  if (isError && isClientNotLinked(error)) {
    return (
      <Card>
        <CardTitle>Tu cuenta no está vinculada</CardTitle>
        <CardSubtitle>
          No pudimos encontrar un cliente asociado a tu usuario. Contactá a la
          Municipalidad para habilitar el acceso.
        </CardSubtitle>
      </Card>
    );
  }

  if (isError || !clientData || !form) {
    return (
      <ErrorState
        title="No pudimos cargar tu perfil"
        description={error instanceof Error ? error.message : 'Intente nuevamente.'}
        onRetry={() => refetch()}
      />
    );
  }

  const client = clientData.client;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    setSubmitError(null);

    const trimmed = (v: string) => v.trim();
    const trimmedOrNull = (v: string) => {
      const t = v.trim();
      return t.length === 0 ? null : t;
    };

    const payload: UpdateMyClientPayload = {
      phone: trimmedOrNull(form.phone),
      email: trimmedOrNull(form.email),
      address: {
        street: trimmed(form.street),
        number: trimmed(form.number),
        floor: trimmedOrNull(form.floor),
        apartment: trimmedOrNull(form.apartment),
        neighborhood: trimmedOrNull(form.neighborhood),
        postalCode: trimmedOrNull(form.postalCode),
        references: trimmedOrNull(form.references),
      },
    };

    try {
      await update.mutateAsync(payload);
      setSuccess(true);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos guardar los cambios.',
      );
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <h1>Mi perfil</h1>
        <p>
          Mantené tus datos de contacto y domicilio al día.
        </p>
      </header>

      <Card>
        <CardTitle>Datos de identificación</CardTitle>
        <CardSubtitle>
          Estos datos los administra la Municipalidad. Si necesitás modificar
          tu nombre, documento, localidad o tipo de cliente, comunicate con
          nosotros.
        </CardSubtitle>
        <dl className={styles.readonly}>
          <div>
            <dt>Nombre</dt>
            <dd>{client.firstName}</dd>
          </div>
          <div>
            <dt>Apellido</dt>
            <dd>{client.lastName}</dd>
          </div>
          <div>
            <dt>Documento</dt>
            <dd>
              {DOCUMENT_TYPE_LABEL[client.documentType]} {client.documentNumber}
            </dd>
          </div>
          <div>
            <dt>Tipo de cliente</dt>
            <dd>{CITIZEN_CLIENT_TYPE_LABEL[client.clientType]}</dd>
          </div>
          <div>
            <dt>Localidad</dt>
            <dd>{client.address.locality}</dd>
          </div>
        </dl>
        <p className={styles.protectedNotice}>
          Para modificar tu nombre, documento, localidad o tipo de cliente,
          comunicate con la Municipalidad.
        </p>
      </Card>

      <Card>
        <CardTitle>Datos de contacto y domicilio</CardTitle>
        <CardSubtitle>
          Domicilio registrado: {formatCitizenAddress(client.address)}
        </CardSubtitle>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.row}>
            <Input
              label="Teléfono"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              inputMode="tel"
              autoComplete="tel"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
          </div>

          <div className={styles.row}>
            <Input
              label="Calle"
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              required
              autoComplete="street-address"
            />
            <Input
              label="Número"
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })}
              required
              autoComplete="address-line2"
            />
          </div>

          <div className={styles.row}>
            <Input
              label="Piso"
              value={form.floor}
              onChange={(e) => setForm({ ...form, floor: e.target.value })}
            />
            <Input
              label="Departamento"
              value={form.apartment}
              onChange={(e) => setForm({ ...form, apartment: e.target.value })}
            />
          </div>

          <div className={styles.row}>
            <Input
              label="Barrio"
              value={form.neighborhood}
              onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
            />
            <Input
              label="Código postal"
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              autoComplete="postal-code"
            />
          </div>

          <Input
            label="Referencias"
            value={form.references}
            onChange={(e) => setForm({ ...form, references: e.target.value })}
            hint="Ej: Casa esquina, portón negro, etc."
          />

          <div className={styles.actions}>
            <Button
              type="submit"
              loading={update.isPending}
              disabled={update.isPending}
            >
              Guardar cambios
            </Button>
            {success && (
              <span className={styles.successMsg} role="status">
                Cambios guardados.
              </span>
            )}
            {submitError && (
              <span className={styles.errorMsg} role="alert">
                {submitError}
              </span>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}