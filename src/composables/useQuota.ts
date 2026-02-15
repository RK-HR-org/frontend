import { ref } from "vue";
import api from "../api/api";
import type {
  UserQuotaResponse,
  TeamQuotaResponse,
  QuotaHistoryResponse,
  RemainingQuotaResponse,
  QuotaLimitsResponse,
  QuotaLimitsCreateUpdate,
} from "../types";

export const useQuota = () => {
  const myQuota = ref<UserQuotaResponse | null>(null);
  const teamQuota = ref<TeamQuotaResponse | null>(null);
  const teamsQuota = ref<TeamQuotaResponse[]>([]);
  const history = ref<QuotaHistoryResponse | null>(null);
  const remaining = ref<RemainingQuotaResponse | null>(null);
  const limits = ref<QuotaLimitsResponse[]>([]);
  const teamLimits = ref<QuotaLimitsResponse | null>(null);

  const loading = ref(false);
  const error = ref<unknown | null>(null);

  const getMyQuota = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get("/v1/quota/me");
      myQuota.value = response.data as UserQuotaResponse;
    } catch (err) {
      error.value = err;
      myQuota.value = null;
    } finally {
      loading.value = false;
    }
  };

  const getTeamQuota = async (teamId: string) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get(`/v1/quota/team/${teamId}`);
      teamQuota.value = response.data as TeamQuotaResponse;
    } catch (err) {
      error.value = err;
      teamQuota.value = null;
    } finally {
      loading.value = false;
    }
  };

  const getAllTeamsQuota = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get("/v1/quota/teams");
      teamsQuota.value = Array.isArray(response.data)
        ? (response.data as TeamQuotaResponse[])
        : [];
    } catch (err) {
      error.value = err;
      teamsQuota.value = [];
    } finally {
      loading.value = false;
    }
  };

  const getHistory = async (params?: {
    team_id?: string;
    window_type?: "hour" | "day";
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get("/v1/quota/history", { params });
      history.value = response.data as QuotaHistoryResponse;
    } catch (err) {
      error.value = err;
      history.value = null;
    } finally {
      loading.value = false;
    }
  };

  const getRemaining = async (teamId: string) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get(`/v1/quota/remaining/${teamId}`);
      remaining.value = response.data as RemainingQuotaResponse;
    } catch (err) {
      error.value = err;
      remaining.value = null;
    } finally {
      loading.value = false;
    }
  };

  const getAllLimits = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get("/v1/quota/limits");
      limits.value = Array.isArray(response.data)
        ? (response.data as QuotaLimitsResponse[])
        : [];
    } catch (err) {
      error.value = err;
      limits.value = [];
    } finally {
      loading.value = false;
    }
  };

  const getTeamLimits = async (teamId: string) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get(`/v1/quota/limits/${teamId}`);
      teamLimits.value = response.data as QuotaLimitsResponse;
    } catch (err) {
      error.value = err;
      teamLimits.value = null;
    } finally {
      loading.value = false;
    }
  };

  const setTeamLimits = async (
    teamId: string,
    body: QuotaLimitsCreateUpdate,
  ): Promise<QuotaLimitsResponse> => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.put(`/v1/quota/limits/${teamId}`, body);
      teamLimits.value = response.data as QuotaLimitsResponse;
      return response.data as QuotaLimitsResponse;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteTeamLimits = async (teamId: string) => {
    try {
      loading.value = true;
      error.value = null;
      await api.delete(`/v1/quota/limits/${teamId}`);
      if (teamLimits.value?.team_id === teamId) {
        teamLimits.value = null;
      }
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    myQuota,
    teamQuota,
    teamsQuota,
    history,
    remaining,
    limits,
    teamLimits,
    loading,
    error,
    getMyQuota,
    getTeamQuota,
    getAllTeamsQuota,
    getHistory,
    getRemaining,
    getAllLimits,
    getTeamLimits,
    setTeamLimits,
    deleteTeamLimits,
  };
};
