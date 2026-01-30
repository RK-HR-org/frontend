import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const API_URL = "http://188.225.44.245:8080/api";

const api = axios.create({
  baseURL: API_URL,
});

export const useAuth = () => {
  const router = useRouter();
  const isAuthenticated = ref(!!localStorage.getItem("access_token"));
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Добавляем интерцептор для добавления токена
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Интерцептор для обработки ошибок 401
  api.interceptors.response.use(
    (response) => response,
    (err) => {
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        isAuthenticated.value = false;
        router.push("/login");
      }
      return Promise.reject(err);
    },
  );

  const login = async (email: string, password: string) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.post("/v1/auth/login", {
        email,
        password,
      });

      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
      isAuthenticated.value = true;

      // Получаем данные пользователя
      const userResponse = await api.post("/v1/auth/me");
      user.value = userResponse.data;

      router.push("/users");
    } catch (err) {
      error.value = err;
      isAuthenticated.value = false;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await api.post("/v1/auth/logout", {
          refresh_token: refreshToken,
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      isAuthenticated.value = false;
      user.value = null;
      router.push("/login");
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      isAuthenticated.value = false;
      return;
    }

    try {
      const response = await api.post("/v1/auth/me");
      user.value = response.data;
      isAuthenticated.value = true;
    } catch (err) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      isAuthenticated.value = false;
      user.value = null;
    }
  };

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
    checkAuth,
  };
};
