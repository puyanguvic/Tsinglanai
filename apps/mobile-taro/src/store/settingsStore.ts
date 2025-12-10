import { create } from 'zustand';

type State = {
  locale: string;
  theme: 'light' | 'dark';
};

type Actions = {
  setLocale: (locale: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
};

export const useSettingsStore = create<State & Actions>((set) => ({
  locale: 'zh-CN',
  theme: 'light',
  setLocale: (locale) => set({ locale }),
  setTheme: (theme) => set({ theme }),
}));
