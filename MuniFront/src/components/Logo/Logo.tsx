import logoPrincipal from '@/assets/LogoPrincipal.png';
import logoSecundario from '@/assets/LogoSecundario.png';
import styles from './Logo.module.css';

export type LogoVariant = 'principal' | 'water' | 'both';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  inverted?: boolean;
  variant?: LogoVariant;
}

const PRINCIPAL_WIDTHS = { sm: 110, md: 150, lg: 200 } as const;
const WATER_WIDTHS = { sm: 70, md: 100, lg: 140 } as const;

export function Logo({
  size = 'md',
  showText = true,
  inverted = false,
  variant = 'both',
}: LogoProps) {
  const showPrincipal = variant === 'principal' || variant === 'both';
  const showWater = variant === 'water' || variant === 'both';
  const compact = variant === 'both' && size === 'sm';

  const principalW = PRINCIPAL_WIDTHS[size];
  const waterW = WATER_WIDTHS[size];

  return (
    <div
      className={`${styles.wrap} ${styles[size]} ${inverted ? styles.inverted : ''} ${
        compact ? styles.compact : ''
      }`}
    >
      <div className={styles.marks} aria-hidden="true">
        {showPrincipal && (
          <img
            className={`${styles.mark} ${styles.principal}`}
            src={logoPrincipal}
            alt=""
            width={principalW}
          />
        )}
        {showWater && (
          <img
            className={`${styles.mark} ${styles.water}`}
            src={logoSecundario}
            alt=""
            width={waterW}
          />
        )}
      </div>
      {showText && (
        <div className={styles.text}>
          <span className={styles.title}>
            {variant === 'water' ? 'Agua Buchardo' : 'Municipalidad'}
          </span>
          <span className={styles.subtitle}>
            {variant === 'water'
              ? 'Reparto a domicilio'
              : variant === 'both'
                ? 'de Buchardo · Agua'
                : 'de Buchardo'}
          </span>
        </div>
      )}
      {!showText && variant === 'both' && (
        <span className={styles.srOnly}>Municipalidad de Buchardo · Agua</span>
      )}
      {!showText && variant === 'principal' && (
        <span className={styles.srOnly}>Municipalidad de Buchardo</span>
      )}
      {!showText && variant === 'water' && (
        <span className={styles.srOnly}>Agua Buchardo</span>
      )}
    </div>
  );
}
