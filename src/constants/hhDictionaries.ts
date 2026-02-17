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
