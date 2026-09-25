import type { ReactNode } from 'react';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  subtle?: boolean;
  className?: string;
}

export function Badge({ children, tone = 'neutral', subtle = false, className }: BadgeProps) {
  const classes = [styles.badge, styles[tone], subtle ? styles.subtle : '', className]
    .filter(Boolean)
    .join(' ');
  return <span className={classes}>{children}</span>;
}