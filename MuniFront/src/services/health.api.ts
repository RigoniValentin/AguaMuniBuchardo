import { apiRequest } from './api';

export interface HealthData {
  status: 'ok';
  database: 'connected' | 'disconnected';
  uptime: number;
  timestamp: string;
}

export const healthApi = {
  get: () => apiRequest<HealthData>('/health', { skipAuth: true }),
};
