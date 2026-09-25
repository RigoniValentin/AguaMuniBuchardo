import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/auth-context';
import { Logo } from '@/components/Logo/Logo';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { ApiError } from '@/services/api';
import { defaultRouteForRole } from '@/router/role-routes';
import headerImage from '@/assets/HeaderBuchardo2.png';
import styles from './LoginPage.module.css';

interface FormState {
  email: string;
  password: string;
  errors: { email?: string; password?: string };
}

const initialForm: FormState = {
  email: '',
  password: '',
  errors: {},
};

function validate(values: { email: string; password: string }): FormState['errors'] {
  const errors: FormState['errors'] = {};
  if (!values.email.trim()) {
    errors.email = 'El email es obligatorio';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Email inválido';
  }
  if (!values.password) {
    errors.password = 'La contraseña es obligatoria';
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

export function LoginPage() {
  const { login, user, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && user) {
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
      const target = from && from !== '/login' ? from : defaultRouteForRole(user.role);
      navigate(target, { replace: true });
    }
  }, [status, user, navigate, location.state]);

  const handleChange = (field: 'email' | 'password') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value, errors: { ...f.errors, [field]: undefined } }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    const errors = validate({ email: form.email, password: form.password });
    if (Object.keys(errors).length > 0) {
      setForm((f) => ({ ...f, errors }));
      return;
    }
    setSubmitting(true);
    try {
      await login(form.email.trim(), form.password);
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message || 'No fue posible iniciar sesión');
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
            Plataforma oficial
          </span>
          <h1 className={styles.heroTitle}>
            Bienvenido a la <span className={styles.heroTitleAccent}>Municipalidad Digital</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Un único portal para que el municipio, los repartidores y los vecinos
            gestionen pedidos, pagos y cuentas corrientes de agua con trazabilidad total.
          </p>

          <ul className={styles.heroFeatures}>
            <li className={styles.heroFeature}>
              <span className={styles.heroFeatureIcon}>
                <FeatureIcon name="shield" />
              </span>
              <div>
                <p className={styles.heroFeatureTitle}>Acceso seguro</p>
                <p className={styles.heroFeatureDesc}>
                  Credenciales municipales con permisos por rol y operación auditada.
                </p>
              </div>
            </li>
            <li className={styles.heroFeature}>
              <span className={styles.heroFeatureIcon}>
                <FeatureIcon name="route" />
              </span>
              <div>
                <p className={styles.heroFeatureTitle}>Reparto en ruta</p>
                <p className={styles.heroFeatureDesc}>
                  Listado diario de clientes, deudas y entregas para cada repartidor.
                </p>
              </div>
            </li>
            <li className={styles.heroFeature}>
              <span className={styles.heroFeatureIcon}>
                <FeatureIcon name="card" />
              </span>
              <div>
                <p className={styles.heroFeatureTitle}>Pagos y cuenta corriente</p>
                <p className={styles.heroFeatureDesc}>
                  Comprobantes, aprobaciones y saldos siempre a un click de distancia.
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className={styles.heroFooter}>
          <span>Municipalidad de Buchardo</span>
          <span>· Plataforma digital · v1</span>
        </div>
      </aside>

      <section className={styles.formPanel}>
        <div className={styles.formInner}>
          <Link to="/" className={styles.backLink}>
            <BackIcon /> Volver al inicio
          </Link>

          <div className={styles.card}>
            <h1 className={styles.title}>Iniciar sesión</h1>
            <p className={styles.subtitle}>
              Ingresá tus credenciales para acceder a la plataforma.
            </p>

            <form className={styles.form} onSubmit={onSubmit} noValidate>
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="usuario@buchardo.gob.ar"
                value={form.email}
                onChange={handleChange('email')}
                error={form.errors.email}
              />
              <Input
                label="Contraseña"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange('password')}
                error={form.errors.password}
              />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Link
                  to="/recuperar"
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              {submitError && (
                <div className={styles.errorBox} role="alert">
                  {submitError}
                </div>
              )}
              <Button type="submit" block size="lg" loading={submitting}>
                Ingresar
              </Button>
            </form>

            <div className={styles.footer}>
              <Link to="/registro">¿No tienes una? Creemosla</Link>
            </div>
          </div>

          <p className={styles.formPanelFooter}>
            ¿Sos vecino? La Municipalidad vinculará tu usuario al padrón para que puedas acceder.
          </p>
        </div>
      </section>
    </div>
  );
}