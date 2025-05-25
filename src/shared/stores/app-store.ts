import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AppState {
  theme: "light" | "dark";
  isLoading: boolean;
  user: {
    id: string | null;
    name: string | null;
  };
  toggleTheme: () => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: { id: string; name: string }) => void;
  clearUser: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      theme: "light",
      isLoading: false,
      user: {
        id: null,
        name: null,
      },
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
      setLoading: (loading) => set({ isLoading: loading }),
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: { id: null, name: null } }),
    }),
    {
      name: "app-store",
    },
  ),
);
