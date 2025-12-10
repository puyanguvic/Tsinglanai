import axios, { AxiosInstance } from 'axios';

export const createHttpClient = (baseURL: string, token?: string): AxiosInstance => {
  const instance = axios.create({ baseURL });
  instance.interceptors.request.use((config) => {
    if (token) {
      config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    }
    return config;
  });
  return instance;
};
