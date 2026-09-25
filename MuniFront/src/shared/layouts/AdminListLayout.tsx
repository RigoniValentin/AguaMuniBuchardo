import type { ReactNode } from 'react';
import styles from './AdminListLayout.module.css';

export interface AdminListLayoutProps {
  toolbar: ReactNode;
  children: ReactNode;
}

export function AdminListLayout({ toolbar, children }: AdminListLayoutProps) {
  return (
    <div className={styles.root}>
      <header className={styles.toolbar}>{toolbar}</header>
      <div className={styles.body}>{children}</div>
    </div>
  );
}

export interface AdminListHeadingProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function AdminListHeading({ title, description, action }: AdminListHeadingProps) {
  return (
    <div className={styles.heading}>
      <div className={styles.headingText}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action && <div className={styles.headingAction}>{action}</div>}
    </div>
  );
}
