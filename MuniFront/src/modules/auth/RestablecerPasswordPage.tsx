import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Logo } from '@/components/Logo/Logo';
import { Button } from '@/components/Button/Button';
import { Input } from '@/components/Input/Input';
import { ApiError } from '@/services/api';
import { authApi } from '@/services/auth.api';
import headerImage from '@/assets/HeaderBuchardo2.png';
import loginStyles from './LoginPage.module.css';

type Status = 'checking' | 'valid' | 'invalid';

interface FormState {
  password: string;
  passwordConfirm: string;
  errors: { password?: string; passwordConfirm?: string };
}

const initialForm: FormState = {
  password: '',
  passwordConfirm: '',
  errors: {},
};

function validate(values: Omit<FormState, 'errors'>): FormState['errors'] {
  const errors: FormState['errors'] = {};
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

export function RestablecerPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>('checking');
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (!token) {
        setStatus('invalid');
        return;
      }
      try {
        const result = await authApi.validateResetToken(token);
        if (cancelled) return;
        setStatus(result.valid ? 'valid' : 'invalid');
      } catch {
        if (!cancelled) setStatus('invalid');
      }
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    const errors = validate({
      password: form.password,
      passwordConfirm: form.passwordConfirm,
    });
    if (Object.keys(errors).length > 0) {
      setForm((f) => ({ ...f, errors }));
      return;
    }
    if (!token) return;
    setSubmitting(true);
    try {
      await authApi.resetPassword(token, form.password);
      setSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message || 'No fue posible restablecer la contraseña');
      } else {
        setSubmitError('Error inesperado');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const TitleText =
    status === 'checking'
      ? 'Verificando enlace…'
      : status === 'invalid'
        ? 'Enlace inválido o expirado'
        : success
          ? 'Contraseña actualizada'
          : 'Restablecer contraseña';

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
            Seguridad de la cuenta
          </span>
          <h1 className={loginStyles.heroTitle}>
            Elegí una{' '}
            <span className={loginStyles.heroTitleAccent}>contraseña nueva</span>
          </h1>
          <p className={loginStyles.heroSubtitle}>
            Usá al menos 8 caracteres y evitá compartirla. Por seguridad, te
            recomendamos no reutilizar contraseñas de otros servicios.
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
            <h1 className={loginStyles.title}>{TitleText}</h1>
            {status === 'checking' ? null : status === 'invalid' ? (
              <>
                <p className={loginStyles.subtitle}>
                  El enlace que abriste ya no es válido. Solicitá uno nuevo y
                  usalo antes de que expire.
                </p>
                <div className={loginStyles.footer}>
                  <Link to="/recuperar">Solicitar un nuevo enlace</Link>
                </div>
              </>
            ) : success ? (
              <>
                <p className={loginStyles.subtitle}>
                  Tu contraseña fue actualizada correctamente.
                </p>
                <Button
                  type="button"
                  block
                  size="lg"
                  onClick={() => navigate('/login', { replace: true })}
                >
                  Iniciar sesión
                </Button>
              </>
            ) : (
              <>
                <p className={loginStyles.subtitle}>
                  Ingresá una nueva contraseña para tu cuenta.
                </p>
                <form className={loginStyles.form} onSubmit={onSubmit} noValidate>
                  <Input
                    label="Nueva contraseña"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        password: e.target.value,
                        errors: { ...f.errors, password: undefined },
                      }))
                    }
                    error={form.errors.password}
                  />
                  <Input
                    label="Repetir contraseña"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={form.passwordConfirm}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        passwordConfirm: e.target.value,
                        errors: { ...f.errors, passwordConfirm: undefined },
                      }))
                    }
                    error={form.errors.passwordConfirm}
                  />
                  {submitError && (
                    <div className={loginStyles.errorBox} role="alert">
                      {submitError}
                    </div>
                  )}
                  <Button type="submit" block size="lg" loading={submitting}>
                    Guardar contraseña
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
