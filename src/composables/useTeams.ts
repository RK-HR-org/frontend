import { ref } from "vue";
import api from "../api/api";
import type {
  TeamResponse,
  TeamPermissionResponse,
  PermissionCreateRequest,
  PermissionType,
} from "../types";

export const useTeams = () => {
  const teams = ref<TeamResponse[]>([]);
  const selectedTeam = ref<TeamResponse | null>(null);
  const teamPermissions = ref<TeamPermissionResponse | null>(null);
  const loading = ref(false);
  const error = ref<unknown>(null);

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

  const createTeam = async (payload: {
    name: string;
    description?: string | null;
  }) => {
    try {
      error.value = null;
      const raw = payload.description;
      const description =
        raw != null && String(raw).trim() !== "" ? String(raw).trim() : null;
      const body = {
        name: payload.name.trim(),
        description,
      };
      const response = await api.post("/v1/team", body);
      await fetchTeams();
      return response.data;
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  const updateTeam = async (
    id: string,
    payload: { name?: string; description?: string | null }
  ) => {
    try {
      error.value = null;
      const raw = payload.description;
      const description =
        raw !== undefined && raw !== null && String(raw).trim() !== ""
          ? String(raw).trim()
          : null;
      const body: { name: string; description: string | null } = {
        name: payload.name !== undefined ? String(payload.name).trim() : "",
        description,
      };
      const response = await api.patch(`/v1/team/${id}`, body);
      await fetchTeams();
      return response.data;
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      error.value = null;
      await api.delete(`/v1/team/${id}`);
      await fetchTeams();
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  const getTeamById = async (teamId: string) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get(`/v1/team/${teamId}`);
      selectedTeam.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err;
      selectedTeam.value = null;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchTeamPermissions = async (teamId: string) => {
    try {
      error.value = null;
      const response = await api.get(`/v1/team/${teamId}/permission`);
      teamPermissions.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err;
      teamPermissions.value = null;
      throw err;
    }
  };

  const addTeamPermission = async (
    teamId: string,
    payload: PermissionCreateRequest
  ) => {
    try {
      error.value = null;
      await api.post(`/v1/team/${teamId}/permission`, payload);
      await fetchTeamPermissions(teamId);
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  const deleteTeamPermission = async (
    teamId: string,
    permission_type: PermissionType
  ) => {
    try {
      error.value = null;
      await api.delete(`/v1/team/${teamId}/permission/${permission_type}`);
      await fetchTeamPermissions(teamId);
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  return {
    teams,
    selectedTeam,
    teamPermissions,
    loading,
    error,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    getTeamById,
    fetchTeamPermissions,
    addTeamPermission,
    deleteTeamPermission,
  };
};
