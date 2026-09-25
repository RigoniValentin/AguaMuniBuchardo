# MuniFront

Frontend de la plataforma digital de la **Municipalidad de Buchardo**.

SPA React + TypeScript + Vite con tres experiencias: Administración, Reparto y Ciudadano. Consume únicamente el backend `MuniBack` a través de rutas relativas `/api/*` (proxy Vite en desarrollo, mismo origen en producción).

## Demo MVP

Para preparar y ejecutar la **demo frente a la Municipalidad** consultá
[`DEMO_CHECKLIST.md`](../DEMO_CHECKLIST.md) (credenciales, recorrido sugerido
paso a paso y verificación de cada pantalla). Las mejoras post-MVP que
**no se incluyen** en esta entrega están listadas en
[`POST_MVP.md`](../POST_MVP.md).

## Stack

- React 18
- TypeScript (strict)
- Vite 5
- React Router 6
- TanStack Query 5
- CSS Modules (sin Tailwind, sin Bootstrap, sin styled-components, sin CSS-in-JS)
- Vitest + React Testing Library

## Requisitos

- Node.js >= 20
- npm >= 10
- MuniBack corriendo (en `http://localhost:3000` durante desarrollo)

## Instalación

```bash
npm install
cp .env.example .env
```

Variables de entorno:

| Variable             | Descripción                                       |
| -------------------- | ------------------------------------------------- |
| `VITE_API_BASE_URL`  | Prefijo de API (default `/api`)                   |
| `VITE_APP_NAME`      | Nombre mostrado en la UI (default `Municipalidad de Buchardo`) |

Durante desarrollo, Vite redirige cualquier request a `/api/*` hacia `http://localhost:3000` (ver `vite.config.ts`). No escribas URLs absolutas al backend.

## Desarrollo

```bash
npm run dev
# Vite levanta http://localhost:5173
```

## Build

```bash
npm run build
# Genera dist/
```

El output se integra automáticamente en `MuniBack/public` al ejecutar `npm run build:full` desde el backend.

## Tests

```bash
npm test
```

## Estructura

```
src/
├── app/             # bootstrap
├── components/      # Button, Input, Card, Badge, Spinner, EmptyState, ErrorState, Logo
├── layouts/         # AdminLayout, RepartidorLayout, CiudadanoLayout
├── modules/
│   ├── auth/        # LoginPage
│   ├── admin/       # FASE 2-3 — Admin
│   │   ├── clients/      # FASE 2 (+ FASE 5: citizen-access)
│   │   ├── products/     # FASE 3
│   │   ├── pricing-rules/# FASE 3
│   │   ├── quote-simulator/ # FASE 3
│   │   └── accounts/     # FASE 4
│   ├── repartidor/
│   ├── ciudadano/         # FASE 5 — Portal Ciudadano
│   │   ├── dashboard/     # /ciudadano
│   │   ├── account/       # /ciudadano/cuenta
│   │   ├── profile/       # /ciudadano/perfil
│   │   ├── prices/        # /ciudadano/precios
│   │   └── shared/        # DTO + helpers + hooks
│   └── home/
├── router/          # AppRoutes
├── services/        # api client + auth.api + health.api
├── shared/          # money.ts (FASE 3 — minor units helpers)
├── hooks/           # useAuth
├── styles/          # tokens.css + global.css
└── types/
```

## Módulo Admin Clientes (FASE 2)

Implementa la gestión de clientes desde el sector Admin.

### Rutas

| Ruta                          | Vista                      | Permisos                |
| ----------------------------- | -------------------------- | ----------------------- |
| `/admin/clientes`             | Listado con búsqueda        | `clients.read`          |
| `/admin/clientes/nuevo`       | Crear cliente               | `clients.create`        |
| `/admin/clientes/:id`         | Detalle del cliente         | `clients.read`          |
| `/admin/clientes/:id/editar`  | Editar cliente              | `clients.update`        |

El ítem "Clientes" del sidebar del `AdminLayout` se muestra únicamente si el usuario tiene `clients.read`.

### Pantallas

- **Listado:** tabla responsive (en mobile se transforma en cards), buscador, filtros por tipo y estado, paginación, badge del tipo, badge de estado (Activo/Inactivo).
- **Detalle:** vista limpia con secciones de contacto, documento, dirección y observaciones.
- **Editor:** formulario unificado para alta y edición. Manejo de errores 409 con mensaje amigable ("Ya existe un cliente registrado con ese documento.").

### Tipos de cliente (visuales)

| Código interno | Etiqueta    | Tono     |
| -------------- | ----------- | -------- |
| `LOCAL`        | Local       | success  |
| `JUBILADO`     | Jubilado    | info     |
| `NO_LOCAL`     | No local    | warning  |
| `AYUDA_SOCIAL` | Ayuda social | primary |

### Hooks

- `useClients(filters)` — listado paginado con `placeholderData: keepPreviousData`
- `useClient(id)` — detalle con `enabled: Boolean(id)`
- `useCreateClient()` — invalida la cache de listados al crear
- `useUpdateClient(id)` — invalida la cache de listados y actualiza el detalle

### Formularios

`ClientForm` (componente reutilizable) usa `react-hook-form` + `@hookform/resolvers/zod` para validación client-side y `Zod`. La normalización final (trim, lowercase de email, etc.) se aplica al construir el payload que se envía al backend.

## Estilos

Los tokens viven en `src/styles/tokens.css` como variables CSS. Los componentes usan `*.module.css` y nunca estilos globales sueltos.

Colores principales:

- `--color-primary: #403F96`
- `--color-secondary: #85C341`
- `--color-background: #F6F7FB`

`ProtectedRoute` valida autenticación y opcionalmente roles/permisos. Si el usuario autenticado no pertenece al sector, redirige al sector que le corresponde según su rol.

## FASE 3 — Productos, Reglas y Simulador

FASE 3 incorpora la gestión de catálogo de productos, reglas comerciales y un simulador de cotizaciones. El frontend **nunca** calcula precios: consume `POST /api/pricing/quote` y muestra exactamente lo devuelto por el backend.

### Rutas

| Ruta                                  | Vista                  | Permisos        |
| ------------------------------------- | ---------------------- | --------------- |
| `/admin/productos`                    | Listado de productos   | `products.read` |
| `/admin/productos/nuevo`              | Crear producto         | `products.create` |
| `/admin/productos/:id/editar`         | Editar producto        | `products.update` |
| `/admin/reglas-precio`                | Listado de reglas      | `pricing.read`  |
| `/admin/reglas-precio/nueva`          | Crear regla            | `pricing.manage` |
| `/admin/reglas-precio/:id/editar`     | Editar regla           | `pricing.manage` |
| `/admin/simulador-precios`            | Simulador de cotizaciones | `pricing.quote` |

Los ítems del sidebar del `AdminLayout` se muestran únicamente si el usuario tiene el permiso correspondiente.

### Pantallas

- **Productos:** tabla responsive (mobile = cards), buscador por código/nombre, filtros por tipo y estado, paginación, badges de tipo (Recarga de agua, Bidón, Dispenser, Otro) y estado.
- **Reglas de precios:** tabla con tipo de cliente, alcance, objetivo (resumido), ajuste % coloreado según signo, prioridad, estado. Filtros por tipo de cliente, alcance y estado.
- **Formulario de regla:** cambia dinámicamente los campos de objetivo según el `scope` seleccionado (PRODUCT_TYPE muestra el selector de tipo; PRODUCT muestra el selector de producto cargado vía TanStack Query).
- **Simulador:** pantalla con cliente + lista dinámica de productos/cantidades → botón Cotizar → muestra el resultado exacto del backend con la regla aplicada (o aviso "sin regla aplicada") y los totales `base / ajuste / final`.

### Dinero

- El backend siempre devuelve/entrega enteros en **minor units** (centavos ARS).
- Helpers centralizados en `src/shared/money.ts`:
  - `formatMinorAsARS(minor)` — formato localizado `es-AR` para mostrar importes.
  - `parseArsToMinor(ars)` — convierte entrada del usuario (string/number con coma o punto) a `integer minor`.
  - `formatPercentage(p)` — formato `es-AR` para mostrar porcentajes.
- Los formularios convierten ARS → `basePriceMinor` antes de enviar al backend, y los listados convierten `basePriceMinor` → ARS para mostrar.

### Permisos por rol (FASE 3)

| Permiso            | SUPER_ADMIN | ADMIN | OPERADOR | REPARTIDOR | CIUDADANO |
| ------------------ | :---------: | :---: | :------: | :--------: | :-------: |
| `products.read`    | ✓           | ✓     | ✓        | ✓          | ✓         |
| `products.create`  | ✓           | ✓     | ✓        | —          | —         |
| `products.update`  | ✓           | ✓     | ✓        | —          | —         |
| `pricing.read`     | ✓           | ✓     | ✓        | —          | —         |
| `pricing.manage`   | ✓           | ✓     | —        | —          | —         |
| `pricing.quote`    | ✓           | ✓     | ✓        | ✓          | ✓         |

El `OPERADOR` ve Productos y puede cotizar, pero **no** ve el botón "Nueva regla". El `CIUDADANO` no accede al panel de admin.

### Hooks / services

- `useProducts`, `useProduct`, `useCreateProduct`, `useUpdateProduct` (TanStack Query)
- `usePricingRules`, `usePricingRule`, `useCreatePricingRule`, `useUpdatePricingRule`
- `usePricingQuote` (`useMutation` simple)

`placeholderData: keepPreviousData` se usa en los listados para evitar parpadeos al cambiar filtros/páginas.

## FASE 4 — Cuentas corrientes

FASE 4 introduce la cuenta corriente por cliente, sustentada por el ledger de movimientos del backend. **No** se renderiza nunca el signo crudo del `balanceMinor`: la UI muestra `Debe $…`, `Saldo a favor $…` o `Al día`.

### Convención visual del saldo

| `balanceMinor` | Etiqueta UI              | Estado (`status`) |
| -------------- | ------------------------ | ----------------- |
| `> 0`          | `Debe $X` (rojo)         | `DEBT`            |
| `=== 0`        | `Al día` (gris)          | `SETTLED`         |
| `< 0`          | `Saldo a favor $X` (verde) | `CREDIT`         |

`describeBalance(minor)` (en `src/modules/admin/accounts/types/accounts.types.ts`) es la única función que traduce `balanceMinor` → etiqueta. No se invierte en ningún módulo.

### Rutas

| Ruta                                     | Vista                          | Permisos         |
| ---------------------------------------- | ------------------------------ | ---------------- |
| `/admin/cuentas-corrientes`              | Listado de cuentas con resumen | `accounts.read`  |
| `/admin/clientes/:id/cuenta`             | Detalle de cuenta + historial  | `accounts.read`  |

> Las rutas `/me/*` viven en el backend para FASE 5 (Portal ciudadano). En esta fase **no** se construye UI de ciudadano para cuentas.

La navegación del sidebar del `AdminLayout` incluye **"Cuentas corrientes"** visible si el usuario tiene `accounts.read`.

### Pantallas

- **Listado:** tabla responsive (mobile = cards), buscador, filtros por tipo de cliente, estado de cuenta (`Todos / Con deuda / Saldo a favor / Al día`) y estado del cliente (`Todos / Activos / Inactivos`). Paginación. Badge de estado. Cada fila muestra el saldo en formato amigable (`Debe $…` / `Saldo a favor $…` / `Al día`) y la fecha del último movimiento.
- **Detalle:**
  - Tarjetas resumen: Saldo actual, Total cargos, Total créditos.
  - Botón **+ Nuevo ajuste** (visible si el usuario tiene `accounts.adjust`).
  - **Historial de movimientos** en orden cronológico inverso, con dirección, monto y descripción. Cada movimiento no reversible muestra botón **Revertir** (visible si el usuario tiene `accounts.reverse`). Los movimientos REVERSAL se identifican con badge y los ya revertidos ocultan el botón.
  - Modal de **Nuevo ajuste** con tipo (`Agregar deuda` / `Agregar crédito`), monto, motivo y resumen antes de confirmar.
  - Modal de **Revertir movimiento** con motivo obligatorio y advertencia sobre la inmutabilidad del original.

### Integración con Client Detail

La pantalla `/admin/clientes/:id` agrega una tarjeta **"Cuenta corriente"** con el saldo actual (en formato amigable) y un enlace a `/admin/clientes/:id/cuenta`. La tarjeta sólo se renderiza si el usuario tiene `accounts.read`.

### Permisos (matriz FASE 4)

| Permiso             | SUPER_ADMIN | ADMIN | OPERADOR | REPARTIDOR | CIUDADANO |
| ------------------- | :---------: | :---: | :------: | :--------: | :-------: |
| `accounts.read`     | ✓           | ✓     | ✓        | ✓          | —         |
| `accounts.adjust`   | ✓           | ✓     | ✓        | —          | —         |
| `accounts.reverse`  | ✓           | ✓     | —        | —          | —         |
| `accounts.self`     | ✓           | —     | —        | —          | ✓         |

`OPERADOR` ve el botón "Nuevo ajuste" pero **no** el botón "Revertir". `REPARTIDOR` ve cuentas pero no puede ajustar ni revertir. `CIUDADANO` no accede al panel admin.

### Hooks / services

- `useAccounts(filters)` — listado paginado con `placeholderData: keepPreviousData`.
- `useAccountSummary(clientId)` — resumen (totales + saldo + estado + último movimiento).
- `useAccountMovements(clientId, filters)` — historial paginado.
- `useCreateAccountAdjustment(clientId)` — registra un ajuste manual; invalida `summary`, `movements` y `lists`.
- `useReverseAccountMovement(clientId)` — revierte un movimiento; mismas invalidaciones.

`apiRequest<T>` (en `src/services/api.ts`) ya normaliza los errores HTTP (lanza `ApiError` con `code` + `status`). Los modales de ajuste/reversión muestran el `message` del backend cuando la operación falla.

### Dinero

Reutiliza `formatMinorAsARS()` de `src/shared/money.ts` y `parseArsToMinor()` para el formulario de ajuste. **No** se introducen helpers monetarios nuevos.

## FASE 5 — Portal Ciudadano

FASE 5 construye la experiencia autenticada del ciudadano. NO implementa pedidos, carrito, checkout, pagos ni comprobantes — sólo una base ciudadana real sobre los módulos existentes (Clients, Accounts, Pricing).

### Rutas

| Path                   | Página                              |
| ---------------------- | ----------------------------------- |
| `/ciudadano`           | Dashboard (saludo + saldo + accesos rápidos + últimos movimientos) |
| `/ciudadano/cuenta`    | Mi cuenta (resumen + historial paginado + filtros Todos/Cargos/Créditos) |
| `/ciudadano/precios`   | Productos activos con precio personalizado (batch quote) |
| `/ciudadano/perfil`    | Datos identificatorios read-only + contacto/domicilio editables |

El `CiudadanoLayout` muestra la navegación principal (`Inicio / Mi cuenta / Precios / Mi perfil`) y persiste `sticky` en mobile.

### Privacidad y DTO

El módulo consume exclusivamente el `CitizenClientDto` que el backend
produce en `GET /api/clients/me`. Nunca se envía `clientId` desde el
cliente: todos los endpoints `/me/*` resuelven el `Client` a partir de
`req.user.id` en el backend.

El DTO de frontend (`modules/ciudadano/shared/client.types.ts`) NUNCA
incluye `notes`, `userId`, `createdBy`, `updatedBy`, ni
`passwordHash`. Las direcciones se renderizan con etiquetas amigables
(`formatCitizenAddress`) y los `clientType` se mapean con
`CITIZEN_CLIENT_TYPE_LABEL` (`LOCAL → "Local"`, etc.).

### Dashboard (`/ciudadano`)

- Saludo: `Hola, {firstName}`.
- Tarjeta de saldo con `describeCitizenBalance(balanceMinor)`:
  - `balance > 0` → `"Tenés una deuda de $..."`
  - `balance < 0` → `"Tenés $... a favor"`
  - `balance = 0` → `"Tu cuenta está al día"`
- Datos básicos: tipo de cliente (etiqueta amigable) y dirección formateada.
- Accesos rápidos: `Ver mi cuenta`, `Ver precios`, `Mi perfil`.
- Últimos 5 movimientos (`limit=5` en `/api/accounts/me/movements`).
- Si el cliente está inactivo: tarjeta informativa.
- Si el usuario no está vinculado: estado `"Tu cuenta todavía no está
  vinculada"` con mensaje y CTA para contactar a la Municipalidad.

NO hay botones de `Comprar`, `Realizar pedido` ni `Pagar`. No se crean
funcionalidades ficticias.

### Mi Cuenta (`/ciudadano/cuenta`)

- Resumen con saldo amigable, totales cargos / créditos.
- Historial paginado (Botones `Anterior` / `Siguiente`, filtro
  `Todos / Cargos / Créditos`).
- Sin botones `Nuevo ajuste` ni `Revertir` (visibles sólo en admin).
- Reversiones se muestran con badge `Reversión`.

### Mi Perfil (`/ciudadano/perfil`)

- Sección `Datos de identificación` (read-only): nombre, apellido,
  documento, tipo de cliente, localidad.
- Aviso: `"Para modificar tu nombre, documento, localidad o tipo de
  cliente, comunicate con la Municipalidad."`
- Sección editable: teléfono, email, calle, número, piso, departamento,
  barrio, código postal, referencias. Submit vía `PATCH /api/clients/me`.

### Precios (`/ciudadano/precios`)

- Llama a `GET /api/products?active=true&limit=100` para listar productos
  activos.
- Realiza UNA cotización batch
  `POST /api/pricing/me/quote` con `quantity=1` por cada producto visible.
- Para cada producto muestra:
  - Nombre
  - Descripción
  - Tipo (`Recarga de agua`, `Bidón`, `Dispenser`, `Otro`)
  - Precio general (tachado) + tu precio (en verde) cuando hay ajuste
- Cliente inactivo: muestra mensaje informativo en lugar de cotización.
- NO muestra: `tracksStock`, códigos internos, ni acciones de admin.

### Hooks y TanStack Query

Hooks reutilizables en `modules/ciudadano`:

- `useMyClient` / `useUpdateMyClient` — perfil ciudadano (`GET/PATCH /clients/me`).
- `useMyAccountSummary` — `GET /api/accounts/me/summary`.
- `useMyAccountMovements(filters)` — `GET /api/accounts/me/movements`.
- `useCitizenProducts` (vía `useQuery`) — productos activos.
- `useMyPricingQuote(items)` (vía `useQuery`) — `POST /api/pricing/me/quote`.

`useMyClient` no reintenta cuando el backend devuelve `CLIENT_NOT_LINKED`.

Tras `PATCH /api/clients/me` exitoso, se invalida `myClientKeys.detail()` para refrescar el dashboard.

### Admin — Acceso ciudadano

En `AdminClientDetailPage` (`/admin/clientes/:id`) aparece la sección
**Acceso ciudadano**:

- Si no hay usuario vinculado: input `Email` + botón `Vincular cuenta`.
- Si hay: muestra email seguro + botones `Desvincular` (con
  confirmación) + estado activo/inactivo.

Sólo visible si el usuario autenticado tiene `clients.linkUser`.

### Sin pedido, sin carrito, sin pago

Esta fase NO implementa:

- `Order`, `OrderItem`, `Cart`, `Checkout`, `Purchase`.
- `Payment`, `PaymentReceipt`, upload de comprobantes, approval.
- Registración pública.

## FASE 6 — Pagos y comprobantes

FASE 6 introduce el flujo completo de pagos: el ciudadano informa el pago, sube un comprobante, la Municipalidad lo aprueba/rechaza, y la acreditación impacta en la cuenta corriente. La aprobación genera automáticamente un movimiento `CREDIT` mediante el `postMovement()` de FASE 4; nunca se descuenta el saldo directamente.

### Rutas ciudadano

| Path | Página |
|---|---|
| `/ciudadano/pagos` | Listado de pagos del ciudadano. Cards con monto, método, fecha y estado. Notas contextuales según estado (acreditado, rechazado con motivo, revertido). |
| `/ciudadano/pagos/nuevo` | Formulario de nuevo pago: monto (validado en cliente y servidor), método, nota opcional, archivo. |
| `/ciudadano/pagos/:id` | Detalle del pago con preview del comprobante y estado. |

### Rutas administración

| Path | Página | Permisos |
|---|---|---|
| `/admin/pagos` | Listado con filtros (status, método, búsqueda) + paginación. | `payments.read` |
| `/admin/pagos/:id` | Detalle con datos del cliente, monto, método, fechas, comprobante preview/PDF y acciones. | `payments.read` |

### Acciones administrativas

- **PENDING** + `payments.review` → botones `Aprobar` / `Rechazar`.
- **APPROVED** + `payments.reverse` → botón `Revertir aprobación`.
- **REJECTED / REVERSED** → sin acciones.

Los modales de aprobación incluyen una advertencia explícita ("Al aprobar este pago se acreditará automáticamente el importe en la cuenta corriente del cliente.") y los de rechazo/reversión exigen motivo obligatorio.

### Privacidad de la descarga del comprobante

`/api/payments/:id/receipt` requiere autenticación (`Authorization: Bearer ...`). Como `<img src=...>` no puede agregar headers, el frontend usa un hook (`useReceiptObjectUrl`) que:

1. Llama al endpoint autenticado.
2. Recibe un `Blob` y un `Content-Type`.
3. Genera `URL.createObjectURL(blob)` para el preview.
4. `URL.revokeObjectURL` en unmount / cambio de URL.

El token nunca aparece en la URL. La respuesta llega con `Cache-Control: private, no-store` y `X-Content-Type-Options: nosniff`.

### Estados visuales

- `PENDING` (warning): pendiente de revisión.
- `APPROVED` (success): acreditado en tu cuenta.
- `REJECTED` (danger): motivo guardado, comprobante conservado para auditoría.
- `REVERSED` (neutral): aprobación revertida, movimiento inverso en el ledger.

### Métodos de pago aceptados

`BANK_TRANSFER`, `BANK_DEPOSIT`, `OTHER`. NO se acepta `CASH` (pertenece al flujo de repartos futuro).

### Hooks TanStack Query

- `useMyPayments(filters)` — listado del ciudadano.
- `useMyPayment(id)` — detalle del ciudadano.
- `useSubmitMyPayment()` — submit con FormData.
- `usePayments(filters)` — listado admin.
- `usePayment(id)` — detalle admin.
- `useApprovePayment(id)`, `useRejectPayment(id)`, `useReversePayment(id)` — mutaciones admin.
- `useReceiptObjectUrl(fetcher)` — descarga autenticada de comprobantes.

Tras aprobar/rechazar/revertir, se invalidan: `payments.*`, `accounts.*`, `my-account.*`.

## FASE 7 + FASE 8 MVP — Pedidos y reparto

El módulo `src/modules/orders/` cierra el circuito principal de la demo MVP:

- **Ciudadano**: `/ciudadano/pedidos`, `/ciudadano/pedidos/nuevo`, `/ciudadano/pedidos/:id`.
- **Administración**: `/admin/pedidos`, `/admin/pedidos/:id` (incluye asignación de repartidor).
- **Repartidor** (mobile-first): `/repartidor` (home con resumen), `/repartidor/entregas/:id`, `/repartidor/nueva-entrega` (búsqueda → selección → cotización → confirmación).

Los precios se cotizan en vivo contra `/api/pricing/me/quote` pero al confirmar el backend los **recalcula** y congela el snapshot — el frontend nunca envía precios.

El layout del repartidor ahora incluye navegación inferior (Repartos / Nueva entrega).

### Permisos requeridos

- Ciudadano: `orders.self` (auto en `CIUDADANO`).
- Administración: `orders.read`, `orders.assign`, `orders.cancel`.
- Repartidor: `delivery.read`, `delivery.update`, `delivery.create`.

## Licencia

Privado.
