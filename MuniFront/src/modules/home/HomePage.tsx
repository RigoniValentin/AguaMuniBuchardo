import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { Button } from '@/components/Button/Button';
import { Spinner } from '@/components/Spinner/Spinner';
import { Badge } from '@/components/Badge/Badge';
import { Logo } from '@/components/Logo/Logo';
import { healthApi } from '@/services/health.api';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import headerImage from '@/assets/HeaderBuchardo.jpg';
import styles from './HomePage.module.css';

interface AccessCard {
  to: string;
  title: string;
  description: string;
  cta: string;
  icon: 'admin' | 'route' | 'user';
  tone: 'primary' | 'accent' | 'success';
}

const ACCESS_CARDS: AccessCard[] = [
  {
    to: '/registro',
    title: 'Ciudadano',
    description: 'Pedidos, pagos y cuenta corriente en un solo lugar.',
    cta: 'Crear mi cuenta',
    icon: 'user',
    tone: 'success',
  },
  {
    to: '/login',
    title: 'Repartidores',
    description: 'Gestioná tu ruta diaria de entregas.',
    cta: 'Abrir mi ruta',
    icon: 'route',
    tone: 'accent',
  },
  {
    to: '/login',
    title: 'Personal municipal',
    description: 'Operadores y administradores del municipio.',
    cta: 'Ingresar al panel',
    icon: 'admin',
    tone: 'primary',
  },
];

interface Step {
  number: string;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Registrate',
    description: 'Creá tu cuenta ciudadana en menos de un minuto con DNI y email.',
  },
  {
    number: '02',
    title: 'Solicitá',
    description: 'Hacé tu pedido de agua o servicio y seguilo en tiempo real.',
  },
  {
    number: '03',
    title: 'Pagá y listo',
    description: 'Aboná online, consultá tu cuenta y descargá tus comprobantes.',
  },
];

function AccessIcon({ name }: { name: AccessCard['icon'] }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (name) {
    case 'admin':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2.5" />
          <path d="M3 9h18" />
          <path d="M8 14h2" />
          <path d="M14 14h2" />
          <path d="M8 17h2" />
          <path d="M14 17h2" />
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
    case 'user':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
        </svg>
      );
  }
}

function StatusDot({ online }: { online: boolean }) {
  return (
    <span
      className={`${styles.statusDot} ${online ? styles.statusOnline : styles.statusOffline}`}
      aria-hidden="true"
    />
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function ScrollReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, revealed } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${revealed ? styles.revealIn : ''} ${className ?? ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['health'],
    queryFn: healthApi.get,
    refetchInterval: 15000,
  });

  const isUp = data?.status === 'ok';
  const dbUp = data?.database === 'connected';

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div
          className={styles.heroImage}
          style={{ backgroundImage: `url(${headerImage})` }}
          aria-hidden="true"
        />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <span className={styles.heroGlowA} aria-hidden="true" />
        <span className={styles.heroGlowB} aria-hidden="true" />

        <div className={styles.heroShell}>
          <div className={styles.heroContent}>
            <div className={styles.heroTopRow}>
              <div className={styles.heroBrand}>
                <Logo size="md" inverted variant="both" showText={false} />
              </div>
              </div>

            <span className={`${styles.eyebrow} ${styles.animFade} ${styles.animDelay1}`}>
              <span className={styles.eyebrowDot} />
              Plataforma municipal · Buchardo, Córdoba
            </span>

            <h1 className={`${styles.title} ${styles.animFade} ${styles.animDelay2}`}>
              Tu municipio,
              <br />
              <span className={styles.titleAccent}>en tu bolsillo</span>
            </h1>

            <p className={`${styles.subtitle} ${styles.animFade} ${styles.animDelay3}`}>
              Gestioná pedidos, pagos y cuenta corriente desde un único portal.
              Diseñado para ciudadanos, repartidores y personal municipal.
            </p>

            <div className={`${styles.actions} ${styles.animFade} ${styles.animDelay4}`}>
              <Link to="/registro" className={styles.primaryAction}>
                <Button size="lg" leftIcon={<ArrowRightIcon />} block>
                  Crear cuenta nueva
                </Button>
              </Link>
              <Link to="/login" className={styles.secondaryActionLink}>
                <span className={styles.secondaryAction}>
                  Ya tengo cuenta
                  <ArrowRightIcon />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className={`${styles.section} ${styles.sectionAccess}`}>
        <ScrollReveal className={styles.sectionHead}>
          <div>
            <p className={styles.sectionEyebrow}>Accesos</p>
            <h2 className={styles.sectionTitle}>Entrá al portal que necesitás</h2>
          </div>
        </ScrollReveal>
        <div className={styles.grid}>
          {ACCESS_CARDS.map((card, idx) => (
            <ScrollReveal
              key={card.title}
              className={styles.cardWrap}
              delay={idx * 100}
            >
              <Link
                to={card.to}
                className={`${styles.moduleLink} ${styles[`tone-${card.tone}`]}`}
                aria-label={`${card.title}: ${card.cta}`}
              >
                <Card
                  elevation="raised"
                  padded
                  className={styles.accessCard}
                >
                  <span className={styles.accessIcon}>
                    <AccessIcon name={card.icon} />
                  </span>
                  <CardTitle>{card.title}</CardTitle>
                  <CardSubtitle>{card.description}</CardSubtitle>
                  <span className={styles.accessCta}>
                    {card.cta}
                    <ArrowRightIcon />
                  </span>
                  <span className={styles.accessArrow} aria-hidden="true">
                    →
                  </span>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.stepsSection}`}>
        <ScrollReveal className={styles.sectionHead}>
          <div>
            <p className={styles.sectionEyebrow}>Cómo empezar</p>
            <h2 className={styles.sectionTitle}>Tres pasos y listo</h2>
          </div>
          <p className={styles.sectionHint}>
            Sin filas, sin papeles. Empezás hoy mismo.
          </p>
        </ScrollReveal>

        <ol className={styles.steps}>
          {STEPS.map((step, idx) => (
            <ScrollReveal
              key={step.number}
              className={styles.stepWrap}
              delay={idx * 80}
            >
              <li className={styles.stepItem}>
                <span className={styles.stepIndex} aria-hidden="true">
                  {step.number}
                </span>
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
              </li>
            </ScrollReveal>
          ))}
        </ol>
      </section>

      <section id="estado" className={styles.section}>
        <ScrollReveal className={styles.sectionHead}>
          <div>
            <p className={styles.sectionEyebrow}>Operación</p>
            <h2 className={styles.sectionTitle}>Estado del sistema</h2>
          </div>
          <Badge tone={isUp ? 'success' : 'danger'} subtle>
            {isLoading ? 'Verificando…' : isUp ? 'Operativo' : 'Inactivo'}
          </Badge>
        </ScrollReveal>
        <ScrollReveal>
          <Card elevation="floating" padded className={styles.statusCard}>
            {isLoading && <Spinner label="Verificando servicios..." />}
            {error && (
              <div className={styles.errorRow}>
                <StatusDot online={false} />
                <p className={styles.error}>
                  No fue posible contactar al servidor en este momento.
                </p>
              </div>
            )}
            {data && (
              <div className={styles.status}>
                <div className={styles.statusItem}>
                  <div className={styles.statusLabel}>
                    <StatusDot online={isUp} />
                    Servicio
                  </div>
                  <span className={styles.statusValue}>
                    {isUp ? 'Operativo' : 'Inactivo'}
                  </span>
                </div>
                <div className={styles.statusDivider} aria-hidden="true" />
                <div className={styles.statusItem}>
                  <div className={styles.statusLabel}>
                    <StatusDot online={dbUp} />
                    Base de datos
                  </div>
                  <span className={styles.statusValue}>
                    {dbUp ? 'Conectada' : 'Desconectada'}
                  </span>
                </div>
              </div>
            )}
          </Card>
        </ScrollReveal>
      </section>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Municipalidad de Buchardo · Plataforma digital de servicios.</p>
        <p className={styles.credit}>
          Desarrollado por{' '}
          <a
            href="https://riogestion.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.creditLink}
            aria-label="Desarrollado por Río Gestión - abrir sitio externo"
          >
            <span className={styles.creditBrand}>
              <span className={styles.creditRio}>Río</span>
              <span className={styles.creditGestion}>Gestión</span>
            </span>
          </a>
        </p>
      </footer>
    </div>
  );
}
