# Несоответствия: OpenAPI ↔ типы TS ↔ фактические payload'ы

Результат поштучного сравнения контрактов бэкенда, типов в `src/types/index.ts` и кода формирования запросов (в первую очередь `HHSearch.vue`, composables).

---

## 1. Критичные / влияющие на корректность

### 1.1. Нет критичных расхождений по структуре запросов

Сравнение схем OpenAPI (`SearchCreateRequest`, `SearchApproveRequest`, `SearchExecuteRequest`, `AdvancedSearchFiltersDTO`) с типами в `src/types/index.ts` и с кодом в `HHSearch.vue` (buildFilters, createSessionWithEnrich, confirmApprove, confirmExecute) показывает:

- Имена полей совпадают: `team_id`, `mode`, `searchType`, `queryRaw`, `filters`, `prompts` (SearchCreateRequest); `hh_request` (SearchApproveRequest); `page` (SearchExecuteRequest).
- Фронт отправляет `queryRaw` (camelCase), как в OpenAPI; альтернативное поле `query_raw` в типах не используется при отправке — это только для совместимости с ответами (где бэкенд может возвращать snake_case).
- Все поля `AdvancedSearchFiltersDTO`, которые есть в OpenAPI, заполняются в `buildFilters()` из соответствующих полей формы (при непустых значениях).

---

## 2. Поля формы не попадают в запрос (HH поддерживает, бэкенд может ожидать)

### 2.1. `lastUsedTimestamp` и `lastUsed`

- **Форма:** В `searchForm` есть поля `lastUsedTimestamp` и `lastUsed` (строка).
- **HH API:** В `openapi hh.yml` для GET /resumes описаны параметры `last_used_timestamp` и `last_used` (используются вместе с `saved_search_id` для поиска новых резюме с момента последнего просмотра).
- **Текущее состояние:** В `AdvancedSearchFiltersDTO` (типы и OpenAPI бэкенда) этих полей нет. В `buildFilters()` они не добавляются в объект фильтров, поэтому значения формы никогда не уходят на бэкенд.
- **Рекомендация:** Уточнить у бэкенда, поддерживаются ли параметры `last_used` / `last_used_timestamp` при маппинге на HH. Если да — добавить их в схему бэкенда и в `AdvancedSearchFiltersDTO`, затем в `buildFilters()` передавать `lastUsedTimestamp` и `lastUsed` при наличии `savedSearchId`.

---

## 3. Документация и контракты

### 3.1. Ответ POST /v1/search/sessions

- **OpenAPI:** В извлечённом каталоге у POST /v1/search/sessions не указана схема ответа (responseSchema: "-").
- **Фронт:** Ожидает `SearchSessionResponse | SearchEnrichResponse` (session_id, enriched_filters, diff при обогащении).
- **Рекомендация:** В OpenAPI бэкенда описать ответ POST /v1/search/sessions (например, oneOf/anyOf для SearchSessionResponse и SearchEnrichResponse), чтобы контракт был однозначным.

### 3.2. Пути с path-параметрами

- В OpenAPI используются имена в snake_case: `team_id`, `session_id`, `user_id`, `role_id`, `item_id`.
- Во фронте в URL подставляются переменные в camelCase (`teamId`, `sessionId` и т.д.). Значения совпадают с ожидаемыми бэкендом; расхождение только в стиле имён переменных в коде — не является ошибкой.

---

## 4. Типы и опциональные поля

### 4.1. SearchSessionResponse — query_raw и query_enriched

- В типах TS: `query_raw: Record<string, unknown>` (обязательное), `query_enriched?: Record<string, unknown> | null`.
- Фронт не валидирует наличие `query_raw` в ответе; при отсутствии поля возможны ошибки при обращении к нему. Рекомендация: на бэкенде гарантировать наличие `query_raw` в ответе сессии (хотя бы `{}`).

### 4.2. experience в AdvancedSearchFiltersDTO

- Типы: `experience?: string[] | null` (массив строк, например id из справочника HH).
- HH API принимает несколько значений через повтор параметра `experience`. Бэкенд должен сериализовать массив в нужный формат для HH. Со стороны фронта структура корректна.

---

## 5. Итоговая таблица несоответствий

| № | Эндпоинт / объект | Суть расхождения | Критичность | Действие |
|---|-------------------|------------------|-------------|----------|
| 1 | POST /v1/search/sessions (response) | Схема ответа не описана в OpenAPI | Низкая | Описать в OpenAPI oneOf(SearchSessionResponse, SearchEnrichResponse) |
| 2 | AdvancedSearchFiltersDTO / buildFilters | Поля формы lastUsedTimestamp, lastUsed не передаются | Средняя (если нужна поддержка «новых резюме» по автопоиску) | Добавить в DTO и buildFilters при поддержке бэкенда |
| 3 | SearchSessionResponse | query_raw может отсутствовать в ответе | Низкая | Бэкенд: всегда возвращать query_raw (хотя бы {}) |

Остальные проверенные эндпоинты (approve, execute, quota, team, user, role, static, auth) по структуре запросов и ответов соответствуют типам и использованию во фронте.
