import { httpClient } from './httpClient';

const API_BASE_URL = process.env.TARO_APP_API_BASE_URL || 'http://localhost:3000';

export const apiClient = {
  get: <T>(url: string, params?: any) => httpClient<T>('GET', url, params),
  post: <T>(url: string, data?: any) => httpClient<T>('POST', url, data),
  put: <T>(url: string, data?: any) => httpClient<T>('PUT', url, data),
  delete: <T>(url: string, data?: any) => httpClient<T>('DELETE', url, data),
};

export const apiConfig = {
  baseUrl: API_BASE_URL,
  version: 'v1',
};
