import { defineStore } from "pinia";
import api from "../api/api";
import router from "../router";

/**
 * Тип ответа пользователя от API.
 * Соответствует схеме `UserResponse` в OpenAPI/Swagger.
 */
export interface UserResponse {
  id: string;
  email: string;
  telegram_id?: string | null;
  role: string;
  status: string;
  team_id?: string | null;
  created_at: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    access_token: localStorage.getItem("access_token") as string | null,
    refresh_token: localStorage.getItem("refresh_token") as string | null,
    user: null as UserResponse | null,
    isAuthenticated: !!localStorage.getItem("access_token"),
    loading: false,
    error: null as unknown | null,
  }),
  actions: {
    async login(email: string, password: string) {
      try {
        this.loading = true;
        this.error = null;
        const resp = await api.post("/v1/auth/login", { email, password });
        const { access_token, refresh_token } = resp.data;
        this.access_token = access_token;
        this.refresh_token = refresh_token;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        this.isAuthenticated = true;

        const me = await api.get("/v1/auth/me");
        this.user = me.data as UserResponse;
      } catch (err) {
        this.error = err as unknown;
        this.isAuthenticated = false;
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        const rf =
          (this.refresh_token as string) ||
          localStorage.getItem("refresh_token");
        if (rf) {
          await api.post("/v1/auth/logout", { refresh_token: rf });
        }
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        this.access_token = null;
        this.refresh_token = null;
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/login");
      }
    },

    async checkAuth() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        this.isAuthenticated = false;
        this.user = null;
        return;
      }

      try {
        this.loading = true;
        const resp = await api.get("/v1/auth/me");
        this.user = resp.data as UserResponse;
        this.isAuthenticated = true;
      } catch (err) {
        this.access_token = null;
        this.refresh_token = null;
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        this.error = err as unknown;
      } finally {
        this.loading = false;
      }
    },
  },
});
