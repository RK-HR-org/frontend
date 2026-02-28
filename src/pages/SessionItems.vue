<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSearchSessions } from "../composables/useSearchSessions";
import type { SearchItemResponse, SearchItemDetailResponse } from "../types";
import ShowIcon from "../components/ui/icons/ShowIcon.vue";
import HiddenIcon from "../components/ui/icons/HiddenIcon.vue";
import CheckboxField from "../components/ui/fields/boolean/CheckboxField.vue";
import SessionItemDetailModal from "../components/session/SessionItemDetailModal.vue";
import * as XLSX from "xlsx";

const route = useRoute();
const router = useRouter();
const sessionId = computed(() => route.params.sessionId as string);

const {
  getSessionItems,
  getSessionItem,
  updateSessionItem,
  loading,
  error,
} = useSearchSessions();

const items = ref<SearchItemResponse[]>([]);
const total = ref(0);
const limit = ref(300);
const offset = ref(0);
const includeHidden = ref(false);
const bulkFavoriteLoading = ref(false);
const detailOpen = ref(false);
const detailItem = ref<SearchItemDetailResponse | null>(null);
const exportingFavorites = ref(false);

/** Состояние сортировки. */
type SortColumn = "age" | "total_experience" | "salary" | null;
const sortBy = ref<SortColumn>(null);
const sortDir = ref<"asc" | "desc">("asc");

/** Видимость опциональных колонок (чекбоксы). Только поля brief-резюме HH API. */
const visibleOptionalColumns = ref<Record<string, boolean>>({
  area: false,
  age: false,
  total_experience: false,
  education: false,
  full_name: false,
  gender: false,
  alternate_url: false,
});

/** Конфиг опциональных колонок: ключ → заголовок. Только поля brief (ResumesSearchForResumes). */
const OPTIONAL_COLUMNS: { key: string; label: string }[] = [
  { key: "area", label: "Регион" },
  { key: "age", label: "Возраст" },
  { key: "total_experience", label: "Общий опыт" },
  { key: "education", label: "Образование" },
  { key: "full_name", label: "ФИО" },
  { key: "gender", label: "Пол" },
  { key: "alternate_url", label: "Ссылка" },
];

const activeOptionalColumns = computed(() =>
  OPTIONAL_COLUMNS.filter((c) => visibleOptionalColumns.value[c.key])
);

/** Отсортированный список элементов (клиентская сортировка). */
const sortedItems = computed(() => {
  const list = [...items.value];
  const col = sortBy.value;
  if (!col) return list;
  return list.sort((a, b) => {
    const va = getSortValue(a, col);
    const vb = getSortValue(b, col);
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    const cmp = va - vb;
    return sortDir.value === "asc" ? cmp : -cmp;
  });
});

/** Элементы, видимые в таблице: при includeHidden — все, иначе только не скрытые. */
const visibleItems = computed(() => {
  const list = sortedItems.value;
  if (includeHidden.value) return list;
  // Safety-net: дублируем серверную фильтрацию include_hidden=false на клиенте.
  return list.filter((i) => !i.is_hidden);
});

function toggleSort(column: SortColumn | string) {
  const col = column === "age" || column === "total_experience" || column === "salary" ? column : null;
  if (!col) return;
  if (sortBy.value === col) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = col;
    sortDir.value = "asc";
  }
}

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));
const currentPage = computed({
  get: () => Math.floor(offset.value / limit.value) + 1,
  set: (p: number) => {
    offset.value = (p - 1) * limit.value;
  },
});

async function fetchItems() {
  if (!sessionId.value) return;
  try {
    const data = await getSessionItems(sessionId.value, {
      limit: limit.value,
      offset: offset.value,
      include_hidden: includeHidden.value,
    });
    items.value = data.items;
    total.value = data.total;
  } catch {
    items.value = [];
    total.value = 0;
  }
}

async function exportFavoritesToXlsx() {
  if (!sessionId.value || exportingFavorites.value) return;

  exportingFavorites.value = true;

  try {
    const pageLimit = 200;
    let currentOffsetLocal = 0;
    const allItems: SearchItemResponse[] = [];
    let totalCount = 0;

    // Загружаем все элементы сессии порциями
    // независимо от текущей пагинации на странице.
    // Используем includeHidden, чтобы отражать текущий фильтр.
    // Экспортируем только избранные ниже.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const data = await getSessionItems(sessionId.value, {
        limit: pageLimit,
        offset: currentOffsetLocal,
        include_hidden: includeHidden.value,
      });

      allItems.push(...data.items);
      totalCount = data.total;
      const received = data.items.length;

      if (received === 0 || allItems.length >= totalCount) {
        break;
      }

      const step = data.limit ?? pageLimit;
      currentOffsetLocal += step;
    }

    const favoriteItems = allItems.filter((i) => i.is_favorite);

    if (favoriteItems.length === 0) {
      return;
    }

    const details: SearchItemDetailResponse[] = [];

    for (const item of favoriteItems) {
      try {
        const detail = await getSessionItem(sessionId.value, item.id);
        details.push(detail);
      } catch (err) {
        console.error("Failed to load session item detail for export", err);
      }
    }

    if (details.length === 0) {
      return;
    }

    const rows: (string | number | null)[][] = [];
    rows.push([
      "Название",
      "Действующая должность",
      "Последняя компания",
      "Желаемый уровень зп",
      "Ссылка на резюме на hh.ru",
    ]);

    for (const detail of details) {
      const title = getTitleOrName(detail);
      const position = getResumePosition(detail);
      const company = getResumeCompany(detail);
      const salary = getSalaryStr(detail);
      const url = getPayloadCell(detail, "alternate_url");

      rows.push([title, position, company, salary, url]);
    }

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Избранное");

    const filename = `hh-session-${sessionId.value}-favorites.xlsx`;
    XLSX.writeFile(wb, filename);
  } catch (err) {
    console.error("Failed to export favorites to XLSX", err);
    error.value = err;
  } finally {
    exportingFavorites.value = false;
  }
}

function openDetail(itemId: string) {
  if (!sessionId.value) return;
  const listItem = items.value.find((i) => i.id === itemId) ?? null;
  detailOpen.value = true;
  detailItem.value = listItem;
}

function closeDetail() {
  detailOpen.value = false;
  detailItem.value = null;
}

async function toggleFavorite(item: SearchItemResponse) {
  if (!sessionId.value) return;
  const nextFavorite = !item.is_favorite;
  items.value = items.value.map((i) =>
    i.id === item.id ? { ...i, is_favorite: nextFavorite } : i
  );
  if (detailItem.value?.id === item.id) {
    detailItem.value = { ...detailItem.value, is_favorite: nextFavorite };
  }
  try {
    await updateSessionItem(sessionId.value, item.id, {
      is_favorite: nextFavorite,
    });
  } catch {
    items.value = items.value.map((i) =>
      i.id === item.id ? { ...i, is_favorite: item.is_favorite } : i
    );
    if (detailItem.value?.id === item.id) {
      detailItem.value = { ...detailItem.value, is_favorite: item.is_favorite };
    }
  }
}

async function toggleHidden(item: SearchItemResponse) {
  if (!sessionId.value) return;
  if (item.is_favorite) return;
  const nextHidden = !item.is_hidden;
  items.value = items.value.map((i) =>
    i.id === item.id ? { ...i, is_hidden: nextHidden } : i
  );
  if (detailItem.value?.id === item.id) {
    detailItem.value = { ...detailItem.value, is_hidden: nextHidden };
  }
  try {
    await updateSessionItem(sessionId.value, item.id, {
      is_hidden: nextHidden,
    });
  } catch {
    items.value = items.value.map((i) =>
      i.id === item.id ? { ...i, is_hidden: item.is_hidden } : i
    );
    if (detailItem.value?.id === item.id) {
      detailItem.value = { ...detailItem.value, is_hidden: item.is_hidden };
    }
  }
}

function goBack() {
  router.push({ name: "HHSearch" }).catch(() => {});
}

type PayloadRecord = Record<string, unknown>;
type SourceRecord = SearchItemResponse | PayloadRecord | null | undefined;

/** Источник данных HH: raw_data (новый) → payload (legacy) → сам item. */
function getData(item: SourceRecord): Record<string, unknown> | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  const raw = o.raw_data;
  if (raw != null && typeof raw === "object") return raw as Record<string, unknown>;
  const payload = o.payload;
  if (payload != null && typeof payload === "object") return payload as Record<string, unknown>;
  return o;
}

function getRoot(item: SourceRecord): Record<string, unknown> | null {
  if (!item || typeof item !== "object") return null;
  return item as Record<string, unknown>;
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value) return value;
  }
  return null;
}

function getFieldFromSources(item: SourceRecord, key: string): unknown {
  const data = getData(item);
  if (data && key in data) return data[key];
  const root = getRoot(item);
  if (root && key in root) return root[key];
  return undefined;
}

/** Название (резюме: title, вакансия: name). Данные из raw_data / payload / item. */
function getTitleOrName(item: SourceRecord): string {
  const title = pickString(
    getFieldFromSources(item, "title"),
    getFieldFromSources(item, "name")
  );
  return title ?? "—";
}

/** Действующая должность — position с последнего места работы (experience[0]). */
function getExperience(item: SourceRecord): unknown[] {
  const exp = getFieldFromSources(item, "experience");
  if (Array.isArray(exp) && exp.length > 0) {
    return exp;
  }
  return [];
}

function getResumePosition(item: SourceRecord): string {
  const exp = getExperience(item);
  if (exp.length > 0) {
    const first = exp[0] as { position?: string } | undefined;
    const position = pickString(first?.position);
    if (position) return position;
  }
  return "—";
}

/** Последняя компания. employer_name, employer.name или experience[0].company/employer. */
function getResumeCompany(item: SourceRecord): string {
  const employerName = pickString(getFieldFromSources(item, "employer_name"));
  if (employerName) return employerName;

  const employer = getFieldFromSources(item, "employer") as { name?: string } | undefined;
  const directEmployerName = pickString(employer?.name);
  if (directEmployerName) return directEmployerName;

  const exp = getExperience(item);
  if (exp.length > 0) {
    const first = exp[0] as { company?: string; employer?: { name?: string } } | undefined;
    const company = pickString(first?.company, first?.employer?.name);
    if (company) return company;
  }
  return "—";
}

type SalaryObj = { amount?: number; from?: number; to?: number; currency?: string };

function formatSalaryObj(s: SalaryObj): string | null {
  if (typeof s.amount === "number") {
    return String(s.amount);
  }
  const from = s.from;
  const to = s.to;
  if (from != null || to != null) {
    const parts = [from, to].filter((x) => x != null).join(" – ");
    return parts;
  }
  return null;
}

function getSalaryObj(item: SourceRecord): SalaryObj | null {
  const salary = getFieldFromSources(item, "salary");
  if (salary != null && typeof salary === "object") {
    return salary as SalaryObj;
  }
  return null;
}

function getSalaryAmount(item: SourceRecord): number | null {
  const directAmount = getFieldFromSources(item, "salary_amount");
  if (typeof directAmount === "number") return directAmount;

  const salary = getSalaryObj(item);
  if (!salary) return null;
  if (typeof salary.amount === "number") return salary.amount;
  if (typeof salary.from === "number") return salary.from;
  return null;
}

/** Желаемый уровень зп. salary_amount или salary {amount/from/to, currency} (HH API). */
function getSalaryStr(item: SourceRecord): string {
  const amount = getFieldFromSources(item, "salary_amount");
  if (typeof amount === "number") return String(amount);

  const salary = getSalaryObj(item);
  if (salary) {
    const value = formatSalaryObj(salary);
    if (value) return value;
  }

  return "—";
}

/** Числовое значение для сортировки: возраст. */
function getSortableAge(item: SourceRecord): number | null {
  const age = getFieldFromSources(item, "age");
  return typeof age === "number" ? age : null;
}

/** Числовое значение для сортировки: опыт (лет, месяцы). */
function getExperienceMonths(item: SourceRecord): number | null {
  const direct = getFieldFromSources(item, "experience_months");
  if (typeof direct === "number") return direct;
  const te = getFieldFromSources(item, "total_experience") as { months?: number } | undefined;
  return te?.months ?? null;
}

/** Форматирует количество месяцев в "Xг. Yмес." / "Xл. Yмес." с учётом русской морфологии. */
function formatExperienceMonths(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const yearSuffix = (y: number): string => {
    const mod100 = y % 100;
    if (mod100 >= 11 && mod100 <= 19) return "л.";
    const mod10 = y % 10;
    if (mod10 === 1) return "г.";
    if (mod10 >= 2 && mod10 <= 4) return "г.";
    return "л.";
  };

  if (years === 0) return `${months}мес.`;
  if (months === 0) return `${years}${yearSuffix(years)}`;
  return `${years}${yearSuffix(years)} ${months}мес.`;
}

function getSortableExperience(item: SourceRecord): number | null {
  return getExperienceMonths(item);
}

/** Числовое значение для сортировки: зп (amount или from). */
function getSortableSalary(item: SourceRecord): number | null {
  return getSalaryAmount(item);
}

/** Значение для сортировки по ключу колонки. */
function getSortValue(item: SourceRecord, key: SortColumn): number | null {
  if (key === "age") return getSortableAge(item);
  if (key === "total_experience") return getSortableExperience(item);
  if (key === "salary") return getSortableSalary(item);
  return null;
}

/** Значение для опциональной колонки по ключу. Данные из raw_data (HH API). */
function getPayloadCell(item: SourceRecord, key: string): string {
  const o = getData(item);
  if (!o) return "—";

  switch (key) {
    case "area":
      {
        const areaName = pickString(getFieldFromSources(item, "area_name"));
        if (areaName) return areaName;
      }
      {
        const area = o.area as { name?: string } | undefined;
        return typeof area?.name === "string" ? area.name : "—";
      }
    case "age":
      return getSortableAge(item) != null ? String(getSortableAge(item)) : "—";
    case "total_experience": {
      const months = getExperienceMonths(item);
      if (months != null) return formatExperienceMonths(months);
      return "—";
    }
    case "education": {
      const edu = o.education;
      // HH API: education — объект с primary[] (ResumeObjectsEducation)
      if (edu != null && typeof edu === "object" && !Array.isArray(edu)) {
        const eduObj = edu as {
          primary?: Array<{ education_level?: { name?: string } }>;
          level?: { name?: string };
        };
        const primary = eduObj.primary;
        if (Array.isArray(primary) && primary.length > 0) {
          const name = primary[0]?.education_level?.name;
          if (typeof name === "string" && name) return name;
        }
        const levelName = eduObj.level?.name;
        if (typeof levelName === "string" && levelName) return levelName;
      }
      if (typeof o.education_level === "string" && o.education_level) return o.education_level;
      // Legacy/alternate: education — массив
      if (Array.isArray(edu) && edu.length > 0) {
        const first = edu[0] as { level?: { name?: string }; organization?: string } | undefined;
        const level = first?.level?.name;
        const org = first?.organization;
        return [level, org].filter(Boolean).join(", ") || "—";
      }
      return "—";
    }
    case "full_name": {
      const fn = o.first_name;
      const ln = o.last_name;
      const mn = o.middle_name;
      const parts = [fn, ln, mn].filter((x) => typeof x === "string" && x.length > 0);
      return parts.length ? parts.join(" ") : "—";
    }
    case "skill_set": {
      const skills = o.skill_set ?? o.skills;
      if (Array.isArray(skills)) {
        return skills.map((x) => (typeof x === "string" ? x : (x as { name?: string })?.name ?? "")).filter(Boolean).join(", ") || "—";
      }
      return typeof skills === "string" ? skills : "—";
    }
    case "languages": {
      const lang = o.language ?? o.languages;
      if (Array.isArray(lang)) {
        return lang
          .map((x) => (typeof x === "object" && x && "name" in x ? (x as { name?: string }).name : String(x)))
          .filter(Boolean)
          .join(", ") || "—";
      }
      return "—";
    }
    case "employment": {
      const emp = o.employment as { name?: string } | undefined;
      return typeof emp?.name === "string" ? emp.name : "—";
    }
    case "schedule": {
      const sch = o.schedule as { name?: string } | undefined;
      return typeof sch?.name === "string" ? sch.name : "—";
    }
    case "gender":
      if (typeof o.gender === "string" && o.gender) return o.gender;
      {
        const g = o.gender as { name?: string } | undefined;
        return typeof g?.name === "string" ? g.name : "—";
      }
    case "alternate_url":
      return typeof o.alternate_url === "string" ? o.alternate_url : "—";
    case "professional_roles": {
      const roles = o.professional_roles;
      if (Array.isArray(roles)) {
        return roles.map((r) => (typeof r === "object" && r && "name" in r ? (r as { name: string }).name : String(r))).join(", ") || "—";
      }
      return "—";
    }
    case "relocation": {
      const rel = o.relocation as { type?: { name?: string } } | undefined;
      return typeof rel?.type?.name === "string" ? rel.type.name : "—";
    }
    default:
      return "—";
  }
}

const allPageFavorite = computed({
  get: () => {
    if (visibleItems.value.length === 0) return false;
    return visibleItems.value.every((item) => item.is_favorite);
  },
  set: (value: boolean) => {
    setFavoritesForCurrentPage(value).catch(() => {});
  },
});

async function setFavoritesForCurrentPage(nextFavorite: boolean) {
  if (!sessionId.value || bulkFavoriteLoading.value) return;

  const pageIds = new Set(visibleItems.value.map((i) => i.id));
  if (pageIds.size === 0) return;

  const prevItems = items.value.map((i) => ({ ...i }));
  const prevDetailItem = detailItem.value ? { ...detailItem.value } : null;

  bulkFavoriteLoading.value = true;

  try {
    // Оптимистичное обновление локального состояния
    items.value = items.value.map((item) =>
      pageIds.has(item.id) ? { ...item, is_favorite: nextFavorite } : item
    );

    if (detailItem.value && pageIds.has(detailItem.value.id)) {
      detailItem.value = { ...detailItem.value, is_favorite: nextFavorite };
    }

    const itemsToUpdate = prevItems.filter((item) => pageIds.has(item.id));

    await Promise.all(
      itemsToUpdate.map((item) =>
        updateSessionItem(sessionId.value as string, item.id, {
          is_favorite: nextFavorite,
        })
      )
    );
  } catch (err) {
    console.error("Failed to update favorites for current page", err);
    items.value = prevItems;
    detailItem.value = prevDetailItem;
    error.value = err;
  } finally {
    bulkFavoriteLoading.value = false;
  }
}

watch([sessionId, offset, includeHidden], () => {
  fetchItems();
}, { immediate: true });

onMounted(() => {
  if (!sessionId.value) {
    router.replace({ name: "HHSearch" }).catch(() => {});
  }
});
</script>

<template>
  <div class="page-container session-items-page">
    <header class="page-header">
      <h1>Элементы сессии поиска</h1>
      <button type="button" class="btn secondary" @click="goBack">
        Назад к поиску
      </button>
    </header>

    <template v-if="sessionId">
      <p v-if="error" class="hint warning">
        {{ error instanceof Error ? error.message : String(error) }}
      </p>

      <section class="form-section">
        <div class="items-toolbar">
          <div class="items-toolbar-left">
            <span class="items-meta">
              Всего: {{ total }}, страница {{ currentPage }} из {{ totalPages }}
            </span>
            <span>
              В избранном: {{ items.filter((item) => item.is_favorite).length }}
            </span>
          </div>
          <div class="items-toolbar-center">
            <CheckboxField
              v-model="includeHidden"
              name="include-hidden"
              label="Показывать скрытые"
            />
          </div>
          <div class="items-toolbar-right">
            <button
              type="button"
              class="btn secondary"
              :disabled="loading || exportingFavorites"
              @click="exportFavoritesToXlsx"
            >
              {{
                exportingFavorites
                  ? "Выгрузка избранных…"
                  : "Скачать избранные (XLSX)"
              }}
            </button>
          </div>
        </div>

        <div class="optional-columns-panel">
          <span class="optional-columns-label">Дополнительные колонки:</span>
          <div class="optional-columns-checkboxes">
            <label
              v-for="col in OPTIONAL_COLUMNS"
              :key="col.key"
              class="checkbox-label"
            >
              <input
                v-model="visibleOptionalColumns[col.key]"
                type="checkbox"
              />
              {{ col.label }}
            </label>
          </div>
        </div>

        <div v-if="loading" class="loading-state">Загрузка…</div>
        <template v-else>
          <div class="items-table-wrap">
            <table class="items-table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Действующая должность</th>
                  <th>Последняя компания</th>
                  <th
                    class="sortable-cell"
                    @click="toggleSort('salary')"
                  >
                    Желаемый уровень зп
                    <span v-if="sortBy === 'salary'" class="sort-indicator">
                      {{ sortDir === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th
                    v-for="col in activeOptionalColumns"
                    :key="col.key"
                    :class="[
                      { 'cell-long': col.key === 'education' },
                      { 'sortable-cell': col.key === 'age' || col.key === 'total_experience' },
                    ]"
                    @click="col.key === 'age' || col.key === 'total_experience' ? () => toggleSort(col.key) : undefined"
                  >
                    {{ col.label }}
                    <span
                      v-if="(col.key === 'age' || col.key === 'total_experience') && sortBy === col.key"
                      class="sort-indicator"
                    >
                      {{ sortDir === 'asc' ? '↑' : '↓' }}
                    </span>
                  </th>
                  <th>
                    <CheckboxField
                      v-model="allPageFavorite"
                      :disabled="loading || bulkFavoriteLoading"
                      name="all-page-favorite"
                      label="Избранное"
                    />
                  </th>
                  <th>Скрыть</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in visibleItems" :key="item.id">
                  <td class="item-title-cell">
                    <button
                      type="button"
                      class="link-btn"
                      @click="openDetail(item.id)"
                    >
                      {{ getTitleOrName(item) }}
                    </button>
                  </td>
                  <td>{{ getResumePosition(item) }}</td>
                  <td>{{ getResumeCompany(item) }}</td>
                  <td>{{ getSalaryStr(item) }}</td>
                  <td
                    v-for="col in activeOptionalColumns"
                    :key="col.key"
                    :class="{ 'cell-long': col.key === 'education' }"
                    :title="col.key === 'alternate_url' ? getPayloadCell(item, col.key) : undefined"
                  >
                    <template v-if="col.key === 'alternate_url'">
                      <a
                        v-if="getPayloadCell(item, col.key) !== '—'"
                        :href="getPayloadCell(item, col.key)"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="link-btn"
                      >
                        Ссылка
                      </a>
                      <span v-else>—</span>
                    </template>
                    <span v-else>{{ getPayloadCell(item, col.key) }}</span>
                  </td>
                  <td class="actions-cell">
                    <div
                      class="actions-inner"
                      :title="item.is_favorite ? 'Убрать из избранного' : 'В избранное'"
                    >
                      <CheckboxField
                        :model-value="!!item.is_favorite"
                        :disabled="bulkFavoriteLoading"
                        :name="`favorite-${item.id}`"
                        @update:modelValue="() => toggleFavorite(item)"
                      />
                    </div>
                  </td>
                  <td class="actions-cell">
                    <div class="actions-inner">
                      <button
                        type="button"
                        class="btn small icon-btn"
                        :title="item.is_favorite ? 'Сначала уберите из избранного' : (item.is_hidden ? 'Показать' : 'Скрыть')"
                        :disabled="!!item.is_favorite"
                        @click="toggleHidden(item)"
                      >
                        <HiddenIcon v-if="item.is_hidden" class="icon hidden-icon" />
                        <ShowIcon v-else class="icon show-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="!loading && visibleItems.length === 0" class="empty-state">
            Нет элементов для отображения.
          </div>

          <div v-if="totalPages > 1" class="pagination">
            <button
              type="button"
              class="btn small"
              :disabled="currentPage <= 1"
              @click="currentPage = currentPage - 1"
            >
              Назад
            </button>
            <span class="page-num">{{ currentPage }} / {{ totalPages }}</span>
            <button
              type="button"
              class="btn small"
              :disabled="currentPage >= totalPages"
              @click="currentPage = currentPage + 1"
            >
              Вперёд
            </button>
          </div>
        </template>
      </section>

      <SessionItemDetailModal
        :open="detailOpen"
        :item="detailItem"
        @close="closeDetail"
      />
    </template>
  </div>
</template>

<style scoped>
.items-toolbar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.items-toolbar-left {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.items-toolbar-center {
  flex: 0 0 auto;
}
.items-toolbar-right {
  flex: 0 0 auto;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.items-meta {
  opacity: 0.9;
  font-size: 0.95rem;
}
.optional-columns-panel {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0.5rem 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.optional-columns-label {
  font-weight: 500;
  flex-shrink: 0;
}
.optional-columns-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
}
.optional-columns-checkboxes .checkbox-label {
  white-space: nowrap;
}
.cell-long {
  max-width: 12rem;
}
.cell-long span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.loading-state,
.empty-state {
  padding: 1.5rem;
  text-align: center;
  opacity: 0.9;
}
.items-table-wrap {
  overflow-x: auto;
  margin-bottom: 1rem;
}
.items-table {
  width: 100%;
  border-collapse: collapse;
}
.items-table th,
.items-table td {
  padding: 0.5rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}
.items-table th {
  font-weight: 600;
}
.sortable-cell {
  cursor: pointer;
  user-select: none;
}
.sortable-cell:hover {
  opacity: 0.9;
}
.sort-indicator {
  margin-left: 0.25rem;
  font-size: 0.85em;
}
.item-title-cell {
  max-width: 16rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.link-btn {
  background: none;
  border: none;
  color: #c4c6f3;
  cursor: pointer;
  font: inherit;
  padding: 0;
}
.link-btn:hover {
  color: #8b92ff;
}
.actions-cell {
  text-align: center;
}
.actions-inner {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
}
.pagination {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.page-num {
  font-size: 0.95rem;
}
.actions-cell :deep(.icon) {
  width: 1rem;
  height: 1rem;
  display: block;
  flex-shrink: 0;
}
.actions-cell :deep(.badge-icon) {
  color: #ffffff;
}
.actions-cell :deep(.badge-check-icon) {
  color: #2ecc71;
}
.btn.icon-btn {
  padding: 0.35rem 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.btn.icon-btn :deep(.hidden-icon) {
  color: #e04052;
}
.btn.icon-btn :deep(.show-icon) {
  color: #ffffff;
}
</style>
