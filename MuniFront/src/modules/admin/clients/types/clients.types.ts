export type ClientType = 'LOCAL' | 'JUBILADO' | 'NO_LOCAL' | 'AYUDA_SOCIAL';

export type DocumentType = 'DNI' | 'CUIT' | 'CUIL' | 'OTHER';

export interface ClientAddress {
  street: string;
  number: string;
  floor?: string | null;
  apartment?: string | null;
  neighborhood?: string | null;
  locality: string;
  postalCode?: string | null;
  references?: string | null;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  documentType: DocumentType | null;
  documentNumber: string | null;
  phone: string | null;
  email: string | null;
  clientType: ClientType;
  address: ClientAddress;
  zona: string | null;
  userId: string | null;
  hasUserAccount: boolean;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface ClientPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ClientListResult {
  items: Client[];
  pagination: ClientPagination;
}

export interface ClientListFilters {
  page: number;
  limit: number;
  search?: string;
  clientType?: ClientType;
  active?: boolean;
  sortBy?: 'lastName' | 'firstName' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateClientPayload {
  firstName: string;
  lastName: string;
  documentType?: DocumentType | null;
  documentNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  clientType: ClientType;
  address: ClientAddress;
  zona?: string | null;
  notes?: string | null;
  active?: boolean;
}

export type UpdateClientPayload = Partial<CreateClientPayload>;

export interface ClientTypeOption {
  value: ClientType;
  label: string;
  tone: 'primary' | 'success' | 'warning' | 'info';
}

export const CLIENT_TYPE_OPTIONS: ClientTypeOption[] = [
  { value: 'LOCAL', label: 'Local', tone: 'success' },
  { value: 'JUBILADO', label: 'Jubilado', tone: 'info' },
  { value: 'NO_LOCAL', label: 'No local', tone: 'warning' },
  { value: 'AYUDA_SOCIAL', label: 'Ayuda social', tone: 'primary' },
];

export const CLIENT_TYPE_LABEL: Record<ClientType, string> = {
  LOCAL: 'Local',
  JUBILADO: 'Jubilado',
  NO_LOCAL: 'No local',
  AYUDA_SOCIAL: 'Ayuda social',
};

export const CLIENT_TYPE_TONE: Record<ClientType, ClientTypeOption['tone']> = {
  LOCAL: 'success',
  JUBILADO: 'info',
  NO_LOCAL: 'warning',
  AYUDA_SOCIAL: 'primary',
};

export const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: 'DNI', label: 'DNI' },
  { value: 'CUIT', label: 'CUIT' },
  { value: 'CUIL', label: 'CUIL' },
  { value: 'OTHER', label: 'Otro' },
];

export function formatAddress(address: ClientAddress): string {
  const parts = [
    `${address.street} ${address.number}`.trim(),
    address.floor || address.apartment
      ? `${address.floor ? `Piso ${address.floor}` : ''}${address.apartment ? ` ${address.apartment}` : ''}`.trim()
      : null,
    address.neighborhood,
    address.locality,
  ].filter(Boolean);
  return parts.join(', ');
}
