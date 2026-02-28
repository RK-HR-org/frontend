# Примеры запросов и ответов API

Примеры соответствуют контрактам из `openapi.json` и типам в `src/types/index.ts`. Базовый URL бэкенда задаётся в `src/api/api.ts` (переменная `API_URL`).

---

## 1. Авторизация

### POST /v1/auth/login

**Request:**
```http
POST /v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret"
}
```

**Response (200):**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### GET /v1/auth/me

**Request:** заголовок `Authorization: Bearer <access_token>`.

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "Иван",
  "last_name": "Иванов",
  "role": { "id": "role-uuid", "name": "admin" },
  "status": "active",
  "teams": [{ "id": "team-uuid", "name": "Команда 1", "is_manager": true }],
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## 2. HH-поиск (сессии)

### POST /v1/search/sessions (создание сессии с обогащением)

**Request:**
```http
POST /v1/search/sessions
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "team_id": "8c461666-9629-45b5-aa23-52927dfc4931",
  "mode": "resumes",
  "searchType": "advanced",
  "queryRaw": {
    "query": "главный бухгалтер, 1С\nпомощник, стажёр"
  },
  "prompts": {
    "positive": "главный бухгалтер, 1С",
    "negative": "помощник, стажёр"
  },
  "filters": {
    "textQueries": [
      {
        "text": "главный бухгалтер",
        "logic": "any",
        "field": "experience_position",
        "period": "all_time"
      },
      {
        "text": "1С",
        "logic": "phrase",
        "field": "skills",
        "period": "all_time"
      }
    ],
    "ageFrom": 30,
    "ageTo": 45,
    "areas": [1],
    "experience": ["moreThan6"],
    "employment": ["full"],
    "schedule": ["fullDay"],
    "salaryFrom": 180000,
    "salaryTo": 250000,
    "currency": "RUR",
    "perPage": 20
  }
}
```

**Response (200) — с обогащением (SearchEnrichResponse):**
```json
{
  "session_id": "session-uuid-123",
  "enriched_filters": {
    "keywords_include": ["главный бухгалтер", "1С"],
    "keywords_exclude": ["помощник", "стажёр"],
    "text_queries": [
      { "text": "главный бухгалтер", "logic": "any", "field": "experience_position", "period": "all_time" },
      { "text": "1С", "logic": "phrase", "field": "skills", "period": "all_time" }
    ],
    "skills": ["1С"],
    "experience": { "hh_experience_id": "moreThan6" },
    "age": { "age_from": 30, "age_to": 45 },
    "location": { "area_id": 1 },
    "schedule": ["fullDay"],
    "employment": ["full"],
    "salary": { "salary_from": 180000, "salary_to": 250000, "currency": "RUR" }
  },
  "diff": {
    "added": [],
    "changed": [],
    "warnings": []
  }
}
```

**Response (200) — без обогащения (SearchSessionResponse):** объект сессии с полями `id`, `team_id`, `mode`, `query_raw`, `hh_request`, `status`, `created_at`, `updated_at` и т.д.

---

### POST /v1/search/sessions/{session_id}/approve

**Request:**
```http
POST /v1/search/sessions/session-uuid-123/approve
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "hh_request": {
    "textQueries": [
      { "text": "главный бухгалтер", "logic": "any", "field": "experience_position", "period": "all_time" },
      { "text": "1С", "logic": "phrase", "field": "skills", "period": "all_time" }
    ],
    "ageFrom": 30,
    "ageTo": 45,
    "areas": [1],
    "experience": ["moreThan6"],
    "employment": ["full"],
    "schedule": ["fullDay"],
    "salaryFrom": 180000,
    "salaryTo": 250000,
    "currency": "RUR",
    "perPage": 20
  }
}
```

**Response (200):** объект сессии (SearchSessionResponse) с обновлённым статусом и полем `hh_request`.

---

### POST /v1/search/sessions/{session_id}/execute

**Request:**
```http
POST /v1/search/sessions/session-uuid-123/execute
Content-Type: application/json
Authorization: Bearer <access_token>

{
  "page": 0
}
```

**Response (200):**
```json
{
  "session": {
    "id": "session-uuid-123",
    "team_id": "8c461666-9629-45b5-aa23-52927dfc4931",
    "mode": "resumes",
    "query_raw": { "query": "..." },
    "hh_request": { ... },
    "status": "executed",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:01:00Z"
  },
  "result": {
    "id": "result-uuid",
    "session_id": "session-uuid-123",
    "hh_response_json": { ... },
    "items_count": 20,
    "hh_found": 150,
    "fetched_at": "2024-01-01T12:01:00Z"
  },
  "items": [
    {
      "id": "resume-hh-id-1",
      "title": "Главный бухгалтер",
      "age": 35,
      "area": { "name": "Москва" },
      "salary": { "from": 200000, "to": 250000, "currency": "RUR" },
      "alternate_url": "https://hh.ru/resume/..."
    }
  ],
  "found": 150,
  "pages": 8,
  "per_page": 20,
  "page": 0
}
```

---

## 3. Квота

### GET /v1/quota/remaining/{team_id}

**Request:** `Authorization: Bearer <access_token>`.

**Response (200):**
```json
{
  "team_id": "8c461666-9629-45b5-aa23-52927dfc4931",
  "has_limits": true,
  "hour": {
    "used": 5,
    "limit": 100,
    "remaining": 95
  },
  "day": {
    "used": 20,
    "limit": 500,
    "remaining": 480
  },
  "can_make_request": true
}
```

---

## 4. Справочники и подсказки

### GET /v1/static/areas

**Response (200):** массив объектов вида `{ "id": "1", "name": "Москва" }` (или с полями, согласованными с бэкендом).

### GET /v1/static/suggest/areas?text=мос

**Response (200):** массив подсказок по региону (структура по контракту бэкенда, например `{ "items": [...] }` или массив напрямую).

---

## 5. Команды

### GET /v1/team

**Response (200):** массив команд или объект с полем `items`/`data`:
```json
[
  {
    "id": "8c461666-9629-45b5-aa23-52927dfc4931",
    "name": "Команда 1",
    "description": "Описание",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

Все примеры запросов выше соответствуют тому, что формирует фронтенд в `HHSearch.vue` и composables (useSearchSessions, useQuota, useTeams и т.д.).
