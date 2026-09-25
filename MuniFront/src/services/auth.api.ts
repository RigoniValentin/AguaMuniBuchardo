import { apiRequest } from './api';
import type { User } from '@/types/auth';

export interface LoginResult {
  user: User;
  accessToken: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  documentNumber: string;
}

export interface RegisterResult extends LoginResult {
  linked: boolean;
}

export interface PasswordRecoveryAck {
  ok: true;
  message: string;
}

export interface ValidateResetTokenResult {
  valid: boolean;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<LoginResult>('/auth/login', {
      method: 'POST',
      body: { email, password },
      skipAuth: true,
    }),

  register: (payload: RegisterPayload) =>
    apiRequest<RegisterResult>('/auth/register', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    }),

  logout: () =>
    apiRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
      skipAuth: true,
    }),

  me: () => apiRequest<{ user: User }>('/auth/me'),

  refresh: () =>
    apiRequest<LoginResult>('/auth/refresh', {
      method: 'POST',
      skipAuth: true,
    }),

  forgotPassword: (email: string) =>
    apiRequest<PasswordRecoveryAck>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      skipAuth: true,
    }),

  validateResetToken: (token: string) => {
    const params = new URLSearchParams({ token });
    return apiRequest<ValidateResetTokenResult>(
      `/auth/reset-password/validate?${params.toString()}`,
      { skipAuth: true },
    );
  },

  resetPassword: (token: string, password: string) =>
    apiRequest<PasswordRecoveryAck>('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
      skipAuth: true,
    }),
};
