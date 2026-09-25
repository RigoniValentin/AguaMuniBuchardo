import type { ReactNode } from 'react';
import styles from './ErrorState.module.css';
import { Button } from '../Button/Button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  action?: ReactNode;
}

export function ErrorState({
  title = 'Algo salió mal',
  description = 'No pudimos completar la operación. Intente nuevamente.',
  onRetry,
  action,
}: ErrorStateProps) {
  return (
    <div className={styles.wrap} role="alert">
      <div className={styles.icon}>!</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {(onRetry || action) && (
        <div className={styles.action}>
          {onRetry && <Button onClick={onRetry}>Reintentar</Button>}
          {action}
        </div>
      )}
    </div>
  );
}
