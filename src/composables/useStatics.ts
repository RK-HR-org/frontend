import { ref } from "vue";
import api from "../api/api";
import type {
  SessionStatusResponse,
  SearchModeResponse,
  StatusInfo,
  StaticDictionariesResponse,
  StaticSuggestResponse,
} from "../types";

export const useStatics = () => {
  const userStatuses = ref<StatusInfo[]>([]);
  const sessionStatuses = ref<SessionStatusResponse[]>([]);
  const searchModes = ref<SearchModeResponse[]>([]);
  const error = ref<unknown | null>(null);

  /** Статусы пользователей. */
  const fetchUserStatuses = async () => {
    try {
      error.value = null;
      const response = await api.get("/v1/static/user-statuses");
      userStatuses.value = Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      error.value = err;
      userStatuses.value = [];
    }
  };

  /** Статусы поисковых сессий. */
  const fetchSessionStatuses = async () => {
    try {
      error.value = null;
      const response = await api.get("/v1/static/session-statuses");
      sessionStatuses.value = Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      error.value = err;
      sessionStatuses.value = [];
    }
  };

  /** Режимы поиска (resumes / vacancies). */
  const fetchSearchModes = async () => {
    try {
      error.value = null;
      const response = await api.get("/v1/static/search-modes");
      searchModes.value = Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      error.value = err;
      searchModes.value = [];
    }
  };

  /** Все справочники одним запросом. */
  const getStaticDictionaries = async (): Promise<StaticDictionariesResponse> => {
    const response = await api.get("/v1/static");
    return response.data as StaticDictionariesResponse;
  };

  /** Регионы (areas). */
  const getAreas = async (): Promise<unknown[]> => {
    const response = await api.get("/v1/static/areas");
    return Array.isArray(response.data) ? response.data : [];
  };

  /** Профессиональные роли. */
  const getProfessionalRoles = async (): Promise<unknown[]> => {
    const response = await api.get("/v1/static/professional-roles");
    return Array.isArray(response.data) ? response.data : [];
  };

  /** Навыки. */
  const getSkills = async (): Promise<unknown[]> => {
    const response = await api.get("/v1/static/skills");
    return Array.isArray(response.data) ? response.data : [];
  };

  /** Отрасли. */
  const getIndustries = async (): Promise<unknown[]> => {
    const response = await api.get("/v1/static/industries");
    return Array.isArray(response.data) ? response.data : [];
  };

  /** Языки. */
  const getLanguages = async (): Promise<unknown[]> => {
    const response = await api.get("/v1/static/languages");
    return Array.isArray(response.data) ? response.data : [];
  };

  /** Работодатели. */
  const getEmployers = async (): Promise<unknown[]> => {
    const response = await api.get("/v1/static/employers");
    return Array.isArray(response.data) ? response.data : [];
  };

  /** Подсказки: регионы по тексту. */
  const suggestAreas = async (text: string): Promise<StaticSuggestResponse> => {
    const response = await api.get("/v1/static/suggest/areas", {
      params: { text },
    });
    return response.data as StaticSuggestResponse;
  };

  /** Подсказки: должности по тексту. */
  const suggestPositions = async (
    text: string,
  ): Promise<StaticSuggestResponse> => {
    const response = await api.get("/v1/static/suggest/positions", {
      params: { text },
    });
    return response.data as StaticSuggestResponse;
  };

  /** Подсказки: навыки по тексту. */
  const suggestSkills = async (text: string): Promise<StaticSuggestResponse> => {
    const response = await api.get("/v1/static/suggest/skills", {
      params: { text },
    });
    return response.data as StaticSuggestResponse;
  };

  return {
    userStatuses,
    sessionStatuses,
    searchModes,
    error,
    fetchUserStatuses,
    fetchSessionStatuses,
    fetchSearchModes,
    getStaticDictionaries,
    getAreas,
    getProfessionalRoles,
    getSkills,
    getIndustries,
    getLanguages,
    getEmployers,
    suggestAreas,
    suggestPositions,
    suggestSkills,
  };
};
