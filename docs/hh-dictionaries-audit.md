# Аудит словарей: HH.ru, бэкенд, фронтенд

Документ описывает, какие словари предоставляет HH.ru API, какие проксирует бэкенд, какие используются на фронте, и выявляет пробелы. Источники: [src/api/openapi hh.yml](../src/api/openapi%20hh.yml), [src/composables/useStatics.ts](../src/composables/useStatics.ts), [src/constants/hhDictionaries.ts](../src/constants/hhDictionaries.ts).

---

## A. Словари HH.ru (GET /dictionaries)

HH.ru предоставляет единый эндпоинт `GET /dictionaries`, возвращающий объект `DictionariesDictResponse` со всеми справочниками. Ниже — поля, релевантные для формы поиска HHSearch.

| Поле в /dictionaries | Описание | Используется в форме | Источник на фронте |
|----------------------|----------|----------------------|--------------------|
| resume_search_logic | Условие поиска (all, any, phrase, except) | textQueries[].logic | HHSearchTextSection (локально) |
| resume_search_fields | Область поиска (everywhere, title, education, skills, …) | textQueries[].field | HHSearchTextSection (локально) |
| resume_search_experience_period | Период опыта (all_time, last_year, …) | textQueries[].period, filterExpPeriod | HHSearchTextSection (локально) |
| resume_search_label | Метки (only_with_photo, only_with_salary, …) | labels | Нет — свободный ввод |
| resume_search_order | Сортировка резюме | orderBy (resumes) | hhDictionaries.RESUME_SEARCH_ORDER |
| resume_search_relocation | Готовность к переезду (living_or_relocation, living, …) | relocation | Нет — свободный ввод |
| education_level | Уровень образования | educationLevels | hhDictionaries.EDUCATION_LEVEL |
| experience | Опыт работы | experience | hhDictionaries.EXPERIENCE |
| employment | Тип занятости | employment | hhDictionaries.EMPLOYMENT |
| schedule | График работы | schedule | hhDictionaries.SCHEDULE |
| gender | Пол | gender | hhDictionaries.GENDER |
| job_search_statuses_applicant | Статусы для соискателя | — | — |
| job_search_statuses_employer | Статусы для работодателя | jobSearchStatus | hhDictionaries.JOB_SEARCH_STATUSES_APPLICANT |
| currency | Валюты | currency | hhDictionaries.CURRENCY_OPTIONS |
| driver_license_types | Категории прав (A, B, C, …) | driverLicenseTypes | Нет — свободный ввод |
| business_trip_readiness | Готовность к командировкам | businessTripReadiness | Нет — свободный ввод |
| language_level | Уровень владения языком (a1, b2, c2, …) | languages (часть id.level) | — |
| vacancy_search_order | Сортировка вакансий | orderBy (vacancies) | hhDictionaries.VACANCY_SEARCH_ORDER |

**Примечание:** Бэкенд не предоставляет прокси для `GET /dictionaries`. Все перечисленные справочники либо захардкожены в `hhDictionaries.ts`, либо заданы локально в компонентах.

---

## B. Словари бэкенда (GET /v1/static/*)

Бэкенд проксирует отдельные эндпоинты HH. Соответствие и использование:

| Эндпоинт бэкенда | Проксирует HH | Используется на фронте | Примечания |
|------------------|---------------|------------------------|------------|
| GET /v1/static | — | Нет (getStaticDictionaries) | Агрегированный ответ |
| GET /v1/static/areas | GET /areas | Да | Страны (countriesOptions), города через suggest |
| GET /v1/static/professional-roles | GET /professional_roles | Да | professionalRolesOptions |
| GET /v1/static/industries | GET /industries | Загружается, не в форме | industriesOptions загружается, textIndustry не привязан к dropdown |
| GET /v1/static/languages | GET /languages | Да | languagesOptions |
| GET /v1/static/skills | GET /skills (bulk, id=...) | Нет | 502; навыки только через suggest |
| GET /v1/static/employers | GET /employers (поиск) | Нет | — |
| GET /v1/static/user-statuses | — | Нет | Внутренний справочник |
| GET /v1/static/session-statuses | — | Нет | Внутренний справочник |
| GET /v1/static/search-modes | — | Нет | Внутренний справочник |

---

## C. Suggest-эндпоинты

| Эндпоинт бэкенда | Проксирует HH | Используется |
|------------------|---------------|--------------|
| GET /v1/static/suggest/area-leaves | suggest/area-leaves | Да | Города при вводе (HHSearchGeoSection) |
| GET /v1/static/suggest/skills | suggest/skills | Да | Навыки при вводе (HHSearchConditionsSkillsSection) |
| GET /v1/static/suggest/educational-institutions | suggest/educational-institutions | Да | Учебные заведения (HHSearchEducationExperienceSection) |
| GET /v1/static/suggest/areas | suggest/areas | Нет | — |
| GET /v1/static/suggest/positions | suggest/positions | Нет | — |
| GET /v1/static/suggest/resume-search-keyword | suggest/resume-search-keyword | Нет | — |
| GET /v1/static/suggest/vacancy-search-keyword | suggest/vacancy-search-keyword | Нет | — |
| GET /v1/static/suggest/vacancy-positions | suggest/vacancy-positions | Нет | — |
| GET /v1/static/suggest/fields-of-study | suggest/fields-of-study | Нет | — |
| GET /v1/static/suggest/companies | suggest/companies | Нет | — |

---

## D. Hardcoded vs API

Справочники из `hhDictionaries.ts` используются вместо загрузки из API:

| Константа | Значения | Риск |
|-----------|----------|------|
| EDUCATION_LEVEL | secondary, special_secondary, … | При изменении HH — устаревание |
| EXPERIENCE | noExperience, between1And3, … | То же |
| EMPLOYMENT | full, part, project, … | То же |
| SCHEDULE | fullDay, shift, flexible, … | То же |
| GENDER | male, female | То же |
| CURRENCY_OPTIONS | RUR, USD, EUR, … | То же |
| JOB_SEARCH_STATUSES_APPLICANT | active_search, looking_for_offers, … | То же |
| RESUME_SEARCH_ORDER | publication_time, salary_desc, … | То же |
| VACANCY_SEARCH_ORDER | + distance | То же |

**Рекомендация:** Рассмотреть загрузку этих справочников из `GET /v1/static` (если бэкенд начнёт проксировать `GET /dictionaries`) или отдельного эндпоинта со словарями поиска.

---

## E. Диаграмма потока данных словарей

```mermaid
flowchart TB
    subgraph HH [HH.ru API]
        HH_dict[GET /dictionaries]
        HH_areas[GET /areas]
        HH_prof_roles[GET /professional_roles]
        HH_lang[GET /languages]
        HH_skills[GET /skills id=...]
        HH_suggest_skills[GET suggest/skills]
        HH_suggest_area[GET suggest/area-leaves]
        HH_suggest_edu[GET suggest/educational-institutions]
    end

    subgraph Backend [Бэкенд]
        BE_static[/v1/static]
        BE_areas[/v1/static/areas]
        BE_prof[/v1/static/professional-roles]
        BE_lang[/v1/static/languages]
        BE_skills[/v1/static/skills]
        BE_suggest_skills[/v1/static/suggest/skills]
        BE_suggest_area[/v1/static/suggest/area-leaves]
        BE_suggest_edu[/v1/static/suggest/educational-institutions]
    end

    subgraph Frontend [Фронтенд]
        hhDict[hhDictionaries.ts]
        useStatics[useStatics]
        HHSearch[HHSearch.vue]
    end

    HH_dict --> hhDict
    HH_areas --> BE_areas
    HH_prof_roles --> BE_prof
    HH_lang --> BE_lang
    HH_skills -.->|502| BE_skills
    HH_suggest_skills --> BE_suggest_skills
    HH_suggest_area --> BE_suggest_area
    HH_suggest_edu --> BE_suggest_edu

    BE_areas --> useStatics
    BE_prof --> useStatics
    BE_lang --> useStatics
    BE_suggest_skills --> useStatics
    BE_suggest_area --> useStatics
    BE_suggest_edu --> useStatics

    useStatics --> HHSearch
    hhDict --> HHSearch
```

---

## F. Рекомендации

1. **relocation, businessTripReadiness, driverLicenseTypes, labels** — заменить свободный ввод на выпадающие списки со значениями из HH (через новый эндпоинт или расширение /v1/static).
2. **getSkills 502** — уточнить у бэкенда причину; навыки пока только через suggest.
3. **getIndustries** — привязать textIndustry к выпадающему списку industriesOptions или убрать загрузку.
4. **Словари из /dictionaries** — рассмотреть проксирование GET /dictionaries на бэкенде и загрузку education_level, experience, employment, schedule, gender, currency, job_search_statuses, resume_search_order вместо hardcoded.
5. **Неиспользуемые suggest** — resume-search-keyword, vacancy-search-keyword, vacancy-positions, fields-of-study, companies можно использовать для улучшения UX (автодополнение ключевых слов, направлений обучения и т.д.).

---

## Связанные документы

- [hh-form-fields-audit.md](hh-form-fields-audit.md) — сверка полей формы с HH.ru
- [api-catalog.md](api-catalog.md) — каталог API
- [api-audit-mismatches.md](api-audit-mismatches.md) — несоответствия контрактов
