import { ref } from "vue";
import api from "../api/api";
import type {
  SearchCreateRequest,
  SearchEnrichRequest,
  SearchEnrichResponse,
  SearchSessionResponse,
  SearchSessionListResponse,
  SearchApproveRequest,
  SearchExecuteRequest,
  SearchExecuteResponse,
  SearchSessionWithResultsResponse,
  SearchItemListResponse,
  SearchItemDetailResponse,
  SearchItemUpdateRequest,
} from "../types";

export const useSearchSessions = () => {
  const loading = ref(false);
  const error = ref<unknown>(null);

  const createSession = async (
    payload: SearchCreateRequest,
  ): Promise<SearchSessionResponse | SearchEnrichResponse> => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.post("/v1/search/sessions", payload);
      return response.data;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const enrichSession = async (
    sessionId: string,
    payload: SearchEnrichRequest,
  ): Promise<SearchEnrichResponse> => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.post(
        `/v1/search/sessions/${sessionId}/enrich`,
        payload,
      );
      return response.data;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getSession = async (
    sessionId: string,
    withResults = false,
  ): Promise<SearchSessionResponse | SearchSessionWithResultsResponse> => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get(`/v1/search/sessions/${sessionId}`, {
        params: { with_results: withResults },
      });
      return response.data;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getUserSessions = async (
    limit = 20,
    offset = 0,
  ): Promise<SearchSessionListResponse> => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get("/v1/search/sessions", {
        params: { limit, offset },
      });
      return response.data;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getTeamSessions = async (
    teamId: string,
    limit = 20,
    offset = 0,
  ): Promise<SearchSessionListResponse> => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get(`/v1/search/teams/${teamId}/sessions`, {
        params: { limit, offset },
      });
      return response.data;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const approveSession = async (
    sessionId: string,
    payload?: SearchApproveRequest,
  ): Promise<SearchSessionResponse> => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.post(
        `/v1/search/sessions/${sessionId}/approve`,
        payload ?? {},
      );
      return response.data;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const executeSession = async (
    sessionId: string,
    payload?: SearchExecuteRequest,
  ): Promise<SearchExecuteResponse> => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.post(
        `/v1/search/sessions/${sessionId}/execute`,
        payload ?? {},
      );
      return response.data;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteSession = async (sessionId: string): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;
      await api.delete(`/v1/search/sessions/${sessionId}`);
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getSessionItems = async (
    sessionId: string,
    params?: { limit?: number; offset?: number; include_hidden?: boolean }
  ): Promise<SearchItemListResponse> => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get(
        `/v1/search/sessions/${sessionId}/items`,
        { params }
      );
      return response.data as SearchItemListResponse;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getSessionItem = async (
    sessionId: string,
    itemId: string
  ): Promise<SearchItemDetailResponse> => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get(
        `/v1/search/sessions/${sessionId}/items/${itemId}`
      );
      return response.data as SearchItemDetailResponse;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateSessionItem = async (
    sessionId: string,
    itemId: string,
    body: SearchItemUpdateRequest
  ): Promise<SearchItemDetailResponse> => {
    try {
      error.value = null;
      const response = await api.patch(
        `/v1/search/sessions/${sessionId}/items/${itemId}`,
        body
      );
      return response.data as SearchItemDetailResponse;
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  return {
    loading,
    error,
    createSession,
    enrichSession,
    getSession,
    getUserSessions,
    getTeamSessions,
    approveSession,
    executeSession,
    deleteSession,
    getSessionItems,
    getSessionItem,
    updateSessionItem,
  };
};
