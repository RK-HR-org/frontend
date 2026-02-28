<script setup lang="ts">
import { computed } from "vue";
import type { SearchItemDetailResponse } from "../../types";

type PayloadRecord = Record<string, unknown>;
type SalaryObj = { amount?: number; from?: number; to?: number; currency?: string };
type SourceRecord = SearchItemDetailResponse | PayloadRecord | null | undefined;

type ExperienceRow = {
  id?: string | number;
  company?: string;
  position?: string;
  start?: string;
  end?: string | null;
};

type DetailViewData = Record<string, unknown> & {
  alternate_url?: string;
  experience?: ExperienceRow[];
};

const props = defineProps<{
  open: boolean;
  item: SearchItemDetailResponse | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

function close() {
  emit("close");
}

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

function getTitleOrName(item: SourceRecord): string {
  return pickString(
    getFieldFromSources(item, "title"),
    getFieldFromSources(item, "name")
  ) ?? "—";
}

function getExperience(item: SourceRecord): unknown[] {
  const exp = getFieldFromSources(item, "experience");
  return Array.isArray(exp) ? exp : [];
}

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

function formatSalaryObj(s: SalaryObj): string | null {
  if (typeof s.amount === "number") {
    return String(s.amount);
  }
  const from = s.from;
  const to = s.to;
  if (from != null || to != null) {
    return [from, to].filter((x) => x != null).join(" – ");
  }
  return null;
}

function getSalaryStr(item: SourceRecord): string {
  const amount = getFieldFromSources(item, "salary_amount");
  if (typeof amount === "number") return String(amount);

  const salary = getFieldFromSources(item, "salary");
  if (salary != null && typeof salary === "object") {
    const result = formatSalaryObj(salary as SalaryObj);
    if (result) return result;
  }

  return "—";
}

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
    default:
      return "—";
  }
}

type PhotoObj = { small?: string; medium?: string; id?: string } | null;

function getPhoto(item: SourceRecord): PhotoObj {
  const raw = getFieldFromSources(item, "photo");
  if (raw != null && typeof raw === "object") return raw as PhotoObj;
  return null;
}

function formatMonthYearRange(start?: string, end?: string | null): string {
  if (!start) return "—";
  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) return "—";

  const months = ["янв.", "фев.", "мар.", "апр.", "май.", "июн.", "июл.", "авг.", "сен.", "окт.", "ноя.", "дек."];
  const startMonth = months[startDate.getMonth()];
  const startYear = startDate.getFullYear();

  if (!end) return `${startMonth}${startYear}-сейчас`;

  const endDate = new Date(end);
  if (Number.isNaN(endDate.getTime())) return `${startMonth}${startYear}`;

  const endMonth = months[endDate.getMonth()];
  const endYear = endDate.getFullYear();

  return `${startMonth}${startYear}-${endMonth}${endYear}`;
}

function itemPayloadSummary(item: SearchItemDetailResponse): { titleOrName: string; area: string; extra: string; photo: PhotoObj; salary: string } {
  const titleOrName = getTitleOrName(item);
  const area = getPayloadCell(item, "area");
  const employer = getResumeCompany(item);
  const salaryStr = getSalaryStr(item);
  const extra = employer !== "—" ? employer : salaryStr !== "—" ? salaryStr : "—";
  const photo = getPhoto(item);
  const salary = getSalaryStr(item);
  return { titleOrName, area: area !== "—" ? area : "—", extra, photo, salary };
}

const detailDataToShow = computed<DetailViewData>(() => {
  const item = props.item;
  if (!item) return {};
  const full = (item as Record<string, unknown>).full_data;
  if (full && typeof full === "object" && Object.keys(full).length > 0) return full as DetailViewData;
  const raw = (item as Record<string, unknown>).raw_data;
  if (raw && typeof raw === "object" && Object.keys(raw).length > 0) return raw as DetailViewData;
  return item as unknown as DetailViewData;
});

const summary = computed(() => (props.item ? itemPayloadSummary(props.item) : null));
const alternateUrl = computed(() => {
  const url = detailDataToShow.value.alternate_url;
  return typeof url === "string" ? url : "—";
});
const experienceRows = computed(() => {
  const rows = detailDataToShow.value.experience;
  return Array.isArray(rows) ? rows : [];
});
</script>

<template>
  <div v-if="open" class="detail-overlay" @click.self="close">
    <div class="detail-panel">
      <div class="detail-header">
        <h2>Элемент {{ item?.hh_id ?? "—" }}</h2>
        <button type="button" class="btn small" @click="close">
          Закрыть
        </button>
      </div>
      <div v-if="item" class="detail-body">
        <div class="detail-summary">
          <div class="detail-summary-grid">
            <div v-if="summary?.photo?.small" class="detail-summary-photo">
              <img :src="summary.photo.small" alt="Фото" />
            </div>
            <dl class="detail-dl">
              <template v-if="summary && summary.titleOrName !== '—'">
                <dt>Резюме</dt>
                <dd>{{ summary.titleOrName }}</dd>
              </template>
              <template v-if="summary && summary.area !== '—'">
                <dt>Регион</dt>
                <dd>{{ summary.area }}</dd>
              </template>
              <template v-if="summary && summary.extra !== '—'">
                <dt>Работодатель</dt>
                <dd>{{ summary.extra }}</dd>
              </template>
              <template v-if="summary && summary.salary !== '—'">
                <dt>Ожидания по зарплате</dt>
                <dd>{{ summary.salary }}</dd>
              </template>
            </dl>
          </div>
        </div>
        <dl class="detail-dl">
          <dt>HH ссылка</dt>
          <dd>
            <template v-if="alternateUrl !== '—'">
              <a :href="alternateUrl" target="_blank" rel="noopener noreferrer">{{ alternateUrl }}</a>
            </template>
            <span v-else>—</span>
          </dd>
          <dt>Избранное</dt>
          <dd>{{ item.is_favorite ? "Да" : "Нет" }}</dd>
          <dt>Скрыт</dt>
          <dd>{{ item.is_hidden ? "Да" : "Нет" }}</dd>
        </dl>
        <div class="payload-block">
          <h3>История работы</h3>
          <div class="job-history-table-wrap">
            <table class="job-history-table">
              <thead>
                <tr>
                  <th>Компания</th>
                  <th>Должность</th>
                  <th>Период работы</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(exp, idx) in experienceRows" :key="exp.id ?? idx">
                  <td>
                    <span v-if="exp.employer?.logo_urls?.['90']">
                      <img class="employer-logo" :src="exp.employer?.logo_urls?.original" alt="Логотип компании" />
                    </span>
                    <span>
                      {{ exp.company ?? "—" }}
                    </span>
                  </td>
                  <td>{{ exp.position ?? "—" }}</td>
                  <td>{{ formatMonthYearRange(exp.start, exp.end) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <pre class="payload-json">{{ JSON.stringify(detailDataToShow, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.employer-logo {
  width: 44px;
  height: 44px;
  border-radius: 20%;
  object-fit: cover;
}

.detail-summary {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.detail-summary-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem 1.5rem;
  align-items: flex-start;
}

.detail-summary-photo img {
  display: block;
  width: 96px;
  height: 96px;
  border-radius: 8px;
  object-fit: cover;
}

.detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.detail-panel {
  background: var(--page-bg, #1a1a2e);
  border-radius: 8px;
  max-width: 66rem;
  max-height: 90vh;
  overflow: auto;
  padding: 1.25rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.detail-header h2 {
  margin: 0;
  font-size: 1.15rem;
}

.detail-dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.35rem 1rem;
  margin: 0 0 1rem;
}

.detail-dl dt {
  font-weight: 500;
  opacity: 0.9;
}

.payload-block h3 {
  margin: 0.75rem 0 0.35rem;
  font-size: 1rem;
}

.payload-json {
  margin: 0;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  font-size: 0.8rem;
  overflow-x: auto;
  max-height: 20rem;
  overflow-y: auto;
}
</style>
