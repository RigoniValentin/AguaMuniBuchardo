import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/modules/home/HomePage';
import { LoginPage } from '@/modules/auth/LoginPage';
import { RegistroPage } from '@/modules/auth/RegistroPage';
import { OlvidePasswordPage } from '@/modules/auth/OlvidePasswordPage';
import { RestablecerPasswordPage } from '@/modules/auth/RestablecerPasswordPage';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminDashboardPage } from '@/modules/admin/AdminDashboardPage';
import { AdminClientsPage } from '@/modules/admin/clients/pages/AdminClientsPage';
import { AdminClientDetailPage } from '@/modules/admin/clients/pages/AdminClientDetailPage';
import { AdminClientEditorPage } from '@/modules/admin/clients/pages/AdminClientEditorPage';
import { AdminProductsPage } from '@/modules/admin/products/pages/AdminProductsPage';
import { AdminProductEditorPage } from '@/modules/admin/products/pages/AdminProductEditorPage';
import { AdminPricingRulesPage } from '@/modules/admin/pricing-rules/pages/AdminPricingRulesPage';
import { AdminPricingRuleEditorPage } from '@/modules/admin/pricing-rules/pages/AdminPricingRuleEditorPage';
import { AdminQuoteSimulatorPage } from '@/modules/admin/quote-simulator/pages/AdminQuoteSimulatorPage';
import { AdminAccountsPage } from '@/modules/admin/accounts/pages/AdminAccountsPage';
import { AdminAccountDetailPage } from '@/modules/admin/accounts/pages/AdminAccountDetailPage';
import { AdminPagosPage } from '@/modules/payments/pages/AdminPagosPage';
import { AdminPagoDetailPage } from '@/modules/payments/pages/AdminPagoDetailPage';
import { RepartidorLayout } from '@/layouts/RepartidorLayout';
import { CiudadanoLayout } from '@/layouts/CiudadanoLayout';
import { CiudadanoDashboardPage } from '@/modules/ciudadano/dashboard/pages/CiudadanoDashboardPage';
import { CiudadanoCuentaPage } from '@/modules/ciudadano/account/pages/CiudadanoCuentaPage';
import { CiudadanoPerfilPage } from '@/modules/ciudadano/profile/pages/CiudadanoPerfilPage';
import { CiudadanoPreciosPage } from '@/modules/ciudadano/prices/pages/CiudadanoPreciosPage';
import { CiudadanoPagosPage } from '@/modules/payments/pages/CiudadanoPagosPage';
import { CiudadanoNuevoPagoPage } from '@/modules/payments/pages/CiudadanoNuevoPagoPage';
import { CiudadanoPagoDetailPage } from '@/modules/payments/pages/CiudadanoPagoDetailPage';
import { CiudadanoPedidosPage } from '@/modules/orders/ciudadano/pages/CiudadanoPedidosPage';
import { CiudadanoNuevoPedidoPage } from '@/modules/orders/ciudadano/pages/CiudadanoNuevoPedidoPage';
import { CiudadanoPedidoDetallePage } from '@/modules/orders/ciudadano/pages/CiudadanoPedidoDetallePage';
import { AdminPedidosPage } from '@/modules/orders/admin/pages/AdminPedidosPage';
import { AdminPedidoDetallePage } from '@/modules/orders/admin/pages/AdminPedidoDetallePage';
import { RepartidorHomePage } from '@/modules/orders/repartidor/pages/RepartidorHomePage';
import { RepartidorEntregaDetallePage } from '@/modules/orders/repartidor/pages/RepartidorEntregaDetallePage';
import { RepartidorNuevaEntregaPage } from '@/modules/orders/repartidor/pages/RepartidorNuevaEntregaPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { defaultRouteForRole } from '@/router/role-routes';
import { useAuth } from '@/hooks/auth-context';
import type { Role } from '@/types/auth';

function RoleHomeRedirect() {
  const { user, status } = useAuth();

  if (status === 'loading') {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={defaultRouteForRole(user.role)} replace />;
}

function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
        textAlign: 'center',
      }}
    >
      <h1>404</h1>
      <p>La página que buscás no existe.</p>
      <a href="/">Volver al inicio</a>
    </div>
  );
}

export function AppRoutes() {
  const adminRoles: Role[] = ['SUPER_ADMIN', 'ADMIN', 'OPERADOR'];

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />
      <Route path="/recuperar" element={<OlvidePasswordPage />} />
      <Route path="/recuperar/:token" element={<RestablecerPasswordPage />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={adminRoles}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route
          path="clientes"
          element={
            <ProtectedRoute permissions={['clients.read']}>
              <AdminClientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="clientes/nuevo"
          element={
            <ProtectedRoute permissions={['clients.create']}>
              <AdminClientEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="clientes/:id/editar"
          element={
            <ProtectedRoute permissions={['clients.update']}>
              <AdminClientEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="clientes/:id"
          element={
            <ProtectedRoute permissions={['clients.read']}>
              <AdminClientDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="productos"
          element={
            <ProtectedRoute permissions={['products.read']}>
              <AdminProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="productos/nuevo"
          element={
            <ProtectedRoute permissions={['products.create']}>
              <AdminProductEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="productos/:id/editar"
          element={
            <ProtectedRoute permissions={['products.update']}>
              <AdminProductEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reglas-precio"
          element={
            <ProtectedRoute permissions={['pricing.read']}>
              <AdminPricingRulesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reglas-precio/nueva"
          element={
            <ProtectedRoute permissions={['pricing.manage']}>
              <AdminPricingRuleEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reglas-precio/:id/editar"
          element={
            <ProtectedRoute permissions={['pricing.manage']}>
              <AdminPricingRuleEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="simulador-precios"
          element={
            <ProtectedRoute permissions={['pricing.quote']}>
              <AdminQuoteSimulatorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="cuentas-corrientes"
          element={
            <ProtectedRoute permissions={['accounts.read']}>
              <AdminAccountsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="clientes/:id/cuenta"
          element={
            <ProtectedRoute permissions={['accounts.read']}>
              <AdminAccountDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="pagos"
          element={
            <ProtectedRoute permissions={['payments.read']}>
              <AdminPagosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="pagos/:id"
          element={
            <ProtectedRoute permissions={['payments.read']}>
              <AdminPagoDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="pedidos"
          element={
            <ProtectedRoute permissions={['orders.read']}>
              <AdminPedidosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="pedidos/:id"
          element={
            <ProtectedRoute permissions={['orders.read']}>
              <AdminPedidoDetallePage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/repartidor/*"
        element={
          <ProtectedRoute roles={['REPARTIDOR']}>
            <RepartidorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RepartidorHomePage />} />
        <Route path="entregas/:id" element={<RepartidorEntregaDetallePage />} />
        <Route path="nueva-entrega" element={<RepartidorNuevaEntregaPage />} />
      </Route>

      <Route
        path="/ciudadano/*"
        element={
          <ProtectedRoute roles={['CIUDADANO']}>
            <CiudadanoLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CiudadanoDashboardPage />} />
        <Route path="cuenta" element={<CiudadanoCuentaPage />} />
        <Route path="precios" element={<CiudadanoPreciosPage />} />
        <Route path="pagos" element={<CiudadanoPagosPage />} />
        <Route path="pagos/nuevo" element={<CiudadanoNuevoPagoPage />} />
        <Route path="pagos/:id" element={<CiudadanoPagoDetailPage />} />
        <Route path="pedidos" element={<CiudadanoPedidosPage />} />
        <Route path="pedidos/nuevo" element={<CiudadanoNuevoPedidoPage />} />
        <Route path="pedidos/:id" element={<CiudadanoPedidoDetallePage />} />
        <Route path="perfil" element={<CiudadanoPerfilPage />} />
      </Route>

      <Route path="/app" element={<RoleHomeRedirect />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}