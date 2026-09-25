export type OrderStatus =
  | 'CONFIRMED'
  | 'PENDING'
  | 'ASSIGNED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderOrigin = 'CITIZEN' | 'STAFF';

export interface OrderItem {
  productId: string;
  productCode: string;
  productName: string;
  productType: string;
  quantity: number;
  unitBasePriceMinor: number;
  adjustmentPercentage: number;
  unitFinalPriceMinor: number;
  subtotalBaseMinor: number;
  subtotalFinalMinor: number;
  appliedRuleId: string | null;
  appliedRuleName: string | null;
}

export interface OrderDeliveryAddress {
  street: string;
  number: string;
  floor: string | null;
  apartment: string | null;
  neighborhood: string | null;
  locality: string;
  postalCode: string | null;
  references: string | null;
}

export interface OrderClientSummary {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  documentType: string;
  documentNumber: string;
  clientType: string;
  active: boolean;
}

export interface Order {
  id: string;
  clientId: string;
  client?: OrderClientSummary;
  origin: OrderOrigin;
  status: OrderStatus;
  items: OrderItem[];
  totalBaseMinor: number;
  totalFinalMinor: number;
  deliveryAddress: OrderDeliveryAddress;
  /**
   * Delivery zone snapshot taken at order creation time. Null when the
   * client had no zone assigned in the padrón.
   */
  zona: string | null;
  customerNote: string | null;
  accountMovementId?: string | null;
  cancellationMovementId?: string | null;
  assignedTo?: string | null;
  assignedToName?: string | null;
  assignedAt?: string | null;
  startedDeliveryAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface OrderListResult {
  items: Order[];
  pagination: Pagination;
}

/**
 * Echoed by the driver delivery endpoint so the front can show the
 * "today" header without duplicating the calendar logic.
 */
export interface DeliveryToday {
  /** 0=Dom..6=Sáb resolved in the app's timezone (AR by default). */
  weekday: number;
  weekdayLabel: string;
  zones: string[];
}

export interface DriverOrderListResult extends OrderListResult {
  today: DeliveryToday;
}

// ----------------------------------------------------------------------------
// Request payloads
// ----------------------------------------------------------------------------

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateMyOrderPayload {
  items: CreateOrderItemInput[];
  customerNote?: string;
}

export interface CreateDirectOrderPayload {
  clientId: string;
  items: CreateOrderItemInput[];
  customerNote?: string;
}

export interface CancelOrderPayload {
  reason?: string;
}

// ----------------------------------------------------------------------------
// Filter shapes
// ----------------------------------------------------------------------------

export interface MyOrdersFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus | 'ALL';
}

export interface AdminOrdersFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus | 'ALL';
  origin?: OrderOrigin;
  clientType?: string;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DriverOrdersFilters {
  page?: number;
  limit?: number;
}

// ----------------------------------------------------------------------------
// Labels / tones / options
// ----------------------------------------------------------------------------

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  CONFIRMED: 'Confirmado',
  PENDING: 'Pendiente',
  ASSIGNED: 'Asignado',
  OUT_FOR_DELIVERY: 'En reparto',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export type BadgeTone =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export const ORDER_STATUS_TONE: Record<OrderStatus, BadgeTone> = {
  CONFIRMED: 'warning',
  PENDING: 'warning',
  ASSIGNED: 'info',
  OUT_FOR_DELIVERY: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'neutral',
};

export const ORDER_ORIGIN_LABEL: Record<OrderOrigin, string> = {
  CITIZEN: 'Vecino',
  STAFF: 'Personal',
};

export const ORDER_STATUS_OPTIONS: Array<{
  value: OrderStatus | 'ALL';
  label: string;
}> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'CONFIRMED', label: 'Confirmado' },
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'ASSIGNED', label: 'Asignado' },
  { value: 'OUT_FOR_DELIVERY', label: 'En reparto' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

export const ORDER_ORIGIN_OPTIONS: Array<{
  value: OrderOrigin | '';
  label: string;
}> = [
  { value: '', label: 'Todos' },
  { value: 'CITIZEN', label: 'Vecino' },
  { value: 'STAFF', label: 'Personal' },
];
