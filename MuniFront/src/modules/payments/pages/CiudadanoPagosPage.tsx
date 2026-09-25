import { MyPaymentsList } from '../components/MyPaymentsList';
import styles from './CiudadanoPagosPage.module.css';

export function CiudadanoPagosPage() {
  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <h1>Mis pagos</h1>
        <p>
          Informá un pago y subí tu comprobante. La Municipalidad revisará el
          pago antes de acreditarlo en tu cuenta.
        </p>
      </header>
      <MyPaymentsList />
    </div>
  );
}