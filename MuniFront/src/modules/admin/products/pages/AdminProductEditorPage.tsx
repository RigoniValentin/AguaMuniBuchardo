import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/Card/Card';
import { Spinner } from '@/components/Spinner/Spinner';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Button } from '@/components/Button/Button';
import { ProductForm } from '../components/ProductForm';
import { useProduct } from '../hooks/useProducts';
import { useCreateProduct, useUpdateProduct } from '../hooks/useProductMutations';
import { ApiError } from '@/services/api';
import type {
  CreateProductPayload,
  UpdateProductPayload,
} from '../types/products.types';
import styles from './AdminProductEditorPage.module.css';

function getApiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      return 'Ya existe un producto con ese código.';
    }
    if (err.status === 400) {
      const details = err.details;
      if (Array.isArray(details) && details.length > 0) {
        const first = details[0] as { message?: string; path?: string };
        if (first?.message) {
          return `Datos inválidos${first.path ? ` (${first.path})` : ''}: ${first.message}`;
        }
      }
      return err.message;
    }
    return err.message || 'No fue posible guardar los datos.';
  }
  return 'Error inesperado. Intente nuevamente.';
}

export function AdminProductEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id) && id !== 'nuevo';
  const productId = isEditing ? (id as string) : undefined;

  const { data, isLoading, isError, error } = useProduct(productId);
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(productId ?? '');

  const [serverError, setServerError] = useState<string | null>(null);

  if (isEditing && isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner label="Cargando producto..." />
      </div>
    );
  }

  if (isEditing && isError) {
    return (
      <ErrorState
        title="No pudimos cargar el producto"
        description={error instanceof Error ? error.message : 'Intente nuevamente.'}
        action={
          <Link to="/admin/productos">
            <Button variant="ghost">Volver al listado</Button>
          </Link>
        }
      />
    );
  }

  const product = data?.product;
  if (isEditing && !product) {
    return (
      <ErrorState
        title="Producto no encontrado"
        description="El producto solicitado no existe o fue eliminado."
        action={
          <Link to="/admin/productos">
            <Button variant="ghost">Volver al listado</Button>
          </Link>
        }
      />
    );
  }

  const submitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (
    payload: CreateProductPayload | UpdateProductPayload,
  ) => {
    setServerError(null);
    try {
      if (productId) {
        await updateMutation.mutateAsync(payload as UpdateProductPayload);
        navigate('/admin/productos', { replace: true });
      } else {
        const result = await createMutation.mutateAsync(payload as CreateProductPayload);
        navigate('/admin/productos', { replace: true });
        void result;
      }
    } catch (err) {
      setServerError(getApiErrorMessage(err));
    }
  };

  const pageTitle = isEditing ? `Editar producto${product ? `: ${product.name}` : ''}` : 'Nuevo producto';
  const submitLabel = isEditing ? 'Guardar cambios' : 'Crear producto';

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <Link to="/admin/productos" className={styles.backLink}>
          ← Volver al listado
        </Link>
        <h1>{pageTitle}</h1>
      </header>

      <Card>
        <ProductForm
          initial={product}
          submitLabel={submitLabel}
          submitting={submitting}
          serverError={serverError}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/productos')}
        />
      </Card>
    </div>
  );
}
