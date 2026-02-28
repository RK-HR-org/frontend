# Карта использования API на фронтенде

Для каждого эндпоинта бэкенда указаны: composable, метод composable, типы запроса/ответа (из `src/types/index.ts`), страницы/компоненты, где вызывается.

## Условные обозначения

- **Типы**: Request = тело/параметры запроса, Response = ожидаемый ответ по типам TS.
- Путь в OpenAPI использует `team_id`, `session_id` и т.д.; во фронте в URL подставляются переменные (например, `teamId`, `sessionId`).

---

## Auth (auth.ts, useUsers)

| Method | URL | Composable / источник | Вызывающая функция | Request type | Response type | Где используется |
|--------|-----|------------------------|--------------------|--------------|---------------|-------------------|
| POST | /v1/auth/login | stores/auth.ts | login() | { email, password } | TokenResponse | Логин |
| GET | /v1/auth/me | stores/auth.ts, useUsers | getMe() / fetchMe() | — | UserResponse | auth, AccountPage, Users |
| POST | /v1/auth/logout | stores/auth.ts | logout() | { refresh_token } | — | Выход |
| POST | /v1/auth/register | useUsers | registerUser() | RegisterRequest | UserResponse | Users (админ) |

Интерсептор в api.ts при 401 вызывает `POST /v1/auth/refresh` с `RefreshRequest` (refresh_token).

---

## Teams (useTeams, useUsers)

| Method | URL | Composable | Функция | Request | Response | Использование |
|--------|-----|------------|---------|---------|----------|---------------|
| GET | /v1/team | useTeams, useUsers | fetchTeams(), getTeams() | — | TeamResponse[] (или items) | HHSearch, Teams, TeamDetail, Users |
| POST | /v1/team | useTeams, useUsers | createTeam(), createTeam() | { name, description? } | TeamResponse | Teams, Users |
| GET | /v1/team/{teamId} | useTeams | getTeamById() | — | TeamResponse | TeamDetail |
| PATCH | /v1/team/{id} | useTeams, useUsers | updateTeam(), updateTeam() | { name?, description? } | TeamResponse | Teams, TeamDetail, Users |
| DELETE | /v1/team/{id} | useTeams, useUsers | deleteTeam(), deleteTeam() | — | — | Teams, TeamDetail, Users |
| GET | /v1/team/{teamId}/permission | useTeams | fetchTeamPermissions() | — | TeamPermissionResponse | TeamDetail |
| POST | /v1/team/{teamId}/permission | useTeams | addTeamPermission() | PermissionCreateRequest | — | TeamDetail |
| DELETE | /v1/team/{teamId}/permission/{permission_type} | useTeams | deleteTeamPermission() | — | — | TeamDetail |

---

## Users (useUsers)

| Method | URL | Composable | Функция | Request | Response | Использование |
|--------|-----|------------|---------|---------|----------|---------------|
| GET | /v1/user | useUsers | fetchUsers() | — | UserResponse[] | Users, TeamDetail, UserDetail |
| PATCH | /v1/user/{id} | useUsers | updateUser() | UserUpdateRequest | UserResponse | UserDetail, Users |
| DELETE | /v1/user/{id} | useUsers | deleteUser() | — | — | Users, UserDetail |

---

## Roles (useRoles)

| Method | URL | Composable | Функция | Request | Response | Использование |
|--------|-----|------------|---------|---------|----------|---------------|
| GET | /v1/role | useRoles | fetchRoles() | — | RoleResponse[] | Roles |
| GET | /v1/role/{roleId} | useRoles | getRole() | — | RoleResponse | Roles |
| POST | /v1/role | useRoles | createRole() | RoleCreateUpdate | RoleResponse | Roles |
| PATCH | /v1/role/{roleId} | useRoles | updateRole() | RoleCreateUpdate | RoleResponse | Roles |
| DELETE | /v1/role/{roleId} | useRoles | deleteRole() | — | — | Roles |
| GET | /v1/role/{roleId}/permission | useRoles | fetchRolePermissions() | — | RolePermissionResponse | Roles |
| POST | /v1/role/{roleId}/permission | useRoles | addRolePermission() | { permission_type } | — | Roles |
| DELETE | /v1/role/{roleId}/permission/{permission_type} | useRoles | deleteRolePermission() | — | — | Roles |

---

## Search sessions HH (useSearchSessions)

| Method | URL | Функция | Request | Response | Использование |
|--------|-----|---------|---------|----------|---------------|
| POST | /v1/search/sessions | createSession | SearchCreateRequest | SearchSessionResponse \| SearchEnrichResponse | HHSearch.vue (createSessionWithEnrich) |
| POST | /v1/search/sessions/{sessionId}/enrich | enrichSession | SearchEnrichRequest | SearchEnrichResponse | Не вызывается из UI |
| GET | /v1/search/sessions/{sessionId} | getSession | query: with_results? | SearchSessionResponse \| SearchSessionWithResultsResponse | Потенциально страницы сессий |
| GET | /v1/search/sessions | getUserSessions | query: limit, offset | SearchSessionListResponse | Список сессий пользователя |
| GET | /v1/search/teams/{teamId}/sessions | getTeamSessions | query: limit, offset | SearchSessionListResponse | Список сессий команды |
| POST | /v1/search/sessions/{sessionId}/approve | approveSession | SearchApproveRequest | SearchSessionResponse | HHSearch.vue (confirmApprove) |
| POST | /v1/search/sessions/{sessionId}/execute | executeSession | SearchExecuteRequest | SearchExecuteResponse | HHSearch.vue (confirmExecute, goToExecutePage) |
| DELETE | /v1/search/sessions/{sessionId} | deleteSession | — | void | Управление сессиями |
| GET | /v1/search/sessions/{sessionId}/items | getSessionItems | query: limit?, offset?, include_hidden? | SearchItemListResponse | SessionItems.vue |
| GET | /v1/search/sessions/{sessionId}/items/{itemId} | getSessionItem | — | SearchItemDetailResponse | SessionItems.vue |
| PATCH | /v1/search/sessions/{sessionId}/items/{itemId} | updateSessionItem | SearchItemUpdateRequest | SearchItemDetailResponse | SessionItems.vue (избранное/скрытие) |

---

## Statics / справочники (useStatics)

Все запросы — GET, без тела. Ответы типизированы как массивы или StaticDictionariesResponse / StaticSuggestResponse.

| Method | URL | Функция | Параметры | Использование |
|--------|-----|---------|-----------|---------------|
| GET | /v1/static/user-statuses | fetchUserStatuses | — | Справочники |
| GET | /v1/static/session-statuses | fetchSessionStatuses | — | Справочники |
| GET | /v1/static/search-modes | fetchSearchModes | — | Справочники |
| GET | /v1/static | getStaticDictionaries | — | Общий справочник |
| GET | /v1/static/areas | getAreas | — | HHSearch.vue (loadDictionaries) |
| GET | /v1/static/professional-roles | getProfessionalRoles | — | HHSearch.vue (loadDictionaries) |
| GET | /v1/static/skills | getSkills | — | Не используется (502), навыки через suggest |
| GET | /v1/static/industries | getIndustries | — | HHSearch.vue (loadDictionaries) |
| GET | /v1/static/languages | getLanguages | — | HHSearch.vue (loadDictionaries) |
| GET | /v1/static/employers | getEmployers | — | — |
| GET | /v1/static/suggest/areas | suggestAreas | text | HHSearch.vue, HHSearchGeoSection |
| GET | /v1/static/suggest/positions | suggestPositions | text | — |
| GET | /v1/static/suggest/skills | suggestSkills | text | HHSearch.vue, HHSearchConditionsSkillsSection |
| GET | /v1/static/suggest/resume-search-keyword | suggestResumeSearchKeyword | text | — |
| GET | /v1/static/suggest/vacancy-search-keyword | suggestVacancySearchKeyword | text | — |
| GET | /v1/static/suggest/educational-institutions | suggestEducationalInstitutions | text | HHSearch.vue, HHSearchEducationExperienceSection |
| GET | /v1/static/suggest/fields-of-study | suggestFieldsOfStudy | text | — |
| GET | /v1/static/suggest/companies | suggestCompanies | text | — |
| GET | /v1/static/suggest/vacancy-positions | suggestVacancyPositions | text | — |
| GET | /v1/static/suggest/area-leaves | suggestAreaLeaves | text | — |

---

## Quota (useQuota)

| Method | URL | Функция | Request | Response | Использование |
|--------|-----|---------|---------|----------|---------------|
| GET | /v1/quota/me | getMyQuota | — | UserQuotaResponse | — |
| GET | /v1/quota/team/{teamId} | getTeamQuota | — | TeamQuotaResponse | — |
| GET | /v1/quota/teams | getAllTeamsQuota | — | TeamQuotaResponse[] | — |
| GET | /v1/quota/history | getHistory | query: team_id?, window_type?, date_from?, date_to?, limit?, offset? | QuotaHistoryResponse | — |
| GET | /v1/quota/remaining/{teamId} | getRemaining | — | RemainingQuotaResponse | HHSearch.vue (при смене команды, перед create, после execute) |
| GET | /v1/quota/limits | getAllLimits | — | QuotaLimitsResponse[] | TeamDetail |
| GET | /v1/quota/limits/{teamId} | getTeamLimits | — | QuotaLimitsResponse | TeamDetail |
| PUT | /v1/quota/limits/{teamId} | setTeamLimits | QuotaLimitsCreateUpdate | QuotaLimitsResponse | TeamDetail |
| DELETE | /v1/quota/limits/{teamId} | deleteTeamLimits | — | void | TeamDetail |

---

## HH OAuth (useHHOAuth)

| Method | URL | Функция | Request | Response | Использование |
|--------|-----|---------|---------|----------|---------------|
| GET | /v1/hh/status | fetchStatus | — | HHStatusResponse | Не используется в страницах (composable готов) |
| GET | /v1/hh/oauth/url | getAuthUrl | — | HHAuthUrlResponse | — |
| POST | /v1/hh/oauth/refresh | refreshTokens | — | HHTokenInfo | — |
| DELETE | /v1/hh/disconnect | disconnect | — | void | — |

---

## Соответствие путей OpenAPI и фронта

- OpenAPI: `/v1/team/{team_id}` — фронт: `` `/v1/team/${teamId}` `` (то же для session_id, user_id, role_id, item_id).
- Единственное различие в именовании: в коде используются camelCase-имена переменных (teamId, sessionId), в OpenAPI — snake_case в path (team_id, session_id); значения подставляются одинаково.
