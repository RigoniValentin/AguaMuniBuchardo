import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth-context';
import { Logo } from '@/components/Logo/Logo';
import { Button } from '@/components/Button/Button';
import { Badge } from '@/components/Badge/Badge';
import styles from './AdminLayout.module.css';

type NavIconName =
  | 'home'
  | 'orders'
  | 'payments'
  | 'clients'
  | 'accounts'
  | 'products'
  | 'rules'
  | 'simulator';

interface NavItem {
  to: string;
  label: string;
  permission?: string;
  icon: NavIconName;
}

const navItems: NavItem[] = [
  { to: '/admin', label: 'Inicio', icon: 'home' },
  { to: '/admin/pedidos', label: 'Pedidos', permission: 'orders.read', icon: 'orders' },
  { to: '/admin/pagos', label: 'Pagos', permission: 'payments.read', icon: 'payments' },
  { to: '/admin/clientes', label: 'Clientes', permission: 'clients.read', icon: 'clients' },
  {
    to: '/admin/cuentas-corrientes',
    label: 'Cuentas corrientes',
    permission: 'accounts.read',
    icon: 'accounts',
  },
  { to: '/admin/productos', label: 'Productos', permission: 'products.read', icon: 'products' },
  {
    to: '/admin/reglas-precio',
    label: 'Reglas de precios',
    permission: 'pricing.read',
    icon: 'rules',
  },
  {
    to: '/admin/simulador-precios',
    label: 'Simulador',
    permission: 'pricing.quote',
    icon: 'simulator',
  },
];

function NavIcon({ name }: { name: NavIconName }) {
  const common = {
    width: 18,
    height: 18,
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
        </svg>
      );
    case 'clients':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M15 14.5c2.6.4 5 1.7 5 3.5" />
        </svg>
      );
    case 'accounts':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 15h3" />
          <path d="M14 15h3" />
        </svg>
      );
    case 'products':
      return (
        <svg {...common}>
          <path d="M3 7.5 12 3l9 4.5L12 12 3 7.5Z" />
          <path d="M3 12.5 12 17l9-4.5" />
          <path d="M3 17.5 12 22l9-4.5" />
        </svg>
      );
    case 'rules':
      return (
        <svg {...common}>
          <path d="M5 4h10l4 4v12H5z" />
          <path d="M9 9h6" />
          <path d="M9 13h6" />
          <path d="M9 17h4" />
        </svg>
      );
    case 'simulator':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <path d="M3 9h18" />
          <path d="M7 14l2-2 2 2 3-3 3 3" />
        </svg>
      );
  }
}

function getInitials(firstName?: string, lastName?: string): string {
  const a = firstName?.trim().charAt(0) ?? '';
  const b = lastName?.trim().charAt(0) ?? '';
  return `${a}${b}`.toUpperCase() || 'U';
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Navegación administrativa">
        <div className={styles.sidebarGlow} aria-hidden="true" />
        <div className={styles.brand}>
          <Link to="/admin" className={styles.brandLink}>
            <Logo size="sm" inverted showText={false} variant="both" />
          </Link>
          <span className={styles.brandBadge}>
            <span className={styles.brandDot} aria-hidden="true" />
            Admin
          </span>
        </div>

        <nav className={styles.nav}>
          <p className={styles.navLabel}>Operaciones</p>
          {navItems
            .filter((item) => !item.permission || user?.permissions.includes(item.permission as never))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                }
              >
                <span className={styles.navIcon}>
                  <NavIcon name={item.icon} />
                </span>
                <span className={styles.navText}>{item.label}</span>
                <span className={styles.navIndicator} aria-hidden="true" />
              </NavLink>
            ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <span className={styles.avatar} aria-hidden="true">
              {getInitials(user?.firstName, user?.lastName)}
            </span>
            <div className={styles.userMeta}>
              <span className={styles.userLabel}>Sesión activa</span>
              <strong className={styles.userName}>
                {user?.firstName} {user?.lastName}
              </strong>
              {user && (
                <Badge tone="primary" subtle>
                  {user.role}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.topbarAccent} aria-hidden="true" />
          <span className={styles.topbarSide} aria-hidden="true" />
          <div className={styles.topbarCenter}>
            <span className={styles.topbarFade} aria-hidden="true" />
            <div className={styles.topbarTitle}>
              <span className={styles.crumb}>Municipalidad</span>
              <h2>Panel de administración</h2>
            </div>
            <span className={styles.topbarFade} aria-hidden="true" />
          </div>
          <div className={styles.topbarActions}>
            <Button variant="ghost" onClick={handleLogout} leftIcon={<LogoutIcon />}>
              Cerrar sesión
            </Button>
          </div>
        </header>
        <main className={styles.content} data-admin-scroll-container>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l-5-5 5-5" />
      <path d="M5 12h11" />
    </svg>
  );
}