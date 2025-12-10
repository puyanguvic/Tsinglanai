import Taro from '@tarojs/taro';
import { apiConfig } from './apiConfig';

export async function httpClient<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, data?: any) {
  const token = Taro.getStorageSync('accessToken');

  const res = await Taro.request<T>({
    url: `${apiConfig.baseUrl}${url}`,
    method,
    data,
    header: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (res.statusCode >= 400) {
    throw new Error((res.data as any)?.message || 'Request failed');
  }

  if ((res.data as any)?.accessToken) {
    Taro.setStorageSync('accessToken', (res.data as any).accessToken);
  }

  return res;
}
