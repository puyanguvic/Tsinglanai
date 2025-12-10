import { useState } from 'react';
import { authService } from '../auth.service';
import { LoginInput, AuthResponse } from '../auth.types';
import { useAuthStore } from '../../store/authStore';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((s) => s.setSession);

  const login = async (payload: LoginInput) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(payload);
      setSession(res.data as AuthResponse);
    } catch (err: any) {
      setError(err?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
