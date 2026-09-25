export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'OPERADOR' | 'REPARTIDOR' | 'CIUDADANO';

export type Permission =
  | 'users.manage'
  | 'clients.read'
  | 'clients.create'
  | 'clients.update'
  | 'clients.self'
  | 'clients.linkUser'
  | 'products.read'
  | 'products.create'
  | 'products.update'
  | 'pricing.read'
  | 'pricing.manage'
  | 'pricing.quote'
  | 'orders.read'
  | 'orders.create'
  | 'orders.update'
  | 'orders.assign'
  | 'orders.cancel'
  | 'orders.self'
  | 'payments.read'
  | 'payments.review'
  | 'payments.reverse'
  | 'payments.self'
  | 'delivery.read'
  | 'delivery.update'
  | 'delivery.create'
  | 'delivery.claim'
  | 'stock.read'
  | 'stock.manage'
  | 'accounts.read'
  | 'accounts.adjust'
  | 'accounts.reverse'
  | 'accounts.self';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  documentNumber?: string | null;
  role: Role;
  permissions: Permission[];
  active: boolean;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorResponse;
