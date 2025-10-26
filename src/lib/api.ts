import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { logout } from '@/lib';

interface ApiRequestOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  params?: Record<string, string | number>;
}

/**
 * Wrapper function for API requests to Dokku Dashboard endpoints
 * @param options - Request configuration options
 * @returns Promise with the API response
 */
export async function apiRequest<T = any>(options: ApiRequestOptions): Promise<AxiosResponse<T>> {
  const { endpoint, method = 'POST', data, params } = options;

  const fullEndpoint = `/api/proxy${endpoint}`;

  const config: AxiosRequestConfig = {
    method,
    url: fullEndpoint,
    ...(data && { data }),
    ...(params && { params }),
  };

  try {
    return await axios(config);
  } catch (error) {
    const response = (error as { response: AxiosResponse }).response;
    const message = response?.data?.detail;

    if (response.status === 401 && message === 'Invalid access token') {
      await logout();
    }
    throw error;
  }
}

/**
 * Convenience methods for common HTTP operations
 */
export const api = {
  get: <T = any>(endpoint: string, params?: Record<string, string | number>) =>
    apiRequest<T>({ endpoint, method: 'GET', params }),

  post: <T = any>(endpoint: string, params?: Record<string, string | number>, data?: any) =>
    apiRequest<T>({ endpoint, method: 'POST', data, params }),

  put: <T = any>(endpoint: string, params?: Record<string, string | number>, data?: any) =>
    apiRequest<T>({ endpoint, method: 'PUT', data, params }),

  delete: <T = any>(endpoint: string, params?: Record<string, string | number>) =>
    apiRequest<T>({ endpoint, method: 'DELETE', params }),
};
