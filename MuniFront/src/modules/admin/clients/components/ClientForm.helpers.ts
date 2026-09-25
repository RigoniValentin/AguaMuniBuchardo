import type {
  Client,
  ClientAddress,
  ClientType,
  CreateClientPayload,
  DocumentType,
  UpdateClientPayload,
} from '../types/clients.types';
import type { ClientFormValues } from './ClientForm.schema';

export function emptyAddress(): ClientFormValues['address'] {
  return {
    street: '',
    number: '',
    floor: '',
    apartment: '',
    neighborhood: '',
    locality: 'Buchardo',
    postalCode: '',
    references: '',
  };
}

export function defaultClientFormValues(client?: Client): ClientFormValues {
  if (!client) {
    return {
      firstName: '',
      lastName: '',
      documentType: 'DNI',
      documentNumber: '',
      phone: '',
      email: '',
      clientType: 'LOCAL',
      address: emptyAddress(),
      zona: '',
      notes: '',
      active: true,
    };
  }
  return {
    firstName: client.firstName,
    lastName: client.lastName,
    documentType: client.documentType ?? 'DNI',
    documentNumber: client.documentNumber ?? '',
    phone: client.phone ?? '',
    email: client.email ?? '',
    clientType: client.clientType,
    address: {
      street: client.address.street,
      number: client.address.number,
      floor: client.address.floor ?? '',
      apartment: client.address.apartment ?? '',
      neighborhood: client.address.neighborhood ?? '',
      locality: client.address.locality,
      postalCode: client.address.postalCode ?? '',
      references: client.address.references ?? '',
    },
    zona: client.zona ?? '',
    notes: client.notes ?? '',
    active: client.active,
  };
}

export function toPayload(
  values: ClientFormValues,
): CreateClientPayload | UpdateClientPayload {
  const address: ClientAddress = {
    street: values.address.street.trim(),
    number: values.address.number.trim(),
    locality: values.address.locality.trim(),
    floor: (values.address.floor ?? '').trim() || null,
    apartment: (values.address.apartment ?? '').trim() || null,
    neighborhood: (values.address.neighborhood ?? '').trim() || null,
    postalCode: (values.address.postalCode ?? '').trim() || null,
    references: (values.address.references ?? '').trim() || null,
  };
  const trimmedDocNumber = (values.documentNumber ?? '').trim();
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    documentType: (values.documentType ?? 'DNI') as DocumentType,
    ...(trimmedDocNumber ? { documentNumber: trimmedDocNumber } : {}),
    phone: (values.phone ?? '').trim() || null,
    email: (values.email ?? '').trim().toLowerCase() || null,
    clientType: values.clientType as ClientType,
    address,
    zona: (values.zona ?? '').trim().toUpperCase() || null,
    notes: (values.notes ?? '').trim() || null,
    active: values.active,
  };
}
