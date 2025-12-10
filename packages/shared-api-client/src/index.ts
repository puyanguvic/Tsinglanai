import { createHttpClient } from './http';
import { User, Student, Teacher, InventoryItem, Venue, Report, Request } from '@tsinglan/shared-types';

type Config = {
  baseUrl: string;
  token?: string;
};

export const createApiClient = ({ baseUrl, token }: Config) => {
  const http = createHttpClient(baseUrl, token);

  return {
    auth: {
      login: (data: { email: string; password: string }) => http.post('/auth/login', data),
      weappLogin: (code: string) => http.post('/auth/weapp-login', { code }),
    },
    users: {
      list: () => http.get<User[]>('/users'),
    },
    students: {
      list: () => http.get<Student[]>('/students'),
    },
    teachers: {
      list: () => http.get<Teacher[]>('/teachers'),
    },
    inventory: {
      list: () => http.get<InventoryItem[]>('/inventory'),
    },
    venues: {
      list: () => http.get<Venue[]>('/venues'),
    },
    reports: {
      list: () => http.get<Report[]>('/reports'),
    },
    requests: {
      list: () => http.get<Request[]>('/requests'),
    },
    ai: {
      summarize: (content: string) => http.post('/ai-assistant/summarize', { content }),
    },
  };
};
