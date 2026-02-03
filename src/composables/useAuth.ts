import { useAuthStore } from "../stores/auth";

// Compatibility wrapper: use Pinia store
export const useAuth = () => {
  const store = useAuthStore();
  return {
    isAuthenticated: store.$state.isAuthenticated,
    user: store.$state.user,
    loading: store.$state.loading,
    error: store.$state.error,
    login: store.login,
    logout: store.logout,
    checkAuth: store.checkAuth,
  } as const;
};
