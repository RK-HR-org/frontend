/**
 * Справочники HH API (id + название) для полей формы поиска.
 * Источник: openapi hh.yml, пример ответа /dictionaries.
 */

export type Option = { value: string; label: string };

export const EDUCATION_LEVEL: Option[] = [
  { value: "secondary", label: "Среднее" },
  { value: "special_secondary", label: "Среднее специальное" },
  { value: "unfinished_higher", label: "Неоконченное высшее" },
  { value: "higher", label: "Высшее" },
  { value: "bachelor", label: "Бакалавр" },
  { value: "master", label: "Магистр" },
  { value: "candidate", label: "Кандидат наук" },
  { value: "doctor", label: "Доктор наук" },
];

export const EXPERIENCE: Option[] = [
  { value: "noExperience", label: "Нет опыта" },
  { value: "between1And3", label: "От 1 года до 3 лет" },
  { value: "between3And6", label: "От 3 до 6 лет" },
  { value: "moreThan6", label: "Более 6 лет" },
];

export const EMPLOYMENT: Option[] = [
  { value: "full", label: "Полная занятость" },
  { value: "part", label: "Частичная занятость" },
  { value: "project", label: "Проектная работа" },
  { value: "volunteer", label: "Волонтерство" },
  { value: "probation", label: "Стажировка" },
];

export const SCHEDULE: Option[] = [
  { value: "fullDay", label: "Полный день" },
  { value: "shift", label: "Сменный график" },
  { value: "flexible", label: "Гибкий график" },
  { value: "remote", label: "Удаленная работа" },
  { value: "flyInFlyOut", label: "Вахтовый метод" },
];

export const GENDER: Option[] = [
  { value: "male", label: "Мужской" },
  { value: "female", label: "Женский" },
];

export const RESUME_SEARCH_ORDER: Option[] = [
  { value: "publication_time", label: "По дате изменения" },
  { value: "salary_desc", label: "По убыванию зарплат" },
  { value: "salary_asc", label: "По возрастанию зарплаты" },
  { value: "relevance", label: "По соответствию" },
];

export const VACANCY_SEARCH_ORDER: Option[] = [
  { value: "publication_time", label: "По дате" },
  { value: "salary_desc", label: "По убыванию дохода" },
  { value: "salary_asc", label: "По возрастанию дохода" },
  { value: "relevance", label: "По соответствию" },
  { value: "distance", label: "По удалённости" },
];

export const JOB_SEARCH_STATUSES_APPLICANT: Option[] = [
  { value: "active_search", label: "Активно ищу работу" },
  { value: "looking_for_offers", label: "Рассматриваю входящие предложения" },
  { value: "not_looking_for_job", label: "Не ищу работу" },
  { value: "has_job_offer", label: "Предложили работу, пока думаю" },
  { value: "accepted_job_offer", label: "Уже выхожу на новое место" },
];

export const CURRENCY_OPTIONS: Option[] = [
  { value: "RUR", label: "Рубли" },
  { value: "USD", label: "Доллары" },
  { value: "EUR", label: "Евро" },
  { value: "KZT", label: "Тенге" },
  { value: "UAH", label: "Гривны" },
  { value: "AZN", label: "Манаты" },
  { value: "BYR", label: "Белорусские рубли" },
  { value: "GEL", label: "Грузинский лари" },
  { value: "KGS", label: "Киргизский сом" },
  { value: "UZS", label: "Узбекский сум" },
];

/** Метки поиска резюме (resume_search_label). */
export const RESUME_SEARCH_LABEL: Option[] = [
  { value: "only_with_photo", label: "Только с фотографией" },
  { value: "only_with_salary", label: "Не показывать резюме без зарплаты" },
  {
    value: "only_with_age",
    label: "Не показывать резюме без указания возраста",
  },
  {
    value: "only_with_gender",
    label: "Не показывать резюме без указания пола",
  },
  { value: "only_with_vehicle", label: "Есть личный автомобиль" },
  {
    value: "exclude_viewed_by_user_id",
    label: "Скрыть резюме, просмотренные мной",
  },
  {
    value: "exclude_viewed_by_employer_id",
    label: "Скрыть резюме, просмотренные всей компанией",
  },
  {
    value: "only_in_responses",
    label: "Показать только из откликов и приглашений",
  },
];

/** Готовность к переезду (resume_search_relocation). */
export const RESUME_SEARCH_RELOCATION: Option[] = [
  {
    value: "living_or_relocation",
    label: "Живут в указанном регионе или готовы переехать в него",
  },
  { value: "living", label: "Живут в указанном регионе" },
  {
    value: "living_but_relocation",
    label: "Живут в указанном регионе и готовы к переезду куда-либо",
  },
  {
    value: "relocation",
    label: "Не живут в указанном регионе, но готовы переехать в него",
  },
];

/** Готовность к командировкам (business_trip_readiness). */
export const BUSINESS_TRIP_READINESS: Option[] = [
  { value: "ready", label: "Готов к командировкам" },
  { value: "sometimes", label: "Готов к редким командировкам" },
  { value: "never", label: "Не готов к командировкам" },
];

/** Категории водительских прав (driver_license_types). */
export const DRIVER_LICENSE_TYPES: Option[] = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "E", label: "E" },
  { value: "BE", label: "BE" },
  { value: "CE", label: "CE" },
  { value: "DE", label: "DE" },
  { value: "TM", label: "TM" },
  { value: "TB", label: "TB" },
];
