import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/auth-context';
import { Logo } from '@/components/Logo/Logo';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { ApiError } from '@/services/api';
import { defaultRouteForRole } from '@/router/role-routes';
import headerImage from '@/assets/HeaderBuchardo2.png';
import styles from './RegistroPage.module.css';

interface FormState {
  firstName: string;
  lastName: string;
  documentNumber: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  errors: Partial<Record<keyof Omit<FormState, 'errors'>, string>>;
}

const initialForm: FormState = {
  firstName: '',
  lastName: '',
  documentNumber: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
  errors: {},
};

function onlyDigits(value: string): string {
  return value.replace(/\D+/g, '');
}

function validate(values: Omit<FormState, 'errors'>): FormState['errors'] {
  const errors: FormState['errors'] = {};
  if (!values.firstName.trim()) errors.firstName = 'El nombre es obligatorio';
  if (!values.lastName.trim()) errors.lastName = 'El apellido es obligatorio';
  if (!values.documentNumber.trim()) {
    errors.documentNumber = 'El DNI es obligatorio';
  } else if (!/^\d{6,12}$/.test(onlyDigits(values.documentNumber))) {
    errors.documentNumber = 'DNI inválido (solo números, 6-12 dígitos)';
  }
  if (!values.email.trim()) {
    errors.email = 'El email es obligatorio';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Email inválido';
  }
  if (!values.phone.trim()) {
    errors.phone = 'El teléfono es obligatorio';
  } else if (values.phone.replace(/\D/g, '').length < 6) {
    errors.phone = 'Teléfono demasiado corto';
  }
  if (!values.password) {
    errors.password = 'La contraseña es obligatoria';
  } else if (values.password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres';
  }
  if (values.password !== values.passwordConfirm) {
    errors.passwordConfirm = 'Las contraseñas no coinciden';
  }
  return errors;
}

function FeatureIcon({ name }: { name: 'shield' | 'route' | 'card' }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (name) {
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3 4 6v6c0 4.5 3.4 8.4 8 9 4.6-.6 8-4.5 8-9V6l-8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case 'route':
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="2.5" />
          <circle cx="18" cy="18" r="2.5" />
          <path d="M6 8.5v3a4 4 0 0 0 4 4h4a4 4 0 0 1 4 4v-1.5" />
        </svg>
      );
    case 'card':
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 15h4" />
        </svg>
      );
  }
}

function BackIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </svg>
  );
}

export function RegistroPage() {
  const { register, user, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ linked: boolean } | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && user) {
      const target = defaultRouteForRole(user.role);
      navigate(target, { replace: true });
    }
  }, [status, user, navigate]);

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [field]: value, errors: { ...f.errors, [field]: undefined } }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(null);

    const values = {
      firstName: form.firstName,
      lastName: form.lastName,
      documentNumber: form.documentNumber,
      email: form.email,
      phone: form.phone,
      password: form.password,
      passwordConfirm: form.passwordConfirm,
    };
    const errors = validate(values);
    if (Object.keys(errors).length > 0) {
      setForm((f) => ({ ...f, errors }));
      return;
    }

    setSubmitting(true);
    try {
      const result = await register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
        phone: values.phone.trim(),
        documentNumber: onlyDigits(values.documentNumber),
      });
      setSuccess({ linked: result.linked });
      void location;
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message || 'No fue posible crear la cuenta');
      } else {
        setSubmitError('Error inesperado');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <aside
        className={styles.hero}
        aria-hidden="false"
        style={{ backgroundImage: `url(${headerImage})` }}
      >
        <div className={styles.heroOrb} />

        <div className={styles.heroBrand}>
          <Logo size="lg" inverted variant="both" showText={false} />
          <span className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowDot} aria-hidden="true" />
            Portal ciudadano
          </span>
          <h1 className={styles.heroTitle}>
            Creá tu <span className={styles.heroTitleAccent}>cuenta ciudadana</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Registrate para consultar tu saldo, hacer pedidos y subir pagos desde
            cualquier dispositivo. Si ya estás en el padrón municipal, vinculamos
            tu cuenta automáticamente con tu dni/teléfono.
          </p>

          <ul className={styles.heroFeatures}>
            <li className={styles.heroFeature}>
              <span className={styles.heroFeatureIcon}>
                <FeatureIcon name="shield" />
              </span>
              <div>
                <p className={styles.heroFeatureTitle}>Vinculación segura</p>
                <p className={styles.heroFeatureDesc}>
                  Solo se vincula automáticamente con el padrón. Para casos
                  nuevos, pasás por la muni con tu DNI.
                </p>
              </div>
            </li>
            <li className={styles.heroFeature}>
              <span className={styles.heroFeatureIcon}>
                <FeatureIcon name="route" />
              </span>
              <div>
                <p className={styles.heroFeatureTitle}>Pedidos en línea</p>
                <p className={styles.heroFeatureDesc}>
                  Hacé pedidos del reparto y pagá desde donde estés.
                </p>
              </div>
            </li>
            <li className={styles.heroFeature}>
              <span className={styles.heroFeatureIcon}>
                <FeatureIcon name="card" />
              </span>
              <div>
                <p className={styles.heroFeatureTitle}>Trazabilidad total</p>
                <p className={styles.heroFeatureDesc}>
                  Cada movimiento queda registrado en tu cuenta corriente.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className={styles.heroFooter}>
          <span>Municipalidad de Buchardo</span>
          <span>· Portal ciudadano · v1</span>
        </div>
      </aside>

      <section className={styles.formPanel}>
        <div className={styles.formInner}>
          <Link to="/" className={styles.backLink}>
            <BackIcon /> Volver al inicio
          </Link>

          <div className={styles.card}>
            <h1 className={styles.title}>Crear cuenta</h1>
            <p className={styles.subtitle}>
              Empezá a autogestionar tus servicios municipales.
            </p>

            <form className={styles.form} onSubmit={onSubmit} noValidate>
              <div className={styles.row}>
                <Input
                  label="Nombre"
                  autoComplete="given-name"
                  placeholder="Juan"
                  value={form.firstName}
                  onChange={(e) => setField('firstName', e.target.value)}
                  error={form.errors.firstName}
                />
                <Input
                  label="Apellido"
                  autoComplete="family-name"
                  placeholder="Pérez"
                  value={form.lastName}
                  onChange={(e) => setField('lastName', e.target.value)}
                  error={form.errors.lastName}
                />
              </div>

              <Input
                label="DNI"
                autoComplete="off"
                placeholder="12.345.678"
                value={form.documentNumber}
                onChange={(e) => setField('documentNumber', e.target.value)}
                error={form.errors.documentNumber}
                hint="Si estás en el padrón, vinculamos tu cuenta automáticamente con tu dni/teléfono."
              />

              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="usuario@buchardo.gob.ar"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                error={form.errors.email}
              />

              <Input
                label="Teléfono"
                autoComplete="tel"
                placeholder="+54 358 555 0000"
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                error={form.errors.phone}
              />

              <div className={styles.row}>
                <Input
                  label="Contraseña"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setField('password', e.target.value)}
                  error={form.errors.password}
                />
                <Input
                  label="Repetir contraseña"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={form.passwordConfirm}
                  onChange={(e) => setField('passwordConfirm', e.target.value)}
                  error={form.errors.passwordConfirm}
                />
              </div>

              {submitError && (
                <div className={styles.errorBox} role="alert">
                  {submitError}
                </div>
              )}
              {success && (
                <div className={styles.successBox} role="status">
                  {success.linked
                    ? 'Cuenta creada y vinculada automáticamente al padrón. Te llevamos al portal…'
                    : 'Cuenta creada. La Municipalidad confirmará la vinculación al padrón en las próximas horas. Te llevamos al portal…'}
                </div>
              )}

              <Button type="submit" block size="lg" loading={submitting}>
                Crear cuenta
              </Button>
            </form>

            <div className={styles.footer}>
              ¿Ya tenés cuenta? <Link to="/login">Iniciar sesión</Link>
            </div>
          </div>

          <p className={styles.formPanelFooter}>
            Al crear tu cuenta aceptás el tratamiento de tus datos personales
            conforme a la Ley 25.326 y la política de privacidad municipal.
          </p>
        </div>
      </section>
    </div>
  );
}
