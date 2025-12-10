import { create } from 'zustand';
import { AuthResponse } from '../modules/auth/auth.types';

type State = {
  session: AuthResponse | null;
};

type Actions = {
  setSession: (session: AuthResponse) => void;
  clear: () => void;
};

export const useAuthStore = create<State & Actions>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  clear: () => set({ session: null }),
}));
