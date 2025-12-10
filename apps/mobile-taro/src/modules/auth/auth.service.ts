import { apiClient } from '../../services/apiConfig';
import { LoginInput, AuthResponse } from './auth.types';

export const authService = {
  login: (payload: LoginInput) => apiClient.post<AuthResponse>('/auth/login', payload),
  weappLogin: (code: string) => apiClient.post<AuthResponse>('/auth/weapp-login', { code }),
};
