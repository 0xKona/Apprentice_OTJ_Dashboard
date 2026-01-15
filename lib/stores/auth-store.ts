import { create } from "zustand";
import { getCurrentUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

interface AuthState {
  isAuthenticated: boolean | null;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  setAuthenticated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: null,
  isLoading: true,

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      await getCurrentUser();
      set({ isAuthenticated: true, isLoading: false });
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  setAuthenticated: (value: boolean) => {
    set({ isAuthenticated: value });
  },
}));

// Initialize Hub listener
if (typeof window !== "undefined") {
  Hub.listen("auth", ({ payload }) => {
    switch (payload.event) {
      case "signedIn":
        useAuthStore.getState().setAuthenticated(true);
        break;
      case "signedOut":
        useAuthStore.getState().setAuthenticated(false);
        break;
    }
  });
}
