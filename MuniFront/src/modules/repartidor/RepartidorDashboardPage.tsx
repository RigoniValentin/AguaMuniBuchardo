import { Card, CardSubtitle, CardTitle } from '@/components/Card/Card';
import { Badge } from '@/components/Badge/Badge';
import { useAuth } from '@/hooks/auth-context';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import styles from './RepartidorDashboardPage.module.css';

export function RepartidorDashboardPage() {
  const { user } = useAuth();

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <h1>Hola{user ? `, ${user.firstName}` : ''}</h1>
        <p>Tu reparto de hoy aparecerá aquí cuando esté disponible.</p>
      </header>

      <Card elevation="floating">
        <Badge tone="info">Fase siguiente</Badge>
        <CardTitle>Reparto del día</CardTitle>
        <CardSubtitle>Listado de clientes y saldo pendiente.</CardSubtitle>
        <EmptyState
          title="Aún no hay un reparto asignado"
          description="Cuando el equipo de administración publique el reparto del día, lo verás en esta pantalla."
        />
      </Card>
    </div>
  );
}
