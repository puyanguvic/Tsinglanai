import { create } from 'zustand';

type State = {
  loading: boolean;
};

type Actions = {
  setLoading: (value: boolean) => void;
};

export const useUiStore = create<State & Actions>((set) => ({
  loading: false,
  setLoading: (loading) => set({ loading }),
}));
