import { ref } from "vue";
import axios from "axios";

const API_URL = "http://188.225.44.245:8080/api";

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
});

// Добавляем интерцептор для добавления токена авторизации
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useUsers = () => {
  const currentUser = ref(null);
  const teams = ref([]);
  const error = ref(null);
  const loading = ref(false);

  const fetchCurrentUser = async () => {
    try {
      loading.value = true;
      const response = await api.post("/v1/auth/me");
      currentUser.value = response.data;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTeams = async () => {
    try {
      loading.value = true;
      const response = await api.get("/v1/team/");
      teams.value = response.data;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  return { currentUser, teams, error, loading, fetchCurrentUser, fetchTeams };
};
