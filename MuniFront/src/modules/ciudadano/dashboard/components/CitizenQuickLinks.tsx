import { Link } from 'react-router-dom';
import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import styles from './CitizenQuickLinks.module.css';

interface QuickLink {
  to: string;
  label: string;
  description: string;
  tone: 'primary' | 'info' | 'success';
}

const links: QuickLink[] = [
  {
    to: '/ciudadano/pagos',
    label: 'Informar pago',
    description: 'Enviá tu comprobante para que la Municipalidad lo revise.',
    tone: 'primary',
  },
  {
    to: '/ciudadano/cuenta',
    label: 'Ver mi cuenta',
    description: 'Saldo, cargos, créditos y movimientos.',
    tone: 'info',
  },
  {
    to: '/ciudadano/precios',
    label: 'Ver precios',
    description: 'Productos disponibles con tu precio personalizado.',
    tone: 'success',
  },
];

export function CitizenQuickLinks() {
  return (
    <section className={styles.grid} aria-label="Accesos rápidos">
      {links.map((link) => (
        <Link key={link.to} to={link.to} className={styles.link}>
          <Card>
            <span className={`${styles.eyebrow} ${styles[`tone-${link.tone}`]}`}>
              Acceso rápido
            </span>
            <CardTitle>{link.label}</CardTitle>
            <CardSubtitle>{link.description}</CardSubtitle>
          </Card>
        </Link>
      ))}
    </section>
  );
}