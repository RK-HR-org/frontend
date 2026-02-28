import { ref } from "vue";
import api from "../api/api";
import type {
  HHAuthUrlResponse,
  HHBalanceResponse,
  HHStatusResponse,
  HHTokenInfo,
} from "../types";

export const useHHOAuth = () => {
  const status = ref<HHStatusResponse | null>(null);
  const balance = ref<number | null>(null);
  const loading = ref(false);
  const balanceLoading = ref(false);
  const error = ref<unknown | null>(null);

  const fetchStatus = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get("/v1/hh/status");
      status.value = response.data as HHStatusResponse;
    } catch (err) {
      error.value = err;
      status.value = null;
    } finally {
      loading.value = false;
    }
  };

  const getAuthUrl = async (): Promise<HHAuthUrlResponse> => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get("/v1/hh/oauth/url");
      return response.data as HHAuthUrlResponse;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const refreshTokens = async (): Promise<HHTokenInfo> => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.post("/v1/hh/oauth/refresh");
      return response.data as HHTokenInfo;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchBalance = async () => {
    try {
      balanceLoading.value = true;
      const response = await api.get("/v1/hh/balance");
      const data = response.data as HHBalanceResponse;
      const value = data.balance ?? data.actual ?? data.initial;
      balance.value = typeof value === "number" ? value : null;
    } catch {
      balance.value = null;
    } finally {
      balanceLoading.value = false;
    }
  };

  const disconnect = async (): Promise<void> => {
    try {
      loading.value = true;
      error.value = null;
      await api.delete("/v1/hh/disconnect");
      status.value = null;
      balance.value = null;
    } catch (err) {
      error.value = err;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    status,
    balance,
    loading,
    balanceLoading,
    error,
    fetchStatus,
    fetchBalance,
    getAuthUrl,
    refreshTokens,
    disconnect,
  };
};
