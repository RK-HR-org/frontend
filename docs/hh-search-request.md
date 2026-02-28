## Формат запроса поиска HH (`/v1/search/sessions`)

Этот файл описывает, какое тело запроса формирует фронтенд (страница `src/pages/HHSearch.vue` через `createSessionWithEnrich`) при обращении к эндпоинту `/v1/search/sessions` и как это соотносится с документацией:

- `src/api/openapi.json` (бэкенд‑контракт);
- `src/api/openapi hh.yml` (официальный OpenAPI HeadHunter);
- примером корректного запроса из файла `hh-search-params (14).json`.

### Верхний уровень `SearchCreateRequest`

Фронтенд отправляет объект типа `SearchCreateRequest` (см. `src/types/index.ts`):

```json
{
  "team_id": "UUID команды",
  "mode": "resumes | vacancies",
  "searchType": "simple | advanced",
  "queryRaw": { "query": "строка запроса" },
  "filters": { /* AdvancedSearchFiltersDTO */ },
  "prompts": {
    "positive": "строка или null",
    "negative": "строка или null"
  }
}
```

- **`team_id`** — выбирается из селекта «Команда».
- **`mode`** — радио‑переключатель «Резюме / Вакансии` (значения `"resumes"` или `"vacancies"`).
- **`searchType`**:
  - `"advanced"`, если объект `filters` содержит хотя бы одно непустое поле;
  - `"simple"`, если фильтры пустые.
- **`queryRaw`** — объект, который сейчас содержит одно поле `query`:
  - собирается как конкатенация `positivePrompt` и `negativePrompt` через перевод строки;
  - если оба промпта пустые, отправляется `{ "query": "" }`.
- **`prompts`** — тот же смысл, что в примере `hh-search-params (14).json`:
  - `positivePrompt` → `prompts.positive`;
  - `negativePrompt` → `prompts.negative`.

> Для потребителя API (бэкенда) основным источником фильтров для запроса в HH является поле `filters` и/или `hh_request` при `approve`. Поле `queryRaw` используется дополнительно и не ломает совместимость с примером.

### Объект `filters` (`AdvancedSearchFiltersDTO`)

Тип описан в `AdvancedSearchFiltersDTO` (см. `src/types/index.ts`) и полностью следует OpenAPI бэкенда. Фактическое наполнение формируется функцией `buildFilters()` в `src/pages/HHSearch.vue`:

- текстовые условия (`textQueries`) заполняются из массива `searchForm.textQueries`:
  - каждое условие даёт элемент `TextQueryDTO`:
    - `text` — обрезанная строка;
    - `logic` — `"all" | "any" | "phrase"`;
    - `field` — одно из: `"everywhere" | "title" | "education" | "keywords" | "experience" | "experience_company" | "experience_position" | "experience_description" | "skills"`;
    - `period` — `"all_time" | "last_year" | "last_three_years" | "last_six_years"`.
- числовые ID (`areas`, `metro`, `citizenship`, `workTicket`, `educationalInstitution`, `filterExpIndustry`, `professionalRole`):
  - берутся из соответствующих полей формы;
  - преобразуются в `number[]` с помощью `toIntArray` / `toIntArrayOnlyNumericIds`, чтобы совпасть с контрактом OpenAPI и справочниками HH (`openapi hh.yml`).
- строковые/булевые поля (`gender`, `relocation`, `district`, `filterExpPeriod`, `employment`, `schedule`, `businessTripReadiness`, `driverLicenseTypes`, `jobSearchStatus`, `withJobSearchStatus`, `searchInResponses`, `includeAllFolders` и др.):
  - передаются как есть (или не попадают в объект, если пустые);
  - значения соответствуют словарям HH (`src/constants/hhDictionaries.ts` и `openapi hh.yml`).
- дата/период (`period`, `dateFrom`, `dateTo`) и возраст (`ageFrom`, `ageTo`) передаются в том же виде, что и в примерe.
- зарплата (`salaryFrom`, `salaryTo`, `currency`) полностью совпадает по формату с примером `hh-search-params (14).json`.
- пагинация и сортировка:
  - `page` и `perPage` передаются из формы;
  - `perPage` по умолчанию `20`, что соответствует примеру.

Таким образом, при выборе режима **`mode = "resumes"`** и заполнении формы аналогично примеру, фронтенд формирует объект `filters`, который по структуре и значениям соответствует блоку `filters` из `hh-search-params (14).json`.

### Пример фактического запроса (резюме)

При заполнении формы как в `hh-search-params (14).json` (режим `resumes`, расширенный поиск) фронтенд отправляет запрос вида:

```json
{
  "team_id": "8c461666-9629-45b5-aa23-52927dfc4931",
  "mode": "resumes",
  "searchType": "advanced",
  "queryRaw": {
    "query": "главный бухгалтер, ведущий бухгалтер, главбух, бухгалтерский учет, налоговый учет, 1С:Бухгалтерия 8.3, МСФО, трансформация отчетности, налоговые проверки\nзаместитель, помощник, бухгалтер на первичке, стажёр, специалист с опытом менее 6 лет, без опыта прохождения налоговых проверок"
  },
  "prompts": {
    "positive": "главный бухгалтер, ведущий бухгалтер, главбух, бухгалтерский учет, налоговый учет, 1С:Бухгалтерия 8.3, МСФО, трансформация отчетности, налоговые проверки",
    "negative": "заместитель, помощник, бухгалтер на первичке, стажёр, специалист с опытом менее 6 лет, без опыта прохождения налоговых проверок"
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
        "text": "ведущий бухгалтер",
        "logic": "any",
        "field": "experience_position",
        "period": "all_time"
      },
      {
        "text": "главбух",
        "logic": "all",
        "field": "experience_position",
        "period": "last_three_years"
      },
      {
        "text": "бухгалтерский учет налоговый учет",
        "logic": "all",
        "field": "skills",
        "period": "all_time"
      },
      {
        "text": "1С:Бухгалтерия 8.3",
        "logic": "phrase",
        "field": "skills",
        "period": "all_time"
      },
      {
        "text": "МСФО трансформация отчетности",
        "logic": "all",
        "field": "skills",
        "period": "all_time"
      },
      {
        "text": "налоговые проверки",
        "logic": "all",
        "field": "experience_description",
        "period": "all_time"
      },
      {
        "text": "главный бухгалтер ведущий бухгалтер главбух налоговые проверки",
        "logic": "any",
        "field": "title",
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

Поле `filters` **идентично** примеру, а добавленные поля `queryRaw` и `mode`/`searchType` соответствуют описанию в `openapi.json`.

### Пример для режима вакансий

Для режима `mode = "vacancies"` используется тот же формат `SearchCreateRequest` и `AdvancedSearchFiltersDTO`. Различия только в семантике значений:

- часть полей фильтров может быть неиспользуема HH для вакансий (это определяется на стороне бэкенда по `mode`);
- словари (`employment`, `schedule`, `professionalRole` и др.) остаются теми же, что и в `openapi hh.yml`.

Таким образом, фронтенд формирует один и тот же контракт запроса для обоих режимов, а выбор конкретного HH‑эндпоинта и маппинг на схему из `openapi hh.yml` выполняет бэкенд.

