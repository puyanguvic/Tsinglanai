import {
  AttendanceRecord,
  CalendarEvent,
  ClassConsumption,
  Contract,
  FixedAsset,
  InventoryItem,
  Notification,
  PurchaseRequest,
  SchoolFile,
  Student,
  Teacher,
  Venue,
  WeeklyReport,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const defaultHeaders = {
  'Content-Type': 'application/json',
};

type HttpResponse = {
  status: number;
  ok: boolean;
  json: () => Promise<any>;
  text: () => Promise<string>;
};

async function fetchLike(url: string, options: RequestInit): Promise<HttpResponse> {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // allow cookie-based auth
  });
  return {
    status: res.status,
    ok: res.ok,
    json: () => res.json(),
    text: () => res.text(),
  };
}

async function doRequest(url: string, options: RequestInit): Promise<HttpResponse> {
  if (typeof fetch === 'function') {
    return fetchLike(url, options);
  }
  const taro = (globalThis as any)?.Taro;
  if (taro && typeof taro.request === 'function') {
    const payload = options.body
      ? typeof options.body === 'string'
        ? JSON.parse(options.body)
        : (options.body as any)
      : undefined;

    const res = await taro.request({
      url,
      method: (options.method || 'GET') as any,
      data: payload,
      header: {
        ...defaultHeaders,
        ...(options.headers as Record<string, string>),
      },
      withCredentials: true,
    });

    return {
      status: res.statusCode,
      ok: res.statusCode >= 200 && res.statusCode < 300,
      json: async () => res.data,
      text: async () => (typeof res.data === 'string' ? res.data : JSON.stringify(res.data)),
    };
  }
  throw new Error('No fetch or Taro.request available in this environment.');
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await doRequest(`${API_BASE}${path}`, options);

  if (!res.ok) {
    const message = await res.text();
    throw new Error(`API ${res.status}: ${message}`);
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}

const crud = <T>(resource: string) => ({
  list: () => apiRequest<T[]>(`/api/${resource}`, { method: 'GET' }),
  upsert: (payload: Partial<T> | Array<Partial<T>>) =>
    apiRequest<T | T[]>(`/api/${resource}`, { method: 'PUT', body: JSON.stringify(payload) }),
  create: (payload: Partial<T> | Array<Partial<T>>) =>
    apiRequest<T | T[]>(`/api/${resource}`, { method: 'POST', body: JSON.stringify(payload) }),
  update: (criteria: Partial<T>, payload: Partial<T>) =>
    apiRequest<T | T[]>(`/api/${resource}`, {
      method: 'PATCH',
      body: JSON.stringify({ criteria, payload }),
    }),
  remove: (criteria: Partial<Record<keyof T, Json>>) =>
    apiRequest<null>(`/api/${resource}`, { method: 'DELETE', body: JSON.stringify(criteria) }),
});

export const apiClient = {
  inventory: crud<InventoryItem>('inventory'),
  requests: crud<PurchaseRequest>('requests'),
  teachers: crud<Teacher>('teachers'),
  students: crud<Student>('students'),
  fixedAssets: crud<FixedAsset>('fixed_assets'),
  calendar: crud<CalendarEvent>('calendar_events'),
  attendance: crud<AttendanceRecord>('attendance_logs'),
  consumptions: crud<ClassConsumption>('consumptions'),
  notifications: crud<Notification>('notifications'),
  weeklyReport: crud<WeeklyReport>('weekly_report'),
  contracts: crud<Contract>('contracts'),
  files: crud<SchoolFile>('school_files'),
  recycleBin: crud<any>('recycle_bin'),
  venues: crud<Venue>('venues'),

  auth: {
    login: (payload: { username: string; password: string }) =>
      apiRequest<{ token: string; role: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    refresh: () => apiRequest<{ token: string; role: string }>('/api/auth/refresh', { method: 'POST' }),
  },

  ai: {
    summarizeWeeklyReport: (payload: { reportId: string }) =>
      apiRequest<{ summary: string }>('/api/ai/summarize-weekly-report', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
};
