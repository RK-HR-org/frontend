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
export type TextQueryLogic = "all" | "any" | "phrase" | "except";

/** Поле поиска текста для резюме (форма). */
export type TextQueryField =
  | "everywhere"
  | "title"
  | "education"
  | "experience"
  | "experience_company"
  | "experience_position"
  | "experience_description"
  | "skills";

/** Поле поиска текста для вакансий. */
export type VacancySearchField = "name" | "company_name" | "description";

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

/** Язык с уровнем (API: LanguageDTO). */
export interface LanguageDTO {
  id: string;
  level?: string | null;
}

/** Текстовый запрос для API (TextQueryDTO). */
export interface TextQueryDTO {
  text: string;
  logic?: TextQueryLogic | null;
  field?: TextQueryField | null;
  period?: TextQueryPeriod | null;
}

/** Расширенные фильтры поиска (AdvancedSearchFiltersDTO, OpenAPI). */
export interface AdvancedSearchFiltersDTO {
  textQueries?: TextQueryDTO[] | null;
  textCompanySize?: string | null;
  textIndustry?: string | null;
  byTextPrefix?: boolean | null;
  ageFrom?: number | null;
  ageTo?: number | null;
  gender?: string | null;
  labels?: string[] | null;
  areas?: number[] | null;
  relocation?: string | null;
  metro?: number[] | null;
  district?: string | null;
  citizenship?: number[] | null;
  workTicket?: number[] | null;
  businessTripReadiness?: string[] | null;
  period?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  educationLevels?: string[] | null;
  educationalInstitution?: number[] | null;
  experience?: string[] | null;
  filterExpIndustry?: number[] | null;
  filterExpPeriod?: string | null;
  employment?: string[] | null;
  schedule?: string[] | null;
  skills?: number[] | null;
  languages?: LanguageDTO[] | null;
  driverLicenseTypes?: string[] | null;
  currency?: string | null;
  salaryFrom?: number | null;
  salaryTo?: number | null;
  professionalRole?: number[] | null;
  jobSearchStatus?: string[] | null;
  withJobSearchStatus?: boolean | null;
  vacancyId?: string | null;
  resumeSimilar?: string | null;
  searchInResponses?: boolean | null;
  searchByVacancyId?: string | null;
  folders?: string[] | null;
  includeAllFolders?: boolean | null;
  savedSearchId?: string | null;
  orderBy?: string | null;
  page?: number | null;
  perPage?: number | null;
  /** ID работодателей (для вакансий). */
  employerIds?: string[] | null;
  /** Области поиска для вакансий (name, company_name, description). */
  searchField?: string[] | null;
}

/** Обогащённые данные от Coze для поиска HH. */
export interface EnrichedDataDTO {
  keywords_include?: string[];
  keywords_exclude?: string[];
  text_search?: TextSearchDTO | null;
  text_queries?: TextQueryDTO[] | null;
  skills?: string[];
  experience?: ExperienceDTO | null;
  age?: AgeDTO | null;
  location?: LocationDTO | null;
  schedule?: string[] | null;
  employment?: string[] | null;
  salary?: SalaryDTO | null;
  /** Языки (если бэкенд возвращает в формате LanguageDTO[]). */
  languages?: LanguageDTO[] | null;
}

/** Изменения после обогащения. */
export interface DiffDTO {
  added?: string[];
  changed?: string[];
  warnings?: string[];
}

/** Тело запроса создания сессии поиска (OpenAPI: queryRaw, searchType, filters). При отправке использовать queryRaw (camelCase). */
export interface SearchCreateRequest {
  team_id: string;
  mode: SearchMode;
  searchType?: "simple" | "advanced" | null;
  query_raw?: Record<string, unknown> | null;
  queryRaw?: Record<string, unknown> | null;
  filters?: AdvancedSearchFiltersDTO | null;
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

/** Минимальная структура элемента из ответа HH (общие поля). */
export interface HHExecuteItemBase {
  id?: string | number;
  alternate_url?: string | null;
}

/** Зарплата в ответе HH. */
export interface HHSalary {
  from?: number | null;
  to?: number | null;
  currency?: string | null;
}

/** Регион в ответе HH. */
export interface HHArea {
  name?: string | null;
}

/** Элемент резюме из результата execute (ответ HH). */
export interface HHResumeExecuteItem extends HHExecuteItemBase {
  title?: string | null;
  age?: number | null;
  area?: HHArea | null;
  salary?: HHSalary | null;
}

/** Элемент вакансии из результата execute (ответ HH). */
export interface HHVacancyExecuteItem extends HHExecuteItemBase {
  name?: string | null;
  employer?: { name?: string | null } | null;
  area?: HHArea | null;
  salary?: HHSalary | null;
}

/** Элемент результата execute — резюме или вакансия. */
export type HHExecuteItem = HHResumeExecuteItem | HHVacancyExecuteItem;

/** Ответ API: выполнение поиска. */
export interface SearchExecuteResponse {
  session: SearchSessionResponse;
  result: SearchResultResponse;
  items: HHExecuteItem[];
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

/** Элемент поиска (резюме/вакансия) в списке. Данные HH API — в raw_data. */
export interface SearchItemResponse {
  id: string;
  hh_id: string;
  item_type?: "resume" | "vacancy" | null;
  is_favorite?: boolean | null;
  is_hidden?: boolean | null;
  /** Данные от HH API (резюме/вакансия по документации hh.ru). */
  raw_data?: Record<string, unknown> | null;
  /** @deprecated Используйте raw_data. Оставлено для обратной совместимости. */
  payload?: Record<string, unknown> | null;
  /** Опционально: плоские поля, если бэкенд ещё отдаёт. */
  result_id?: string | null;
  session_id?: string | null;
  title?: string | null;
}

/** Детали элемента поиска. */
export interface SearchItemDetailResponse extends SearchItemResponse {
  /** Полные данные резюме (платный запрос HH, кэш). */
  full_data?: Record<string, unknown> | null;
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

/** Ответ GET /v1/hh/balance — баланс HH (рубли). */
export interface HHBalanceResponse {
  balance?: number;
  actual?: number;
  initial?: number;
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
