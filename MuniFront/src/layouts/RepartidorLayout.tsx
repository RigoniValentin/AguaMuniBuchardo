import { useEffect, useId, useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from '@/hooks/auth-context';
import logoPrincipal from '@/assets/LogoPrincipal.png';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import styles from './RepartidorLayout.module.css';

type RepartidorIconName =
  | 'home'
  | 'route'
  | 'plus'
  | 'menu'
  | 'close'
  | 'logout'
  | 'arrowRight';

interface NavItem {
  to: string;
  label: string;
  end: boolean;
  icon: RepartidorIconName;
  primary: boolean;
}

const navItems: NavItem[] = [
  { to: '/repartidor', label: 'Repartos', end: true, icon: 'home', primary: true },
  { to: '/repartidor/nueva-entrega', label: 'Nueva entrega', end: false, icon: 'plus', primary: true },
];

function NavIcon({ name }: { name: RepartidorIconName }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10.5V20h5v-6h4v6h5v-9.5" />
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
    case 'plus':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      );
    case 'menu':
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      );
    case 'close':
      return (
        <svg {...common}>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...common}>
          <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
          <path d="M10 17l-5-5 5-5" />
          <path d="M5 12h11" />
        </svg>
      );
    case 'arrowRight':
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
        </svg>
      );
  }
}

function getInitials(firstName?: string, lastName?: string): string {
  const a = firstName?.trim().charAt(0) ?? '';
  const b = lastName?.trim().charAt(0) ?? '';
  return `${a}${b}`.toUpperCase() || 'U';
}

export function RepartidorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetTitleId = useId();

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [moreOpen]);

  const handleLogout = async () => {
    setMoreOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const primaryItems = navItems.filter((i) => i.primary);
  const secondaryItems = navItems.filter((i) => !i.primary);

  return (
    <div className={styles.shell}>
      {/* ============ Header (sticky, centered logo) ============ */}
      <header className={styles.header}>
        <div className={styles.headerGlow} aria-hidden="true" />
        <Link to="/repartidor" className={styles.brand} aria-label="Inicio repartidor">
          <img
            src={logoPrincipal}
            alt="Municipalidad de Buchardo"
            className={styles.logo}
          />
        </Link>
        <span className={styles.headerAccent} aria-hidden="true" />
      </header>

      {/* ============ Sub-header (greeting) ============ */}
      {user && (
        <section className={styles.subHeader}>
          <div className={styles.subHeaderContent}>
            <span className={styles.greetingAvatar} aria-hidden="true">
              {getInitials(user.firstName, user.lastName)}
            </span>
            <div className={styles.greetingText}>
              <h2 className={styles.greeting}>¡Hola, {user.firstName}!</h2>
              <span className={styles.greetingSub}>
                Gestioná tus entregas del día
              </span>
            </div>
            <Badge tone="primary" subtle className={styles.greetingBadge}>
              {user.role}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={styles.subLogout}
              leftIcon={<NavIcon name="logout" />}
              aria-label="Cerrar sesión"
            >
              <span className={styles.subLogoutLabel}>Salir</span>
            </Button>
          </div>
        </section>
      )}

      {/* ============ Desktop top nav bar ============ */}
      <nav className={styles.topNav} aria-label="Navegación principal">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `${styles.topNavLink} ${isActive ? styles.topNavLinkActive : ''}`
            }
          >
            <span className={styles.topNavIcon}>
              <NavIcon name={item.icon} />
            </span>
            <span className={styles.topNavText}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ============ Main ============ */}
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* ============ Mobile floating action button (single central "menu") ============ */}
      <nav className={styles.tabBar} aria-label="Menú de navegación">
        <button
          type="button"
          className={`${styles.fab} ${moreOpen ? styles.fabOpen : ''}`}
          onClick={() => setMoreOpen((v) => !v)}
          aria-label={moreOpen ? 'Cerrar menú' : 'Abrir menú de opciones'}
          aria-expanded={moreOpen}
          aria-controls="repartidor-more-sheet"
        >
          <span className={styles.fabIconStack} aria-hidden="true">
            <span className={`${styles.fabIconLayer} ${styles.fabIconMenu}`}>
              <NavIcon name="menu" />
            </span>
            <span className={`${styles.fabIconLayer} ${styles.fabIconClose}`}>
              <NavIcon name="close" />
            </span>
          </span>
        </button>
      </nav>

      {/* ============ "Más" bottom sheet (mobile) ============ */}
      <div
        className={`${styles.sheetRoot} ${moreOpen ? styles.sheetRootOpen : ''}`}
        aria-hidden={!moreOpen}
      >
        <button
          type="button"
          className={styles.sheetBackdrop}
          onClick={() => setMoreOpen(false)}
          aria-label="Cerrar menú"
          tabIndex={moreOpen ? 0 : -1}
        />
        <div
          id="repartidor-more-sheet"
          className={styles.sheet}
          role="dialog"
          aria-modal="true"
          aria-labelledby={sheetTitleId}
        >
          <div className={styles.sheetHandle} aria-hidden="true" />
          <div className={styles.sheetHeader}>
            <div className={styles.sheetUser}>
              <span className={styles.sheetAvatar} aria-hidden="true">
                {getInitials(user?.firstName, user?.lastName)}
              </span>
              <div className={styles.sheetUserText}>
                <span className={styles.sheetUserLabel}>Sesión activa</span>
                <strong className={styles.sheetUserName}>
                  {user?.firstName} {user?.lastName}
                </strong>
              </div>
            </div>
            <button
              type="button"
              className={styles.sheetClose}
              onClick={() => setMoreOpen(false)}
              aria-label="Cerrar"
            >
              <NavIcon name="close" />
            </button>
          </div>

          <h3 id={sheetTitleId} className={styles.srOnly}>
            Más opciones
          </h3>

          <nav className={styles.sheetNav} aria-label="Más opciones">
            <p className={styles.sheetSectionLabel}>Principal</p>
            {primaryItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `${styles.sheetLink} ${isActive ? styles.sheetLinkActive : ''}`
                }
              >
                <span className={styles.sheetLinkIcon}>
                  <NavIcon name={item.icon} />
                </span>
                <span className={styles.sheetLinkText}>{item.label}</span>
                <span className={styles.sheetLinkArrow}>
                  <NavIcon name="arrowRight" />
                </span>
              </NavLink>
            ))}
            {secondaryItems.length > 0 && (
              <>
                <p className={styles.sheetSectionLabel}>Tu cuenta</p>
                {secondaryItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `${styles.sheetLink} ${isActive ? styles.sheetLinkActive : ''}`
                    }
                  >
                    <span className={styles.sheetLinkIcon}>
                      <NavIcon name={item.icon} />
                    </span>
                    <span className={styles.sheetLinkText}>{item.label}</span>
                    <span className={styles.sheetLinkArrow}>
                      <NavIcon name="arrowRight" />
                    </span>
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          <div className={styles.sheetFooter}>
            <Button
              variant="ghost"
              block
              onClick={handleLogout}
              leftIcon={<NavIcon name="logout" />}
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}