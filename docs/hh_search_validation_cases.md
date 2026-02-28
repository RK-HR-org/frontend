# Тестовые кейсы для Cozy/HH поиска

Этот файл содержит примеры входных промптов и ожидаемый JSON (по ключевым полям) для проверки:
- корректности нового установочного промпта (`cozy-hh-enrich-prompt.txt`);
- согласованности с xlsx-справочниками и плейбуком.

JSON-примеры можно использовать как эталон для ручной/автоматизированной проверки.

> Примечание: во всех примерах опущены поля, которые остаются пустыми (`null`/`[]`), если это несущественно для демонстрации.

---

## Кейс 1. Базовый поиск Python-разработчика

**Вход**

- positive:  
  `Python разработчик с опытом не менее трех лет. Не моложе 25 и не старше пятидесяти лет. Зарплата 50-70 тысяч.`
- negative:  
  `джун`

**Ожидаемый JSON (фрагмент)**

```json
{
  "text_queries": [
    {
      "text": "Python разработчик",
      "logic": "all",
      "field": "experience",
      "period": "all_time"
    }
  ],
  "keywords_include": ["Python", "разработчик"],
  "keywords_exclude": ["джун"],
  "skills": ["Python"],
  "experience": { "hh_experience_id": "between3And6" },
  "age": { "age_from": 25, "age_to": 50 },
  "salary": {
    "salary_from": 50000,
    "salary_to": 70000,
    "currency": "RUR",
    "only_with_salary": null
  }
}
```

---

## Кейс 2. Бухгалтер, возраст и зарплатная вилка + город

**Вход**

- positive:  
  `бухгалтер от 30 лет, зп от 80к до 120к, Москва`
- negative:  
  ``

**Ожидаемый JSON (фрагмент)**

```json
{
  "text_queries": [
    {
      "text": "бухгалтер",
      "logic": "all",
      "field": "experience",
      "period": "all_time"
    }
  ],
  "keywords_include": ["бухгалтер"],
  "experience": { "hh_experience_id": null },
  "age": { "age_from": 30, "age_to": null },
  "salary": {
    "salary_from": 80000,
    "salary_to": 120000,
    "currency": "RUR",
    "only_with_salary": null
  },
  "location": {
    "area_id": null,
    "area_name": "Москва"
  }
}
```

---

## Кейс 3. Менеджер, возраст до 45 и удалёнка

**Вход**

- positive:  
  `менеджер не старше 45, удалёнка`
- negative:  
  `стажёр`

**Ожидаемый JSON (фрагмент)**

```json
{
  "text_queries": [
    {
      "text": "менеджер",
      "logic": "all",
      "field": "experience",
      "period": "all_time"
    }
  ],
  "keywords_include": ["менеджер"],
  "keywords_exclude": ["стажёр"],
  "age": { "age_from": null, "age_to": 45 },
  "schedule": ["remote"]
}
```

---

## Кейс 4. Аналитик, удалёнка и частичная занятость

**Вход**

- positive:  
  `аналитик, удалённо, частичная занятость`
- negative:  
  ``

**Ожидаемый JSON (фрагмент)**

```json
{
  "text_queries": [
    {
      "text": "аналитик",
      "logic": "all",
      "field": "experience",
      "period": "all_time"
    }
  ],
  "keywords_include": ["аналитик"],
  "schedule": ["remote"],
  "employment": ["part"]
}
```

---

## Кейс 5. Менеджер проектов с опытом за последние 3 года в IT

**Вход**

- positive:  
  `менеджер проектов с опытом за последние 3 года в IT`
- negative:  
  ``

**Ожидаемый JSON (фрагмент)**

```json
{
  "text_queries": [
    {
      "text": "менеджер проектов IT",
      "logic": "all",
      "field": "experience_company",
      "period": "last_three_years"
    }
  ],
  "keywords_include": ["менеджер проектов", "IT"],
  "experience": { "hh_experience_id": null }
}
```

---

## Кейс 6. Бухгалтер + город + навыки + опыт не менее 3 лет + исключение по полу

**Вход**

- positive:  
  `Бухгалтер, Нижний Новгород, 1с-бухгалтерия, налоговая отчетность, опыт не менее 3 лет`
- negative:  
  `мужской пол`

**Ожидаемый JSON (фрагмент)**

```json
{
  "text_queries": [
    {
      "text": "Бухгалтер",
      "logic": "all",
      "field": "experience",
      "period": "all_time"
    },
    {
      "text": "1с-бухгалтерия налоговая отчетность",
      "logic": "all",
      "field": "skills",
      "period": "all_time"
    }
  ],
  "keywords_include": ["Бухгалтер", "1с-бухгалтерия", "налоговая отчетность"],
  "experience": { "hh_experience_id": "between3And6" },
  "gender": "female",
  "location": {
    "area_id": null,
    "area_name": "Нижний Новгород"
  }
}
```

---

## Кейс 7. Размытый возраст и зарплата — не заполнять

**Вход**

- positive:  
  `молодой специалист с достойной зарплатой`
- negative:  
  ``

**Ожидаемое поведение**

- `age.age_from = null`, `age.age_to = null` (нет чисел).
- `salary.salary_from = null`, `salary.salary_to = null` (нет конкретных сумм).
- В `text_queries` — только общее описание («молодой специалист»), если нужно.

Пример JSON-фрагмента:

```json
{
  "text_queries": [
    {
      "text": "молодой специалист",
      "logic": "all",
      "field": "everywhere",
      "period": "all_time"
    }
  ],
  "age": { "age_from": null, "age_to": null },
  "salary": {
    "salary_from": null,
    "salary_to": null,
    "currency": "RUR",
    "only_with_salary": null
  }
}
```

---

## Кейс 8. Опыт без длительности — не ставить категорию

**Вход**

- positive:  
  `менеджер по продажам с опытом в продажах в b2b`
- negative:  
  ``

**Ожидаемое поведение**

- В `text_queries` появляется условие по должности/опыту.
- `experience.hh_experience_id = null` (нет информации о годах/уровне).

Пример JSON-фрагмента:

```json
{
  "text_queries": [
    {
      "text": "менеджер по продажам b2b",
      "logic": "all",
      "field": "experience",
      "period": "all_time"
    }
  ],
  "experience": { "hh_experience_id": null }
}
```

---

## Кейс 9. Английский язык с уровнем

**Вход**

- positive:  
  `product manager, английский не ниже B2`
- negative:  
  ``

**Ожидаемый JSON (фрагмент)**

```json
{
  "text_queries": [
    {
      "text": "product manager",
      "logic": "all",
      "field": "experience",
      "period": "all_time"
    }
  ],
  "languages": [
    {
      "id": "eng",
      "level": "b2"
    }
  ]
}
```

---

## Кейс 10. Пол не важен — не заполнять gender

**Вход**

- positive:  
  `офис-менеджер, пол не важен`
- negative:  
  ``

**Ожидаемое поведение**

- `gender = null`.

Пример JSON-фрагмента:

```json
{
  "text_queries": [
    {
      "text": "офис-менеджер",
      "logic": "all",
      "field": "experience",
      "period": "all_time"
    }
  ],
  "gender": null
}
```

---

## Кейс 11. География + удалёнка

**Вход**

- positive:  
  `разработчик, Москва или удалёнка`
- negative:  
  ``

**Ожидаемое поведение**

- `location.area_id` при возможности маппится на Москву через `hh_areas`.
- `schedule` содержит `remote`.

Пример JSON-фрагмента (без конкретного area_id):

```json
{
  "text_queries": [
    {
      "text": "разработчик",
      "logic": "all",
      "field": "experience",
      "period": "all_time"
    }
  ],
  "location": {
    "area_id": null,
    "area_name": "Москва"
  },
  "schedule": ["remote"]
}
```

---

## Кейс 12. Нечёткая география — только area_name

**Вход**

- positive:  
  `маркетолог по Центральному федеральному округу`
- negative:  
  ``

**Ожидаемое поведение**

- Если в `hh_areas` нет однозначной записи для такого текста, `area_id` остаётся `null`.
- Можно использовать `area_name = "Центральный федеральный округ"`.

Пример JSON-фрагмента:

```json
{
  "text_queries": [
    {
      "text": "маркетолог",
      "logic": "all",
      "field": "experience",
      "period": "all_time"
    }
  ],
  "location": {
    "area_id": null,
    "area_name": "Центральный федеральный округ"
  }
}
```

---

Эти кейсы можно использовать:
- для ручного прогонки Cozy-бота в Coze;
- как основу для автотестов, сравнивающих фактический JSON с эталонным.

