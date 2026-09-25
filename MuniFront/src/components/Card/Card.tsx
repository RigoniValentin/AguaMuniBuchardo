import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevation?: 'flat' | 'raised' | 'floating';
  padded?: boolean;
  interactive?: boolean;
}

export function Card({
  children,
  elevation = 'raised',
  padded = true,
  interactive = false,
  className,
  ...rest
}: CardProps) {
  const classes = [
    styles.card,
    styles[elevation],
    padded ? styles.padded : '',
    interactive ? styles.interactive : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className={styles.header}>{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className={styles.title}>{children}</h3>;
}

export function CardSubtitle({ children }: { children: ReactNode }) {
  return <p className={styles.subtitle}>{children}</p>;
}