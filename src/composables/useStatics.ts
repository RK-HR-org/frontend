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
  const getStaticDictionaries =
    async (): Promise<StaticDictionariesResponse> => {
      const response = await api.get("/v1/static");
      return response.data as StaticDictionariesResponse;
    };

  /** Регионы (areas). */
  const getAreas = async (): Promise<unknown[]> => {
    const response = await api.get("/v1/static/areas");
    return Array.isArray(response.data) ? response.data : [];
  };

  /** Профессиональные роли. Бэкенд/HH возвращают каталог { categories: [{ roles: [...] }] }, приводим к плоскому массиву без дублей (роль может входить в несколько категорий). */
  const getProfessionalRoles = async (): Promise<unknown[]> => {
    const response = await api.get("/v1/static/professional-roles");
    const data = response.data;
    if (Array.isArray(data)) return data;
    const catalog = data as { categories?: { roles?: { id?: string }[] }[] };
    if (Array.isArray(catalog?.categories)) {
      const seen = new Set<string>();
      const result: unknown[] = [];
      for (const cat of catalog.categories) {
        for (const role of cat.roles ?? []) {
          const id = role?.id != null ? String(role.id) : "";
          if (id && !seen.has(id)) {
            seen.add(id);
            result.push(role);
          }
        }
      }
      return result;
    }
    return [];
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
  const suggestSkills = async (
    text: string,
  ): Promise<StaticSuggestResponse> => {
    const response = await api.get("/v1/static/suggest/skills", {
      params: { text },
    });
    return response.data as StaticSuggestResponse;
  };

  /** Подсказки: ключевые слова поиска резюме. */
  const suggestResumeSearchKeyword = async (
    text: string,
  ): Promise<StaticSuggestResponse> => {
    const response = await api.get("/v1/static/suggest/resume-search-keyword", {
      params: { text },
    });
    return response.data as StaticSuggestResponse;
  };

  /** Подсказки: ключевые слова поиска вакансий. */
  const suggestVacancySearchKeyword = async (
    text: string,
  ): Promise<StaticSuggestResponse> => {
    const response = await api.get(
      "/v1/static/suggest/vacancy-search-keyword",
      {
        params: { text },
      },
    );
    return response.data as StaticSuggestResponse;
  };

  /** Подсказки: должности для поиска вакансий. */
  const suggestVacancyPositions = async (
    text: string,
  ): Promise<StaticSuggestResponse> => {
    const response = await api.get("/v1/static/suggest/vacancy-positions", {
      params: { text },
    });
    return response.data as StaticSuggestResponse;
  };

  /** Подсказки: учебные заведения. */
  const suggestEducationalInstitutions = async (
    text: string,
  ): Promise<StaticSuggestResponse> => {
    const response = await api.get(
      "/v1/static/suggest/educational-institutions",
      {
        params: { text },
      },
    );
    return response.data as StaticSuggestResponse;
  };

  /** Подсказки: направления обучения. */
  const suggestFieldsOfStudy = async (
    text: string,
  ): Promise<StaticSuggestResponse> => {
    const response = await api.get("/v1/static/suggest/fields-of-study", {
      params: { text },
    });
    return response.data as StaticSuggestResponse;
  };

  /** Подсказки: компании. */
  const suggestCompanies = async (
    text: string,
  ): Promise<StaticSuggestResponse> => {
    const response = await api.get("/v1/static/suggest/companies", {
      params: { text },
    });
    return response.data as StaticSuggestResponse;
  };

  /** Подсказки: дочерние регионы (города, населённые пункты). areaId сужает подсказки по стране. */
  const suggestAreaLeaves = async (
    text: string,
    areaId?: string,
  ): Promise<StaticSuggestResponse> => {
    const params: Record<string, string> = { text };
    if (areaId) params.area_id = areaId;
    const response = await api.get("/v1/static/suggest/area-leaves", {
      params,
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
    suggestResumeSearchKeyword,
    suggestVacancySearchKeyword,
    suggestVacancyPositions,
    suggestEducationalInstitutions,
    suggestFieldsOfStudy,
    suggestCompanies,
    suggestAreaLeaves,
  };
};
