import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { logout } from '@/lib';

interface ApiRequestOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  responseType?: string;
}

/**
 * Wrapper function for API requests to Dokku Dashboard endpoints
 * @param options - Request configuration options
 * @returns Promise with the API response
 */
export async function apiRequest<T = any>(options: ApiRequestOptions): Promise<AxiosResponse<T>> {
  const { endpoint, method = 'POST', data, params, headers, responseType } = options;

  const fullEndpoint = `/api/proxy${endpoint}`;

  const config: AxiosRequestConfig = {
    method,
    responseType,
    url: fullEndpoint,
    ...(data && { data }),
    ...(params && { params }),
    ...(headers && { headers }),
  };

  try {
    return await axios(config);
  } catch (error) {
    const response = (error as { response: AxiosResponse }).response;
    const message = response?.data?.detail;

    if (response?.status === 401 && message === 'Invalid access token') {
      await logout();
    }
    throw error;
  }
}

/**
 * Convenience methods for common HTTP operations
 */
export const api = {
  get: <T = any>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    headers?: Record<string, string>,
    responseType?: string
  ) => apiRequest<T>({ endpoint, method: 'GET', params, headers, responseType }),

  post: <T = any>(
    endpoint: string,
    data?: any,
    options?: {
      params?: Record<string, string | number | boolean>;
      headers?: Record<string, string>;
      responseType?: string;
    }
  ) =>
    apiRequest<T>({
      endpoint,
      method: 'POST',
      data,
      params: options?.params,
      headers: options?.headers,
      responseType: options?.responseType,
    }),

  put: <T = any>(
    endpoint: string,
    data?: any,
    options?: {
      params?: Record<string, string | number | boolean>;
      headers?: Record<string, string>;
      responseType?: string;
    }
  ) =>
    apiRequest<T>({
      endpoint,
      method: 'PUT',
      data,
      params: options?.params,
      headers: options?.headers,
      responseType: options?.responseType,
    }),

  delete: <T = any>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    headers?: Record<string, string>,
    responseType?: string
  ) => apiRequest<T>({ endpoint, method: 'DELETE', params, headers, responseType }),
};
