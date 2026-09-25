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
import styles from './CiudadanoLayout.module.css';

type CitizenIconName =
  | 'home'
  | 'orders'
  | 'account'
  | 'prices'
  | 'payments'
  | 'profile'
  | 'more'
  | 'menu'
  | 'close'
  | 'logout'
  | 'arrowRight';

interface NavItem {
  to: string;
  label: string;
  end: boolean;
  icon: CitizenIconName;
  primary: boolean;
}

const navItems: NavItem[] = [
  { to: '/ciudadano', label: 'Inicio', end: true, icon: 'home', primary: true },
  { to: '/ciudadano/pedidos', label: 'Pedidos', end: false, icon: 'orders', primary: true },
  { to: '/ciudadano/pagos', label: 'Pagos', end: false, icon: 'payments', primary: true },
  { to: '/ciudadano/cuenta', label: 'Mi cuenta', end: false, icon: 'account', primary: true },
  { to: '/ciudadano/precios', label: 'Precios', end: false, icon: 'prices', primary: false },
  { to: '/ciudadano/perfil', label: 'Mi perfil', end: false, icon: 'profile', primary: false },
];

function NavIcon({ name }: { name: CitizenIconName }) {
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
    case 'orders':
      return (
        <svg {...common}>
          <path d="M4 6h16l-1.5 11a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7L4 6Z" />
          <path d="M8 6V4.5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2V6" />
          <path d="M9 11h6" />
        </svg>
      );
    case 'payments':
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 15h4" />
          <path d="M14 15h3" />
        </svg>
      );
    case 'account':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 15h3" />
          <path d="M14 15h3" />
        </svg>
      );
    case 'prices':
      return (
        <svg {...common}>
          <path d="M3 7.5 12 3l9 4.5L12 12 3 7.5Z" />
          <path d="M3 12.5 12 17l9-4.5" />
          <path d="M3 17.5 12 22l9-4.5" />
        </svg>
      );
    case 'profile':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
        </svg>
      );
    case 'more':
      return (
        <svg {...common}>
          <circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <path d="M4 4h6" />
          <path d="M14 4h6" />
          <path d="M4 20h6" />
          <path d="M14 20h6" />
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

export function CiudadanoLayout() {
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
        <Link to="/ciudadano" className={styles.brand} aria-label="Inicio">
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
                Gestioná tus pedidos, pagos y cuenta
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
          aria-controls="ciudadano-more-sheet"
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
          id="ciudadano-more-sheet"
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
