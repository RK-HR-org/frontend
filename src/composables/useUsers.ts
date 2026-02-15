import { ref } from "vue";
import api from "../api/api";

/** Схема пользователя (совпадает с UserResponse в auth store). */
export interface UserItem {
  id: string;
  email: string;
  telegram_id?: string | null;
  role: string;
  status: string;
  team_id?: string | null;
  created_at: string;
}

/** Тело запроса создания/обновления пользователя. */
export interface UserCreateUpdate {
  email?: string;
  password?: string;
  role?: string;
  status?: string;
  telegram_id?: string | null;
  team_id?: string | null;
}

export const useUsers = () => {
  const currentUser = ref(null);
  const teams = ref([]);
  const usersList = ref([]);
  const error = ref(null);
  const loading = ref(false);
  const loadingUsers = ref(false);

  const fetchCurrentUser = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get("/v1/auth/me");
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
      error.value = null;
      const response = await api.get("/v1/team");
      const data = response.data;
      teams.value = Array.isArray(data)
        ? data
        : data?.items ?? data?.data ?? [];
    } catch (err) {
      error.value = err;
      teams.value = [];
    } finally {
      loading.value = false;
    }
  };

  /** Создание команды. */
  const createTeam = async (payload) => {
    try {
      error.value = null;
      const response = await api.post("/v1/team", payload);
      await fetchTeams();
      return response.data;
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  /** Обновление команды. */
  const updateTeam = async (id, payload) => {
    try {
      error.value = null;
      const response = await api.patch(`/v1/team/${id}`, payload);
      await fetchTeams();
      return response.data;
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  /** Удаление команды. */
  const deleteTeam = async (id) => {
    try {
      error.value = null;
      await api.delete(`/v1/team/${id}`);
      await fetchTeams();
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  /** Список пользователей (CRUD). */
  const fetchUsers = async () => {
    try {
      loadingUsers.value = true;
      error.value = null;
      const response = await api.get("/v1/user");
      usersList.value = Array.isArray(response.data)
        ? response.data
        : response.data?.items ?? response.data?.data ?? [];
    } catch (err) {
      error.value = err;
      usersList.value = [];
    } finally {
      loadingUsers.value = false;
    }
  };

  const createUser = async (payload) => {
    try {
      error.value = null;
      const response = await api.post("/v1/auth/register", payload);
      await fetchUsers();
      return response.data;
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  const updateUser = async (id, payload) => {
    try {
      error.value = null;
      const response = await api.patch(`/v1/user/${id}`, payload);
      await fetchUsers();
      return response.data;
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  const deleteUser = async (id) => {
    try {
      error.value = null;
      await api.delete(`/v1/user/${id}`);
      await fetchUsers();
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  return {
    currentUser,
    teams,
    usersList,
    error,
    loading,
    loadingUsers,
    fetchCurrentUser,
    fetchTeams,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    createTeam,
    updateTeam,
    deleteTeam,
  };
};
