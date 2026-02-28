# Сверка полей формы HHSearch с документацией HH.ru

Документ содержит поштучную сверку всех полей формы поиска ([src/pages/HHSearch.vue](../src/pages/HHSearch.vue)) с параметрами API HH.ru (GET /resumes, GET /vacancies). Источник HH: [src/api/openapi hh.yml](../src/api/openapi%20hh.yml).

## Условные обозначения

- **Статус**: OK — полное соответствие; **Расхождение** — есть отличия; **Нет в HH** — поле не описано в HH API; **Deprecated** — устаревший параметр HH
- **HH справочник** — поле в GET /dictionaries или отдельный эндпоинт, откуда берутся допустимые значения

---

## Таблица сверки полей

| Поле формы | Компонент | HH параметр | HH справочник | Статус | Примечания |
|------------|-----------|-------------|---------------|--------|------------|
| **Промпты** |
| positivePrompt | HHSearchPromptsSection | query (queryRaw) | — | OK | Часть текстового запроса для Cozy |
| negativePrompt | HHSearchPromptsSection | query (queryRaw) | — | OK | Часть текстового запроса для Cozy |
| **Текст** |
| textQueries[].text | HHSearchTextSection | text | — | OK | Поисковая фраза |
| textQueries[].logic | HHSearchTextSection | text.logic | resume_search_logic | Расхождение | HH имеет `except` (Не встречаются), в форме только all, any, phrase |
| textQueries[].field | HHSearchTextSection | text.field | resume_search_fields | Расхождение | В форме есть `keywords`; в HH resume_search_fields поля `keywords` нет (есть: everywhere, title, education, skills, experience, experience_company, experience_position, experience_description) |
| textQueries[].period | HHSearchTextSection | text.period | resume_search_experience_period | OK | all_time, last_year, last_three_years, last_six_years |
| textCompanySize | HHSearchTextSection | text.company_size | — | OK | any, small, medium, large |
| textIndustry | HHSearchTextSection | text.industry | industries | Deprecated | Параметр deprecated в HH; отрасли — /industries |
| byTextPrefix | HHSearchTextSection | by_text_prefix | — | OK | boolean |
| **Возраст / Пол / Метки** |
| ageFrom | HHSearchDemographicsSection | age_from | — | OK | number |
| ageTo | HHSearchDemographicsSection | age_to | — | OK | number |
| gender | HHSearchDemographicsSection | gender | gender | OK | male, female (hhDictionaries) |
| labels | HHSearchDemographicsSection | label | resume_search_label | Расхождение | HH: фиксированные id (only_with_photo, only_with_salary, only_with_age, only_with_gender, only_with_vehicle, exclude_viewed_by_user_id, exclude_viewed_by_employer_id, only_in_responses). В форме — свободный ввод через запятую |
| **География** |
| country | HHSearchGeoSection | — | areas | OK | Верхний уровень дерева регионов, по умолчанию 113 (Россия) |
| areas | HHSearchGeoSection | area | areas, suggest/area-leaves | OK | ID населённых пунктов, автодополнение через suggestAreaLeaves |
| relocation | HHSearchGeoSection | relocation | resume_search_relocation | Расхождение | HH: living_or_relocation, living, living_but_relocation, relocation. В форме — свободный текст |
| metro | HHSearchGeoSection | metro | metro (справочник станций) | Расхождение | HH ожидает ID станций. В форме — TextInputField, ввод ID через запятую без подсказок |
| district | HHSearchGeoSection | district | — | OK | Свободный текст (район) |
| citizenship | HHSearchGeoSection | citizenship | areas | Расхождение | HH ожидает ID стран. В форме — TextInputField без подсказок |
| workTicket | HHSearchGeoSection | work_ticket | areas | Расхождение | HH ожидает ID стран. В форме — TextInputField без подсказок |
| businessTripReadiness | HHSearchGeoSection | business_trip_readiness | business_trip_readiness | Расхождение | HH: ready, sometimes, never. В форме — свободный ввод массива |
| **Даты публикации** |
| period | HHSearchDatesSection | period | — | OK | Дни (number) |
| dateFrom | HHSearchDatesSection | date_from | — | OK | ISO 8601 |
| dateTo | HHSearchDatesSection | date_to | — | OK | ISO 8601 |
| **Образование и опыт** |
| educationLevels | HHSearchEducationExperienceSection | education_level(s) | education_level | OK | hhDictionaries.EDUCATION_LEVEL |
| experience | HHSearchEducationExperienceSection | experience | experience | OK | hhDictionaries.EXPERIENCE |
| educationalInstitution | HHSearchEducationExperienceSection | educational_institution | suggest/educational-institutions | OK | ID вузов, автодополнение |
| filterExpIndustry | HHSearchEducationExperienceSection | filter_exp_industry | industries | OK | ID отраслей |
| filterExpPeriod | HHSearchEducationExperienceSection | filter_exp_period | resume_search_experience_period | OK | all_time, last_year, last_three_years, last_six_years |
| **Условия и навыки** |
| employment | HHSearchConditionsSkillsSection | employment | employment | OK | hhDictionaries.EMPLOYMENT |
| schedule | HHSearchConditionsSkillsSection | schedule | schedule | OK | hhDictionaries.SCHEDULE |
| skills | HHSearchConditionsSkillsSection | skill | suggest/skills, /skills | OK | ID навыков, автодополнение; getSkills 502 |
| languages | HHSearchConditionsSkillsSection | language | /languages, language_level | OK | Формат id.level (ita.c2), API languages |
| driverLicenseTypes | HHSearchConditionsSkillsSection | driver_license_types | driver_license_types | Расхождение | HH: A, B, C, D, E, BE, CE, DE, TM, TB. В форме — свободный ввод (placeholder "A, B, C...") |
| **Зарплата** |
| currency | HHSearchSalarySection | currency | currency | OK | hhDictionaries.CURRENCY_OPTIONS |
| salaryFrom | HHSearchSalarySection | salary_from | — | OK | number |
| salaryTo | HHSearchSalarySection | salary_to | — | OK | number |
| **Роль и статусы** |
| professionalRole | HHSearchRoleStatusSection | professional_role | /professional_roles | OK | API getProfessionalRoles |
| jobSearchStatus | HHSearchRoleStatusSection | job_search_status | job_search_statuses_employer | OK | hhDictionaries.JOB_SEARCH_STATUSES_APPLICANT (для работодателя — employer) |
| withJobSearchStatus | HHSearchRoleStatusSection | with_job_search_status | — | OK | boolean |
| **Похожие / отклики** |
| vacancyId | HHSearchSimilarSection | vacancy_id | — | OK | ID вакансии для похожих резюме |
| resumeSimilar | HHSearchSimilarSection | resume | — | OK | ID резюме для похожих |
| searchInResponses | HHSearchSimilarSection | search_in_responses | — | OK | boolean |
| searchByVacancyId | HHSearchSimilarSection | search_by_vacancy_id | — | OK | Поиск в откликах по вакансии |
| **Папки / автопоиски** |
| folders | HHSearchFoldersSection | folder | — | OK | ID папок |
| includeAllFolders | HHSearchFoldersSection | include_all_folders | — | OK | boolean |
| savedSearchId | HHSearchFoldersSection | saved_search_id | — | OK | ID сохранённого поиска |
| lastUsedTimestamp | HHSearchFoldersSection | last_used_timestamp | — | Расхождение | В форме есть, в AdvancedSearchFiltersDTO не передаётся (см. api-audit-mismatches) |
| lastUsed | HHSearchFoldersSection | last_used | — | Расхождение | В форме есть, в AdvancedSearchFiltersDTO не передаётся |
| **Сортировка / пагинация** |
| orderBy | HHSearchSortingSection | order_by | resume_search_order, vacancy_search_order | OK | hhDictionaries.RESUME_SEARCH_ORDER / VACANCY_SEARCH_ORDER |
| page | HHSearchSortingSection | page | — | OK | number |
| perPage | HHSearchSortingSection | per_page | — | OK | number |

---

## Сводка расхождений

| Поле | Суть расхождения |
|------|------------------|
| textQueries[].logic | Отсутствует опция `except` |
| textQueries[].field | Лишнее значение `keywords` (нет в HH resume_search_fields) |
| labels | Свободный ввод вместо выбора из resume_search_label |
| relocation | Свободный текст вместо resume_search_relocation |
| metro, citizenship, workTicket | Нет подсказок/валидации по ID |
| businessTripReadiness | Свободный ввод вместо ready/sometimes/never |
| driverLicenseTypes | Свободный ввод вместо выбора из справочника |
| lastUsedTimestamp, lastUsed | Не передаются в buildFilters (см. [api-audit-mismatches](api-audit-mismatches.md)) |

---

## Рекомендации

1. **relocation, businessTripReadiness, driverLicenseTypes, labels** — заменить свободный ввод на выпадающие списки (MultiSelect/Dropdown) со значениями из HH.
2. **textQueries[].logic** — добавить опцию `except`, если нужна фильтрация «не встречаются».
3. **textQueries[].field** — убрать `keywords` или проверить актуальность HH API.
4. **metro, citizenship, workTicket** — рассмотреть suggest/автодополнение по ID регионов.
5. **lastUsedTimestamp, lastUsed** — добавить в DTO и buildFilters при поддержке бэкендом.

---

## Связанные документы

- [api-catalog.md](api-catalog.md) — каталог API, маппинг параметров HH
- [api-audit-mismatches.md](api-audit-mismatches.md) — несоответствия контрактов
- [hh-dictionaries-audit.md](hh-dictionaries-audit.md) — анализ словарей
