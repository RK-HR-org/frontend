/**
 * Общие типы API (согласованы с OpenAPI/Swagger бэкенда).
 */

/** Информация о роли пользователя. */
export interface RoleInfo {
  id: string;
  name: string;
}

/** Информация о команде. */
export interface TeamInfo {
  id: string;
  name: string;
  /** Является ли текущий пользователь менеджером этой команды. */
  is_manager?: boolean;
}

/** Ответ API: текущий пользователь / пользователь в списке. */
export interface UserResponse {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role: RoleInfo;
  status: UserStatus;
  teams: TeamInfo[];
  created_at: string;
}

/** Элемент справочника статусов пользователя. */
export interface StatusInfo {
  value: string;
  name: string;
}

/** Статусы пользователя (enum из OpenAPI). */
export type UserStatus = "active" | "inactive" | "blocked";

/** Тело запроса регистрации пользователя. */
export interface UserCreateRequest {
  email: string;
  password: string;
  first_name?: string | null;
  last_name?: string | null;
  role_id: string;
  team_ids?: string[];
}

/** Тело запроса обновления пользователя (PATCH). */
export interface UserUpdateRequest {
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role_id?: string | null;
  status?: string | null;
  team_ids?: string[] | null;
}

/** Ответ API: роль (список / по ID). */
export interface RoleResponse {
  id: string;
  name: string;
  description?: string | null;
  is_system?: boolean;
}

/** Тело запроса создания/обновления роли. */
export interface RoleCreateUpdate {
  name: string;
  description?: string | null;
  is_system?: boolean;
}

/** Ответ API: команда (полная). */
export interface TeamResponse {
  id: string;
  name: string;
  description?: string | null;
  is_active?: boolean;
  created_at: string;
}

/** Типы прав доступа (enum из OpenAPI). */
export type PermissionType =
  | "add_users"
  | "edit_users"
  | "delete_users"
  | "view_users_list"
  | "view_user_details"
  | "view_teams_list"
  | "view_team_details"
  | "execute_hh_search"
  | "manage_team_permissions"
  | "manage_team_quotas";

/** Информация о назначенном праве. */
export interface PermissionInfo {
  id: string;
  permission_type: PermissionType;
  created_at: string;
}

/** Тело запроса добавления права (роли/команде). */
export interface PermissionCreateRequest {
  permission_type: PermissionType;
}

/** Ответ API: права роли. */
export interface RolePermissionResponse {
  role_id: string;
  role_name: string;
  permissions: PermissionInfo[];
}

/** Ответ API: права команды. */
export interface TeamPermissionResponse {
  team_id: string;
  team_name: string;
  permissions: PermissionInfo[];
}

/** Справочник: статус поисковой сессии. */
export interface SessionStatusResponse {
  value: string;
  name: string;
}

/** Справочник: режим поиска. */
export interface SearchModeResponse {
  value: string;
  name: string;
}

/** Элемент справочника (регионы, роли, навыки и т.д.) — базовая структура. */
export interface StaticItem {
  id?: string;
  value?: string;
  name: string;
  [key: string]: unknown;
}

/** Ответ GET /v1/static — все справочники (ключи — имена справочников). */
export type StaticDictionariesResponse = Record<string, unknown[]>;

/** Ответ suggest-эндпоинтов (подсказки по тексту). */
export type StaticSuggestResponse = unknown[] | { items?: unknown[] };

// --- Поисковые сессии и промпты Cozy AI (Coze) ---

/** Режим поиска: резюме или вакансии. */
export type SearchMode = "resumes" | "vacancies";

/** Статусы поисковой сессии. */
export type SearchStatus =
  | "draft"
  | "enriched"
  | "approved"
  | "executed"
  | "failed";

/** Промпты для обогащения через Coze (Cozy AI). */
export interface PromptsDTO {
  positive?: string | null;
  negative?: string | null;
}

/** Возрастные ограничения (только для поиска резюме). */
export interface AgeDTO {
  age_from?: number | null;
  age_to?: number | null;
}

/** Опыт работы (HH: noExperience, between1And3, between3And6, moreThan6). */
export interface ExperienceDTO {
  hh_experience_id?: string | null;
}

/** Регион/локация. */
export interface LocationDTO {
  area_id?: number | null;
  area_name?: string | null;
}

/** Зарплатная вилка. */
export interface SalaryDTO {
  salary_from?: number | null;
  salary_to?: number | null;
  currency?: string | null;
  only_with_salary?: boolean | null;
}

/** Структурированный текстовый поиск для HH API. */
export interface TextSearchDTO {
  query: string;
  logic?: string | null;
  field?: string[] | null;
  period?: string | null;
}

/** Логика текстового условия поиска (форма). */
export type TextQueryLogic = "all" | "any" | "phrase";

/** Поле поиска текста (форма). */
export type TextQueryField =
  | "everywhere"
  | "title"
  | "education"
  | "keywords"
  | "experience"
  | "experience_company"
  | "experience_position"
  | "experience_description"
  | "skills";

/** Период для текстового поиска (форма). */
export type TextQueryPeriod =
  | "all_time"
  | "last_year"
  | "last_three_years"
  | "last_six_years";

/** Одно текстовое условие поиска в форме. */
export interface TextQueryItem {
  text: string;
  logic: TextQueryLogic;
  field: TextQueryField;
  period: TextQueryPeriod;
}

/** Обогащённые данные от Coze для поиска HH. */
export interface EnrichedDataDTO {
  keywords_include?: string[];
  keywords_exclude?: string[];
  text_search?: TextSearchDTO | null;
  skills?: string[];
  experience?: ExperienceDTO | null;
  age?: AgeDTO | null;
  location?: LocationDTO | null;
  schedule?: string[] | null;
  employment?: string[] | null;
  salary?: SalaryDTO | null;
}

/** Изменения после обогащения. */
export interface DiffDTO {
  added?: string[];
  changed?: string[];
  warnings?: string[];
}

/** Тело запроса создания сессии поиска (OpenAPI: queryRaw, searchType; бэкенд принимает query_raw). */
export interface SearchCreateRequest {
  team_id: string;
  mode: SearchMode;
  searchType?: "simple" | "advanced" | null;
  query_raw?: Record<string, unknown> | null;
  queryRaw?: Record<string, unknown> | null;
  filters?: unknown;
  prompts?: PromptsDTO | null;
}

/** Тело запроса обогащения сессии. */
export interface SearchEnrichRequest {
  prompts: PromptsDTO;
  filters?: Record<string, unknown> | null;
}

/** Ответ обогащения сессии (create с промптами или enrich). */
export interface SearchEnrichResponse {
  session_id: string;
  enriched_filters: EnrichedDataDTO;
  diff: DiffDTO;
}

/** Тело запроса подтверждения сессии. */
export interface SearchApproveRequest {
  hh_request?: Record<string, unknown> | null;
}

/** Тело запроса выполнения поиска. */
export interface SearchExecuteRequest {
  page?: number;
}

/** Ответ API: сессия поиска. */
export interface SearchSessionResponse {
  id: string;
  user_id: string;
  team_id: string;
  mode: SearchMode;
  query_raw: Record<string, unknown>;
  query_enriched?: Record<string, unknown> | null;
  hh_request?: Record<string, unknown> | null;
  status: SearchStatus;
  approved_by?: string | null;
  approved_at?: string | null;
  executed_at?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

/** Ответ API: список сессий поиска. */
export interface SearchSessionListResponse {
  items: SearchSessionResponse[];
  total: number;
  limit: number;
  offset: number;
}

/** Ответ API: результат поиска (сохранённый). */
export interface SearchResultResponse {
  id: string;
  session_id: string;
  hh_response_json: Record<string, unknown>;
  items_count: number;
  hh_found?: number | null;
  fetched_at: string;
}

/** Ответ API: выполнение поиска. */
export interface SearchExecuteResponse {
  session: SearchSessionResponse;
  result: SearchResultResponse;
  items: unknown[];
  found: number;
  pages: number;
  per_page: number;
  page: number;
}

/** Сессия поиска вместе с сохранёнными результатами. */
export interface SearchSessionWithResultsResponse {
  id: string;
  user_id: string;
  team_id: string;
  mode: SearchMode;
  query_raw: Record<string, unknown>;
  query_enriched?: Record<string, unknown> | null;
  hh_request?: Record<string, unknown> | null;
  status: SearchStatus;
  approved_by?: string | null;
  approved_at?: string | null;
  executed_at?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  results: SearchResultResponse[];
}

/** Элемент поиска (резюме/вакансия) в списке. */
export interface SearchItemResponse {
  id: string;
  result_id: string;
  session_id: string;
  hh_id: string;
  is_favorite?: boolean | null;
  is_hidden?: boolean | null;
  payload?: Record<string, unknown> | null;
  created_at: string;
}

/** Детали элемента поиска. */
export interface SearchItemDetailResponse extends SearchItemResponse {
  [key: string]: unknown;
}

/** Ответ: список элементов сессии. */
export interface SearchItemListResponse {
  items: SearchItemResponse[];
  total: number;
  limit: number;
  offset: number;
}

/** Тело запроса обновления элемента (PATCH). */
export interface SearchItemUpdateRequest {
  is_favorite?: boolean | null;
  is_hidden?: boolean | null;
}

// --- HH OAuth ---

/** Ответ: URL для авторизации в HH. */
export interface HHAuthUrlResponse {
  auth_url: string;
  state: string;
}

/** Ответ: статус подключения HH. */
export interface HHStatusResponse {
  connected: boolean;
  expires_at?: string | null;
  expires_in_seconds?: number | null;
}

/** Информация о HH-токенах. */
export interface HHTokenInfo {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  token_type?: string;
}

// --- Квоты и лимиты ---

/** Общая статистика использования квоты. */
export interface QuotaUsageStats {
  requests_total: number;
  requests_success: number;
  requests_429: number;
}

/** Информация о квоте за период. */
export interface QuotaWindowInfo {
  used: number;
  limit: number;
  remaining: number;
}

/** Лимиты квот для команды (создание/обновление). */
export interface QuotaLimitsCreateUpdate {
  requests_per_hour: number;
  requests_per_day: number;
}

/** Лимиты квот для команды (ответ). */
export interface QuotaLimitsResponse {
  id: string;
  team_id: string;
  requests_per_hour: number;
  requests_per_day: number;
  created_at: string;
  updated_at: string;
}

/** Оставшаяся квота команды. */
export interface RemainingQuotaResponse {
  team_id: string;
  has_limits: boolean;
  hour?: QuotaWindowInfo | null;
  day?: QuotaWindowInfo | null;
  can_make_request: boolean;
}

/** Ответ по квотам одной команды. */
export interface TeamQuotaResponse {
  team_id: string;
  team_name: string;
  limits?: QuotaLimitsResponse | null;
  usage_last_hour: QuotaUsageStats;
  usage_last_day: QuotaUsageStats;
  hh_rate_limit?: Record<string, unknown> | null;
  warnings?: string[];
}

/** Ответ по квотам текущего пользователя. */
export interface UserQuotaResponse {
  user_id: string;
  email: string;
  usage_last_hour: QuotaUsageStats;
  usage_last_day: QuotaUsageStats;
  teams: TeamQuotaResponse[];
}

/** Элемент истории использования квот. */
export interface QuotaHistoryItem {
  id: string;
  team_id: string;
  team_name?: string | null;
  user_id?: string | null;
  user_email?: string | null;
  window_start: string;
  window_end: string;
  window_type: string;
  requests_total: number;
  requests_success: number;
  requests_429: number;
  recorded_at: string;
}

/** Ответ: история использования квот. */
export interface QuotaHistoryResponse {
  items: QuotaHistoryItem[];
  total: number;
}
