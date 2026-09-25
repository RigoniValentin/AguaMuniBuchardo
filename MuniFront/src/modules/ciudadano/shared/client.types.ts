/**
 * Citizen-facing Client DTO. Matches the backend `CitizenClientDto`.
 *
 * IMPORTANT: this is the ONLY shape used by /ciudadano pages.
 * No notes, userId, createdBy, updatedBy, passwordHash or admin data.
 */
export type CitizenClientType = 'LOCAL' | 'JUBILADO' | 'NO_LOCAL' | 'AYUDA_SOCIAL';

export type CitizenDocumentType = 'DNI' | 'CUIT' | 'CUIL' | 'OTHER';

export interface CitizenClientAddress {
  street: string;
  number: string;
  floor: string | null;
  apartment: string | null;
  neighborhood: string | null;
  locality: string;
  postalCode: string | null;
  references: string | null;
}

export interface CitizenClient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  documentType: CitizenDocumentType;
  documentNumber: string;
  phone: string | null;
  email: string | null;
  clientType: CitizenClientType;
  address: CitizenClientAddress;
  active: boolean;
  createdAt: string;
}

export interface UpdateMyClientPayload {
  phone?: string | null;
  email?: string | null;
  address?: Partial<{
    street: string;
    number: string;
    floor: string | null;
    apartment: string | null;
    neighborhood: string | null;
    postalCode: string | null;
    references: string | null;
  }>;
}

// ----------------------------------------------------------------------------
// Helpers (display)
// ----------------------------------------------------------------------------

export const CITIZEN_CLIENT_TYPE_LABEL: Record<CitizenClientType, string> = {
  LOCAL: 'Local',
  JUBILADO: 'Jubilado',
  NO_LOCAL: 'No local',
  AYUDA_SOCIAL: 'Ayuda social',
};

export const CITIZEN_CLIENT_TYPE_TONE: Record<
  CitizenClientType,
  'primary' | 'success' | 'warning' | 'info'
> = {
  LOCAL: 'success',
  JUBILADO: 'info',
  NO_LOCAL: 'warning',
  AYUDA_SOCIAL: 'primary',
};

export const DOCUMENT_TYPE_LABEL: Record<CitizenDocumentType, string> = {
  DNI: 'DNI',
  CUIT: 'CUIT',
  CUIL: 'CUIL',
  OTHER: 'Otro',
};

export function formatCitizenAddress(address: CitizenClientAddress): string {
  const parts: Array<string | null | undefined> = [
    `${address.street} ${address.number}`.trim(),
    address.floor || address.apartment
      ? `${address.floor ? `Piso ${address.floor}` : ''}${address.apartment ? ` ${address.apartment}` : ''}`.trim()
      : null,
    address.neighborhood,
    address.locality,
  ];
  return parts.filter(Boolean).join(', ');
}