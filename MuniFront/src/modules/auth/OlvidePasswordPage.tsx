import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo/Logo';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { ApiError } from '@/services/api';
import { authApi } from '@/services/auth.api';
import headerImage from '@/assets/HeaderBuchardo2.png';
import loginStyles from './LoginPage.module.css';

interface FormState {
  email: string;
  error?: string;
}

const initialForm: FormState = { email: '' };

function validate(values: FormState): string | undefined {
  if (!values.email.trim()) return 'El email es obligatorio';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return 'Email inválido';
  return undefined;
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

export function OlvidePasswordPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    const error = validate(form);
    if (error) {
      setForm((f) => ({ ...f, error }));
      return;
    }
    setSubmitting(true);
    try {
      await authApi.forgotPassword(form.email.trim());
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message || 'No fue posible procesar la solicitud');
      } else {
        setSubmitError('Error inesperado');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={loginStyles.page}>
      <aside
        className={loginStyles.hero}
        aria-hidden="false"
        style={{ backgroundImage: `url(${headerImage})` }}
      >
        <div className={loginStyles.heroOrb} />

        <div className={loginStyles.heroBrand}>
          <Logo size="lg" inverted variant="both" showText={false} />
          <span className={loginStyles.heroEyebrow}>
            <span className={loginStyles.heroEyebrowDot} aria-hidden="true" />
            Soporte de cuenta
          </span>
          <h1 className={loginStyles.heroTitle}>
            Recuperá el{' '}
            <span className={loginStyles.heroTitleAccent}>acceso a tu cuenta</span>
          </h1>
          <p className={loginStyles.heroSubtitle}>
            Te enviaremos un enlace seguro a tu email para que puedas
            definir una nueva contraseña. El enlace caduca por seguridad.
          </p>
        </div>

        <div className={loginStyles.heroFooter}>
          <span>Municipalidad de Buchardo</span>
          <span>· Plataforma digital · v1</span>
        </div>
      </aside>

      <section className={loginStyles.formPanel}>
        <div className={loginStyles.formInner}>
          <Link to="/login" className={loginStyles.backLink}>
            <BackIcon /> Volver a iniciar sesión
          </Link>

          <div className={loginStyles.card}>
            <h1 className={loginStyles.title}>¿Olvidaste tu contraseña?</h1>
            <p className={loginStyles.subtitle}>
              Ingresá el email con el que te registraste y te enviaremos un
              enlace para restablecerla.
            </p>

            {submitted ? (
              <div role="status" aria-live="polite">
                <p style={{ marginBottom: 'var(--space-4)' }}>
                  Si el email está registrado en nuestra plataforma, vas a
                  recibir un mensaje con un enlace para restablecer tu
                  contraseña en los próximos minutos.
                </p>
                <p
                  style={{
                    color: 'var(--color-text-muted)',
                    fontSize: 'var(--font-size-sm)',
                    margin: 0,
                  }}
                >
                  Revisá tu bandeja de entrada y, si no aparece, también la
                  carpeta de correo no deseado.
                </p>
                <div className={loginStyles.footer}>
                  <Link to="/login">Volver a iniciar sesión</Link>
                </div>
              </div>
            ) : (
              <form className={loginStyles.form} onSubmit={onSubmit} noValidate>
                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@buchardo.gob.ar"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      email: e.target.value,
                      error: undefined,
                    }))
                  }
                  error={form.error}
                />
                {submitError && (
                  <div className={loginStyles.errorBox} role="alert">
                    {submitError}
                  </div>
                )}
                <Button type="submit" block size="lg" loading={submitting}>
                  Enviar enlace de recuperación
                </Button>
              </form>
            )}

            {!submitted && (
              <div className={loginStyles.footer}>
                <Link to="/login">Volver a iniciar sesión</Link>
              </div>
            )}
          </div>

          <p className={loginStyles.formPanelFooter}>
            Por seguridad, no enviamos la contraseña actual. Si recibís un
            email que no solicitaste, podés ignorarlo.
          </p>
        </div>
      </section>
    </div>
  );
}
