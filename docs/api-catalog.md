# Каталог API (OpenAPI бэкенда и HH)

Источники: `src/api/openapi.json` (бэкенд), `src/api/openapi hh.yml` (HeadHunter API).

## 1. Эндпоинты бэкенда (openapi.json)

Все пути с указанием метода, схемы тела запроса и ответа (200/201).

| Method | Path | Request schema | Response schema |
|--------|------|----------------|-----------------|
| POST | /v1/auth/register | RegisterRequest | UserResponse |
| POST | /v1/auth/login | LoginRequest | TokenResponse |
| POST | /v1/auth/refresh | RefreshRequest | TokenResponse |
| POST | /v1/auth/logout | LogoutRequest | MessageResponse |
| GET | /v1/auth/me | — | UserResponse |
| GET | /v1/team | — | (array/object) |
| POST | /v1/team | TeamCreateUpdate | TeamResponse |
| GET | /v1/team/{team_id} | — | TeamResponse |
| PATCH | /v1/team/{team_id} | TeamCreateUpdate | TeamResponse |
| DELETE | /v1/team/{team_id} | — | — |
| GET | /v1/team/{team_id}/members | — | TeamMembersResponse |
| POST | /v1/team/{team_id}/members | AddTeamMemberRequest | — |
| DELETE | /v1/team/{team_id}/members/{user_id} | — | — |
| PATCH | /v1/team/{team_id}/members/{user_id}/manager | SetManagerRequest | — |
| GET | /v1/team/{team_id}/permission | — | TeamPermissionResponse |
| POST | /v1/team/{team_id}/permission | PermissionCreateRequest | PermissionInfo |
| DELETE | /v1/team/{team_id}/permission/{permission_type} | — | — |
| GET | /v1/user | — | (array) |
| PATCH | /v1/user/{user_id} | UserUpdate | UserResponse |
| DELETE | /v1/user/{user_id} | — | — |
| GET | /v1/static/session-statuses | — | — |
| GET | /v1/static/search-modes | — | — |
| GET | /v1/static/user-statuses | — | — |
| GET | /v1/static | — | — |
| GET | /v1/static/areas | — | — |
| GET | /v1/static/professional-roles | — | — |
| GET | /v1/static/skills | — | — |
| GET | /v1/static/industries | — | — |
| GET | /v1/static/languages | — | — |
| GET | /v1/static/employers | — | — |
| GET | /v1/static/suggest/areas | — | — |
| GET | /v1/static/suggest/positions | — | — |
| GET | /v1/static/suggest/skills | — | — |
| GET | /v1/static/suggest/resume-search-keyword | — | — |
| GET | /v1/static/suggest/vacancy-search-keyword | — | — |
| GET | /v1/static/suggest/fields-of-study | — | — |
| GET | /v1/static/suggest/educational-institutions | — | — |
| GET | /v1/static/suggest/companies | — | — |
| GET | /v1/static/suggest/vacancy-positions | — | — |
| GET | /v1/static/suggest/area-leaves | — | — |
| GET | /v1/role | — | — |
| POST | /v1/role | RoleCreateUpdate | RoleResponse |
| GET | /v1/role/{role_id} | — | RoleResponse |
| PATCH | /v1/role/{role_id} | RoleCreateUpdate | RoleResponse |
| DELETE | /v1/role/{role_id} | — | — |
| GET | /v1/role/{role_id}/permission | — | RolePermissionResponse |
| POST | /v1/role/{role_id}/permission | PermissionCreateRequest | PermissionInfo |
| DELETE | /v1/role/{role_id}/permission/{permission_type} | — | — |
| GET | /v1/hh/oauth/url | — | HHAuthUrlResponse |
| GET | /v1/hh/oauth/callback | — | HHTokenInfo |
| POST | /v1/hh/oauth/refresh | — | HHTokenInfo |
| GET | /v1/hh/status | — | HHStatusResponse |
| DELETE | /v1/hh/disconnect | — | — |
| GET | /v1/hh/balance | — | — |
| POST | /v1/search/sessions | SearchCreateRequest | (mixed) |
| GET | /v1/search/sessions | — | SearchSessionListResponse |
| POST | /v1/search/sessions/{session_id}/enrich | SearchEnrichRequest | SearchEnrichResponse |
| POST | /v1/search/sessions/{session_id}/approve | SearchApproveRequest | SearchSessionResponse |
| POST | /v1/search/sessions/{session_id}/execute | SearchExecuteRequest | SearchExecuteResponse |
| GET | /v1/search/sessions/{session_id} | — | — |
| DELETE | /v1/search/sessions/{session_id} | — | — |
| GET | /v1/search/teams/{team_id}/sessions | — | SearchSessionListResponse |
| GET | /v1/search/sessions/{session_id}/items | — | SearchItemListResponse |
| GET | /v1/search/sessions/{session_id}/items/{item_id} | — | SearchItemDetailResponse |
| PATCH | /v1/search/sessions/{session_id}/items/{item_id} | SearchItemUpdateRequest | SearchItemResponse |
| GET | /v1/search/resumes/{hh_id}/full | — | — |
| GET | /v1/quota/me | — | UserQuotaResponse |
| GET | /v1/quota/team/{team_id} | — | TeamQuotaResponse |
| GET | /v1/quota/teams | — | — |
| GET | /v1/quota/history | — | QuotaHistoryResponse |
| GET | /v1/quota/remaining/{team_id} | — | RemainingQuotaResponse |
| GET | /v1/quota/limits | — | — |
| GET | /v1/quota/limits/{team_id} | — | QuotaLimitsResponse |
| PUT | /v1/quota/limits/{team_id} | QuotaLimitsCreateUpdate | QuotaLimitsResponse |
| DELETE | /v1/quota/limits/{team_id} | — | — |

Примечание: в путях OpenAPI используется `team_id`, `session_id`, `user_id`, `role_id`, `item_id`; фронтенд подставляет значения (например, `teamId` → `team_id` в URL).

## 2. Параметры поиска резюме HH (openapi hh.yml — GET /resumes)

Эндпоинт HH: `GET /resumes` (operationId: search-for-resumes). Бэкенд получает фильтры в теле/объекте и сам формирует запрос к HH. Ниже — параметры из OpenAPI HH, которые соответствуют полям `AdvancedSearchFiltersDTO` и форме HHSearch.

| Параметр HH (query) | Тип | Описание / соответствие DTO |
|--------------------|-----|-----------------------------|
| text | string | Поисковая фраза; на фронте — textQueries[].text |
| text.logic | string | all / any / phrase → textQueries[].logic |
| text.field | string | everywhere, title, education, keywords, experience, … → textQueries[].field |
| text.period | string | all_time, last_year, … → textQueries[].period |
| text.company_size | string | any, small, medium, large → textCompanySize |
| text.industry | string (deprecated) | → textIndustry |
| age_from, age_to | string (number) | → ageFrom, ageTo |
| area | string (можно несколько) | → areas (number[]) |
| relocation | string | → relocation |
| period | number | Дни публикации → period |
| date_from, date_to | string (ISO) | → dateFrom, dateTo |
| education_level (deprecated), education_levels | string | → educationLevels |
| employment | string | → employment |
| experience | string | → experience |
| skill | string (id навыков) | → skills (number[]) |
| gender | string | → gender |
| label | string | → labels |
| language | string (id.level) | → languages (LanguageDTO[]) |
| metro | string | → metro (number[]) |
| currency | string | → currency |
| salary_from, salary_to | number | → salaryFrom, salaryTo |
| schedule | string | → schedule |
| order_by | string | → orderBy |
| citizenship | string | → citizenship (number[]) |
| work_ticket | string | → workTicket (number[]) |
| educational_institution | string | → educationalInstitution (number[]) |
| search_in_responses | boolean | → searchInResponses |
| by_text_prefix | boolean | → byTextPrefix |
| driver_license_types | string | → driverLicenseTypes |
| vacancy_id | string | Похожие по вакансии → vacancyId |
| resume | string | Похожие по резюме → resumeSimilar |
| page | number | → page |
| per_page | number | → perPage |
| professional_role | string | → professionalRole (number[]) |
| folder | string | Папки → folders |
| include_all_folders | boolean | → includeAllFolders |
| job_search_status | string | → jobSearchStatus |
| filter_exp_industry | string | → filterExpIndustry (number[]) |
| filter_exp_period | string | → filterExpPeriod |
| with_job_search_status | boolean | → withJobSearchStatus |
| saved_search_id | string | → savedSearchId |
| search_by_vacancy_id | string | → searchByVacancyId |
| last_used_timestamp, last_used | string | → lastUsedTimestamp, lastUsed (в форме есть, в DTO — опционально) |
| business_trip_readiness | string | → businessTripReadiness |
| district | string | → district |

## 3. Параметры поиска вакансий HH (openapi hh.yml — GET /vacancies)

Эндпоинт HH: `GET /vacancies` (operationId: get-vacancies). Часть параметров совпадает с резюме (area, experience, employment, schedule, currency, period, date_from, date_to, order_by, text, professional_role и т.д.), часть специфична для вакансий (employer_id, salary, label, only_with_salary, кластеры, геокоординаты). Бэкенд по `mode: "vacancies"` маппит `AdvancedSearchFiltersDTO` на параметры HH для вакансий.

## 4. Связанная документация

- [hh-form-fields-audit.md](hh-form-fields-audit.md) — сверка всех полей формы HHSearch с документацией HH.ru
- [hh-dictionaries-audit.md](hh-dictionaries-audit.md) — анализ словарей: HH.ru, бэкенд, фронтенд
- [api-audit-mismatches.md](api-audit-mismatches.md) — несоответствия контрактов OpenAPI и типов TS
