/**
 * Plain `apiRequest` cannot upload binary blobs because it serializes the
 * body to JSON. We use fetch directly with FormData so the existing
 * accessToken + credentials are honored by apiRequest's infrastructure.
 */
import { getAccessToken, ApiError } from '@/services/api';
import type { ApiErrorPayload } from '@/types/auth';

export interface MultipartRequestOptions {
  method?: 'POST' | 'PUT' | 'PATCH';
  fields?: Record<string, string | number | boolean | null | undefined>;
  fileField?: string;
  file?: File | Blob;
  fileName?: string;
  signal?: AbortSignal;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function multipartRequest<T>(
  path: string,
  options: MultipartRequestOptions = {},
): Promise<T> {
  const { method = 'POST', fields, fileField, file, fileName, signal } = options;

  const formData = new FormData();
  if (fields) {
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === null) continue;
      formData.append(key, String(value));
    }
  }
  if (file && fileField) {
    formData.append(fileField, file, fileName);
  }

  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    body: formData,
    headers,
    credentials: 'include',
    signal,
  });

  let json: { success?: boolean; data?: T; error?: ApiErrorPayload } | undefined;
  try {
    json = (await response.json()) as typeof json;
  } catch {
    throw new ApiError(response.status, {
      code: 'INVALID_RESPONSE',
      message: 'Respuesta inválida del servidor',
    });
  }

  if (!response.ok || !json || json.success === false) {
    const payload: ApiErrorPayload =
      json && json.success === false
        ? json.error ?? { code: 'UNKNOWN_ERROR', message: 'Error desconocido' }
        : { code: 'UNKNOWN_ERROR', message: 'Error desconocido' };
    throw new ApiError(response.status, payload);
  }

  return json.data as T;
}

/**
 * Stream a binary response as a Blob. Used to fetch receipt files
 * behind authenticated endpoints.
 */
export async function fetchBlob(
  path: string,
): Promise<{ blob: Blob; contentType: string }> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    credentials: 'include',
  });
  if (!response.ok) {
    let payload: ApiErrorPayload | undefined;
    try {
      const body = (await response.json()) as { error?: ApiErrorPayload };
      payload = body?.error;
    } catch {
      payload = undefined;
    }
    throw new ApiError(response.status, payload ?? {
      code: 'UNKNOWN_ERROR',
      message: 'Error desconocido',
    });
  }
  const blob = await response.blob();
  return {
    blob,
    contentType: response.headers.get('content-type') ?? blob.type ?? 'application/octet-stream',
  };
}