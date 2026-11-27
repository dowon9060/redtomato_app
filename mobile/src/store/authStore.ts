import { create } from "zustand";
import { api, setToken, getToken } from "../api/client";
import type { User } from "../types/models";

type AuthState = {
  user: User | null;
  loading: boolean;
  hydrate: () => Promise<void>;
  login: (input: {
    phone: string;
    name: string;
    nickname: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  hydrate: async () => {
    try {
      const token = await getToken();
      if (!token) {
        set({ user: null, loading: false });
        return;
      }
      const data = await api<{ user: User }>("/auth/me");
      set({ user: data.user, loading: false });
    } catch {
      await setToken(null);
      set({ user: null, loading: false });
    }
  },
  login: async (input) => {
    const data = await api<{ token: string; user: User }>("/auth/login", {
      body: input,
      auth: false,
    });
    await setToken(data.token);
    set({ user: data.user });
  },
  logout: async () => {
    await setToken(null);
    set({ user: null });
  },
  refreshMe: async () => {
    const data = await api<{ user: User }>("/auth/me");
    set({ user: data.user });
  },
}));
