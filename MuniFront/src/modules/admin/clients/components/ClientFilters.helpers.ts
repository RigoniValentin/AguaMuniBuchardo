import {
  CLIENT_TYPE_OPTIONS,
  type ClientListFilters,
  type ClientType,
} from '../types/clients.types';

export interface ClientFiltersValue {
  search: string;
  clientType?: ClientListFilters['clientType'];
  active?: boolean;
}

export function buildFiltersFromQuery(
  filters: Partial<ClientListFilters>,
): ClientFiltersValue {
  return {
    search: filters.search ?? '',
    ...(filters.clientType ? { clientType: filters.clientType } : {}),
    ...(filters.active !== undefined ? { active: filters.active } : {}),
  };
}

const CLIENT_TYPE_VALUES = new Set<ClientType>(
  CLIENT_TYPE_OPTIONS.map((opt) => opt.value),
);

const CLIENT_TYPE_KEY = 'clientType';
const SEARCH_KEY = 'search';
const ACTIVE_KEY = 'active';
const PAGE_KEY = 'page';
const SORT_BY_KEY = 'sortBy';
const SORT_ORDER_KEY = 'sortOrder';

const VALID_SORT_BY = new Set<NonNullable<ClientListFilters['sortBy']>>([
  'lastName',
  'firstName',
  'createdAt',
  'updatedAt',
]);

const VALID_SORT_ORDER = new Set<NonNullable<ClientListFilters['sortOrder']>>([
  'asc',
  'desc',
]);

/**
 * Lee los filtros del query string. Valores desconocidos son ignorados.
 * Solo se incluyen claves con valor real; el resto usa defaults del caller.
 */
export function parseFiltersFromSearchParams(
  params: URLSearchParams,
): Partial<ClientListFilters> {
  const filters: Partial<ClientListFilters> = {};

  const search = params.get(SEARCH_KEY)?.trim();
  if (search) filters.search = search;

  const clientType = params.get(CLIENT_TYPE_KEY);
  if (clientType && CLIENT_TYPE_VALUES.has(clientType as ClientType)) {
    filters.clientType = clientType as ClientType;
  }

  const active = params.get(ACTIVE_KEY);
  if (active === 'true') filters.active = true;
  else if (active === 'false') filters.active = false;

  const page = params.get(PAGE_KEY);
  if (page) {
    const parsed = Number.parseInt(page, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      filters.page = parsed;
    }
  }

  const sortBy = params.get(SORT_BY_KEY);
  if (sortBy && VALID_SORT_BY.has(sortBy as NonNullable<ClientListFilters['sortBy']>)) {
    filters.sortBy = sortBy as NonNullable<ClientListFilters['sortBy']>;
  }

  const sortOrder = params.get(SORT_ORDER_KEY);
  if (
    sortOrder &&
    VALID_SORT_ORDER.has(sortOrder as NonNullable<ClientListFilters['sortOrder']>)
  ) {
    filters.sortOrder = sortOrder as NonNullable<ClientListFilters['sortOrder']>;
  }

  return filters;
}

/**
 * Serializa los filtros vigentes a query string. Omite las claves con valores
 * por defecto para mantener la URL limpia cuando no hay filtros aplicados.
 */
export function filtersToSearchParams(
  filters: Partial<ClientListFilters>,
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) params.set(SEARCH_KEY, filters.search);
  if (filters.clientType) params.set(CLIENT_TYPE_KEY, filters.clientType);
  if (filters.active !== undefined) params.set(ACTIVE_KEY, String(filters.active));
  if (filters.page && filters.page > 1) params.set(PAGE_KEY, String(filters.page));
  if (filters.sortBy && filters.sortBy !== 'lastName') {
    params.set(SORT_BY_KEY, filters.sortBy);
  }
  if (filters.sortOrder && filters.sortOrder !== 'asc') {
    params.set(SORT_ORDER_KEY, filters.sortOrder);
  }

  return params;
}

/** Compara dos sets de filtros para saber si el query string cambió. */
export function areFiltersEqual(
  a: Partial<ClientListFilters>,
  b: Partial<ClientListFilters>,
): boolean {
  return filtersToSearchParams(a).toString() === filtersToSearchParams(b).toString();
}
