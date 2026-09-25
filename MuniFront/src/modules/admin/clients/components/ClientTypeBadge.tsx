import type { CSSProperties } from 'react';
import styles from './ClientTypeBadge.module.css';
import { Badge } from '@/components/Badge/Badge';
import {
  CLIENT_TYPE_LABEL,
  CLIENT_TYPE_TONE,
  type ClientType,
} from '../types/clients.types';

interface ClientTypeBadgeProps {
  value: ClientType;
  style?: CSSProperties;
}

export function ClientTypeBadge({ value, style }: ClientTypeBadgeProps) {
  return (
    <span className={styles.wrap} style={style}>
      <Badge tone={CLIENT_TYPE_TONE[value]}>{CLIENT_TYPE_LABEL[value]}</Badge>
    </span>
  );
}
