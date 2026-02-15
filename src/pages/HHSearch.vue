<script setup lang="ts">
import { reactive, computed, ref, onMounted } from "vue";
import HHSearchPromptsSection from "../components/hh/HHSearchPromptsSection.vue";
import HHSearchTextSection from "../components/hh/HHSearchTextSection.vue";
import HHSearchDemographicsSection from "../components/hh/HHSearchDemographicsSection.vue";
import HHSearchGeoSection from "../components/hh/HHSearchGeoSection.vue";
import HHSearchDatesSection from "../components/hh/HHSearchDatesSection.vue";
import HHSearchEducationExperienceSection from "../components/hh/HHSearchEducationExperienceSection.vue";
import HHSearchConditionsSkillsSection from "../components/hh/HHSearchConditionsSkillsSection.vue";
import HHSearchSalarySection from "../components/hh/HHSearchSalarySection.vue";
import HHSearchRoleStatusSection from "../components/hh/HHSearchRoleStatusSection.vue";
import HHSearchSimilarSection from "../components/hh/HHSearchSimilarSection.vue";
import HHSearchFoldersSection from "../components/hh/HHSearchFoldersSection.vue";
import HHSearchSortingSection from "../components/hh/HHSearchSortingSection.vue";
import HHSearchEnrichedResult from "../components/hh/HHSearchEnrichedResult.vue";
import { useTeams } from "../composables/useTeams";
import { useSearchSessions } from "../composables/useSearchSessions";
import { useQuota } from "../composables/useQuota";
import { useStatics } from "../composables/useStatics";
import type {
  SearchEnrichResponse,
  TextQueryItem,
  RemainingQuotaResponse,
  EnrichedDataDTO,
  TextQueryField,
  TextQueryLogic,
  TextQueryPeriod,
} from "../types";

type MaybeString = string | null;
type MaybeNumber = number | null;

function defaultTextQueryItem(): TextQueryItem {
  return {
    text: "",
    logic: "all",
    field: "everywhere",
    period: "all_time",
  };
}

const searchForm = reactive({
  // Промпты
  positivePrompt: "",
  negativePrompt: "",

  // Текст (каждое условие: text + logic + field + period)
  textQueries: [defaultTextQueryItem()] as TextQueryItem[],
  textCompanySize: "" as MaybeString,
  textIndustry: "" as MaybeString,
  byTextPrefix: false,

  // Возраст / Пол / Метки
  ageFrom: null as MaybeNumber,
  ageTo: null as MaybeNumber,
  gender: "" as MaybeString,
  labels: [] as string[],

  // География
  areas: [] as string[],
  relocation: "" as MaybeString,
  metro: [] as string[],
  district: "" as MaybeString,
  citizenship: [] as string[],
  workTicket: [] as string[],
  businessTripReadiness: [] as string[],

  // Даты публикации
  period: null as MaybeNumber,
  dateFrom: "" as MaybeString,
  dateTo: "" as MaybeString,

  // Образование и опыт
  educationLevels: [] as string[],
  educationLevelDeprecated: "" as MaybeString,
  experience: [] as string[],
  educationalInstitution: [] as string[],
  filterExpIndustry: [] as string[],
  filterExpPeriod: "" as MaybeString,

  // Условия и навыки
  employment: [] as string[],
  schedule: [] as string[],
  skills: [] as string[],
  languages: [] as string[], // формат lang.level, например ita.c2
  driverLicenseTypes: [] as string[],

  // Зарплата
  currency: "" as MaybeString,
  salaryFrom: null as MaybeNumber,
  salaryTo: null as MaybeNumber,

  // Роль и статусы
  professionalRole: [] as string[],
  jobSearchStatus: [] as string[],
  withJobSearchStatus: false,

  // Похожие / отклики
  vacancyId: "" as MaybeString,
  resumeSimilar: "" as MaybeString,
  searchInResponses: false,
  searchByVacancyId: "" as MaybeString,

  // Папки / автопоиски
  folders: [] as string[],
  includeAllFolders: false,
  savedSearchId: "" as MaybeString,
  lastUsedTimestamp: "" as MaybeString,
  lastUsed: "" as MaybeString,

  // Сортировка / пагинация (для сохранения настроек)
  orderBy: "" as MaybeString,
  page: 0,
  perPage: 20,
});

const periodDateConflict = computed(
  () => searchForm.period && (searchForm.dateFrom || searchForm.dateTo)
);
const folderConflict = computed(
  () => searchForm.folders.length > 0 && searchForm.includeAllFolders
);

const { teams, fetchTeams } = useTeams();
const {
  createSession,
  approveSession,
  executeSession,
  loading: sessionLoading,
  error: sessionError,
} = useSearchSessions();

const { remaining, getRemaining, loading: quotaLoading } = useQuota();

const {
  getAreas,
  getProfessionalRoles,
  getSkills,
  getIndustries,
  getLanguages,
  suggestAreas,
  suggestPositions,
  suggestSkills,
} = useStatics();

/** Опции для селектов (значение/подпись). */
function normOpt(item: unknown): { value: string; label: string } {
  if (item == null) return { value: "", label: "" };
  const o = item as Record<string, unknown>;
  const val = o.id ?? o.value ?? "";
  const label = (o.name ?? o.label ?? String(val)) as string;
  return { value: String(val), label };
}

const areasOptions = ref<{ value: string; label: string }[]>([]);
const professionalRolesOptions = ref<{ value: string; label: string }[]>([]);
const skillsOptions = ref<{ value: string; label: string }[]>([]);
const industriesOptions = ref<{ value: string; label: string }[]>([]);
const languagesOptions = ref<{ value: string; label: string }[]>([]);

const suggestAreasQuery = ref("");
const suggestAreasResults = ref<{ value: string; label: string }[]>([]);
const suggestAreasLoading = ref(false);
const suggestSkillsQuery = ref("");
const suggestSkillsResults = ref<{ value: string; label: string }[]>([]);
const suggestSkillsLoading = ref(false);

const selectedTeamId = ref<string>("");
const searchMode = ref<"resumes" | "vacancies">("resumes");
const enrichResult = ref<SearchEnrichResponse | null>(null);
const executeResult = ref<Awaited<ReturnType<typeof executeSession>> | null>(
  null
);
const cozyFilledFields = ref<Set<string>>(new Set());

const quotaInfo = computed<RemainingQuotaResponse | null>(
  () => remaining.value
);
const cozyFilledFieldsList = computed(() => Array.from(cozyFilledFields.value));

const VALID_FIELDS: TextQueryField[] = [
  "everywhere", "title", "education", "keywords", "experience",
  "experience_company", "experience_position", "experience_description", "skills",
];
const VALID_LOGIC: TextQueryLogic[] = ["all", "any", "phrase"];
const VALID_PERIOD: TextQueryPeriod[] = [
  "all_time", "last_year", "last_three_years", "last_six_years",
];

function applyEnrichedToForm(enriched: EnrichedDataDTO) {
  cozyFilledFields.value = new Set();

  if (enriched.keywords_include?.length) {
    const text = enriched.keywords_include.join(", ");
    searchForm.positivePrompt = searchForm.positivePrompt
      ? `${searchForm.positivePrompt}\n${text}`
      : text;
    cozyFilledFields.value.add("positivePrompt");
  }
  if (enriched.keywords_exclude?.length) {
    const text = enriched.keywords_exclude.join(", ");
    searchForm.negativePrompt = searchForm.negativePrompt
      ? `${searchForm.negativePrompt}\n${text}`
      : text;
    cozyFilledFields.value.add("negativePrompt");
  }

  if (enriched.text_search?.query) {
    const ts = enriched.text_search;
    const fieldVal = ts.field?.[0];
    const field = (VALID_FIELDS.includes(fieldVal as TextQueryField)
      ? fieldVal
      : "everywhere") as TextQueryField;
    const logic = (VALID_LOGIC.includes(ts.logic as TextQueryLogic)
      ? ts.logic
      : "all") as TextQueryLogic;
    const period = (VALID_PERIOD.includes(ts.period as TextQueryPeriod)
      ? ts.period
      : "all_time") as TextQueryPeriod;
    if (searchForm.textQueries.length) {
      searchForm.textQueries[0] = {
        text: ts.query,
        logic,
        field,
        period,
      };
    } else {
      searchForm.textQueries.push({
        text: ts.query,
        logic,
        field,
        period,
      });
    }
    cozyFilledFields.value.add("textQueries");
  }

  if (enriched.skills?.length) {
    searchForm.skills = [...enriched.skills];
    cozyFilledFields.value.add("skills");
  }
  if (enriched.experience?.hh_experience_id != null && enriched.experience?.hh_experience_id !== "") {
    const expId = enriched.experience.hh_experience_id;
    searchForm.experience = Array.isArray(expId) ? expId.map(String) : [String(expId)];
    cozyFilledFields.value.add("experience");
  }
  if (enriched.age) {
    if (enriched.age.age_from != null) {
      searchForm.ageFrom = enriched.age.age_from;
      cozyFilledFields.value.add("ageFrom");
    }
    if (enriched.age.age_to != null) {
      searchForm.ageTo = enriched.age.age_to;
      cozyFilledFields.value.add("ageTo");
    }
  }
  if (enriched.location) {
    if (enriched.location.area_id != null) {
      searchForm.areas = [String(enriched.location.area_id)];
      cozyFilledFields.value.add("areas");
    } else if (enriched.location.area_name) {
      searchForm.areas = [enriched.location.area_name];
      cozyFilledFields.value.add("areas");
    }
  }
  if (enriched.schedule?.length) {
    searchForm.schedule = [...enriched.schedule];
    cozyFilledFields.value.add("schedule");
  }
  if (enriched.employment?.length) {
    searchForm.employment = [...enriched.employment];
    cozyFilledFields.value.add("employment");
  }
  if (enriched.salary) {
    if (enriched.salary.salary_from != null) {
      searchForm.salaryFrom = enriched.salary.salary_from;
      cozyFilledFields.value.add("salaryFrom");
    }
    if (enriched.salary.salary_to != null) {
      searchForm.salaryTo = enriched.salary.salary_to;
      cozyFilledFields.value.add("salaryTo");
    }
    if (enriched.salary.currency != null && enriched.salary.currency !== "") {
      searchForm.currency = String(enriched.salary.currency);
      cozyFilledFields.value.add("currency");
    }
  }
}

async function loadDictionaries() {
  const loadOne = async (
    fn: () => Promise<unknown[]>,
  ): Promise<unknown[]> => {
    try {
      return await fn();
    } catch {
      return [];
    }
  };
  const [areas, roles, skills, industries, languages] = await Promise.all([
    loadOne(getAreas),
    loadOne(getProfessionalRoles),
    loadOne(getSkills),
    loadOne(getIndustries),
    loadOne(getLanguages),
  ]);
  areasOptions.value = (areas as unknown[]).map(normOpt).filter((o) => o.value !== "");
  professionalRolesOptions.value = (roles as unknown[]).map(normOpt).filter((o) => o.value !== "");
  skillsOptions.value = (skills as unknown[]).map(normOpt).filter((o) => o.value !== "");
  industriesOptions.value = (industries as unknown[]).map(normOpt).filter((o) => o.value !== "");
  languagesOptions.value = (languages as unknown[]).map(normOpt).filter((o) => o.value !== "");
}

function normalizeSuggestResponse(data: unknown): { value: string; label: string }[] {
  if (Array.isArray(data)) {
    return data.map(normOpt).filter((o) => o.value !== "");
  }
  const obj = data as { items?: unknown[] };
  if (Array.isArray(obj?.items)) {
    return obj.items.map(normOpt).filter((o) => o.value !== "");
  }
  return [];
}

let suggestAreasTimer: ReturnType<typeof setTimeout> | null = null;
async function fetchSuggestAreas() {
  const q = suggestAreasQuery.value.trim();
  if (q.length < 2) {
    suggestAreasResults.value = [];
    return;
  }
  suggestAreasLoading.value = true;
  try {
    const data = await suggestAreas(q);
    suggestAreasResults.value = normalizeSuggestResponse(data);
  } catch {
    suggestAreasResults.value = [];
  } finally {
    suggestAreasLoading.value = false;
  }
}

function onSuggestAreasInput() {
  if (suggestAreasTimer) clearTimeout(suggestAreasTimer);
  suggestAreasTimer = setTimeout(fetchSuggestAreas, 300);
}

let suggestSkillsTimer: ReturnType<typeof setTimeout> | null = null;
async function fetchSuggestSkills() {
  const q = suggestSkillsQuery.value.trim();
  if (q.length < 2) {
    suggestSkillsResults.value = [];
    return;
  }
  suggestSkillsLoading.value = true;
  try {
    const data = await suggestSkills(q);
    suggestSkillsResults.value = normalizeSuggestResponse(data);
  } catch {
    suggestSkillsResults.value = [];
  } finally {
    suggestSkillsLoading.value = false;
  }
}

function onSuggestSkillsInput() {
  if (suggestSkillsTimer) clearTimeout(suggestSkillsTimer);
  suggestSkillsTimer = setTimeout(fetchSuggestSkills, 300);
}

function addAreaFromSuggest(opt: { value: string; label: string }) {
  if (!searchForm.areas.includes(opt.value)) {
    searchForm.areas = [...searchForm.areas, opt.value];
  }
}

function addSkillFromSuggest(opt: { value: string; label: string }) {
  if (!searchForm.skills.includes(opt.value)) {
    searchForm.skills = [...searchForm.skills, opt.value];
  }
}

onMounted(() => {
  fetchTeams();
  loadDictionaries();
});

function buildQueryRaw(): Record<string, unknown> {
  const positive = searchForm.positivePrompt?.trim() || "";
  const negative = searchForm.negativePrompt?.trim() || "";
  const text = [positive, negative].filter(Boolean).join("\n");
  if (!text) return { query: "" };
  return { query: text };
}

function getPrompts() {
  const positive =
    searchForm.positivePrompt?.trim() || null;
  const negative =
    searchForm.negativePrompt?.trim() || null;
  if (!positive && !negative) return null;
  return { positive: positive ?? null, negative: negative ?? null };
}

async function createSessionWithEnrich() {
  sessionError.value = null;
  if (!selectedTeamId.value) {
    sessionError.value = new Error("Выберите команду");
    return;
  }
  const prompts = getPrompts();
  if (!prompts) {
    sessionError.value = new Error("Введите положительный или отрицательный промпт");
    return;
  }
  // Проверяем оставшуюся квоту перед созданием сессии
  await getRemaining(selectedTeamId.value);
  if (quotaInfo.value && !quotaInfo.value.can_make_request) {
    sessionError.value = new Error(
      "Недостаточно квоты для выполнения поиска. Обратитесь к администратору команды."
    );
    return;
  }
  enrichResult.value = null;
  executeResult.value = null;
  try {
    const payload: import("../types").SearchCreateRequest = {
      team_id: selectedTeamId.value,
      mode: searchMode.value,
      searchType: "simple",
      query_raw: buildQueryRaw(),
      ...(prompts ? { prompts } : {}),
    };
    const data = await createSession(payload);
    const sessionId = (data as { session_id?: string; id?: string }).session_id ?? (data as { id?: string }).id;
    if (sessionId) {
      enrichResult.value = {
        session_id: sessionId,
        enriched_filters: (data as SearchEnrichResponse).enriched_filters ?? {},
        diff: (data as SearchEnrichResponse).diff ?? {},
      };
      const filters = (data as SearchEnrichResponse).enriched_filters;
      if (filters && typeof filters === "object") {
        try {
          applyEnrichedToForm(filters);
        } catch (_e) {
          // не ломаем показ результата при неожиданной структуре enriched_filters
        }
      }
    }
  } catch {
    // error already in sessionError
  }
}

async function confirmApprove() {
  if (!enrichResult.value?.session_id) return;
  try {
    await approveSession(enrichResult.value.session_id);
    enrichResult.value = {
      ...enrichResult.value,
      enriched_filters: enrichResult.value.enriched_filters,
      diff: enrichResult.value.diff,
    };
  } catch {
    // error in sessionError
  }
}

async function confirmExecute() {
  if (!enrichResult.value?.session_id) return;
  try {
    const result = await executeSession(enrichResult.value.session_id, {
      page: searchForm.page ?? 0,
    });
    executeResult.value = result;
  } catch {
    // error in sessionError
  }
}

function exportJson() {
  const dataStr = JSON.stringify(searchForm, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "hh-search-params.json";
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="page-container hhsearch-page">
    <header class="page-header">
      <h1>Поиск резюме (HH)</h1>
      <button type="button" class="btn primary" @click="exportJson">
        Экспорт JSON
      </button>
    </header>

    <section class="form-section">
      <h3>Сессия поиска</h3>
      <div class="grid two">
        <div class="field-wrapper">
          <label class="field-label" for="session-team">Команда</label>
          <select
            id="session-team"
            v-model="selectedTeamId"
            class="field-input-base"
          >
            <option value="">— Выберите команду —</option>
            <option
              v-for="t in teams"
              :key="t.id"
              :value="t.id"
            >
              {{ t.name }}
            </option>
          </select>
        </div>
        <div class="field-wrapper">
          <span class="field-label">Режим</span>
          <div class="checkbox-group">
            <label class="checkbox">
              <input v-model="searchMode" type="radio" value="resumes" />
              Резюме
            </label>
            <label class="checkbox">
              <input v-model="searchMode" type="radio" value="vacancies" />
              Вакансии
            </label>
          </div>
        </div>
      </div>

      <HHSearchPromptsSection :form="searchForm" :cozy-filled-keys="cozyFilledFieldsList" />
      <p v-if="sessionError" class="hint warning">
        {{ sessionError instanceof Error ? sessionError.message : String(sessionError) }}
      </p>
      <button
        type="button"
        class="btn primary"
        :disabled="sessionLoading || !selectedTeamId"
        @click="createSessionWithEnrich"
      >
        {{ sessionLoading ? "Отправка…" : "Отправить в Cozy AI и заполнить форму" }}
      </button>

      <template v-if="enrichResult">
        <HHSearchEnrichedResult
          :enriched-filters="enrichResult.enriched_filters"
          :diff="enrichResult.diff"
          :session-id="enrichResult.session_id"
        />
        <div class="session-actions">
          <button
            type="button"
            class="btn primary"
            :disabled="sessionLoading"
            @click="confirmApprove"
          >
            Подтвердить сессию
          </button>
          <button
            type="button"
            class="btn primary"
            :disabled="sessionLoading"
            @click="confirmExecute"
          >
            Выполнить поиск
          </button>
        </div>
        <div v-if="executeResult" class="execute-summary">
          Найдено: {{ executeResult.found }}, страница {{ executeResult.page + 1 }} из {{ executeResult.pages }}.
          <router-link
            v-if="enrichResult?.session_id"
            :to="{ name: 'SessionItems', params: { sessionId: enrichResult.session_id } }"
            class="link-session-items"
          >
            Смотреть элементы сессии
          </router-link>
        </div>
      </template>
    </section>

    <HHSearchTextSection :form="searchForm" :cozy-filled-keys="cozyFilledFieldsList" />
    <HHSearchDemographicsSection :form="searchForm" :cozy-filled-keys="cozyFilledFieldsList" />
    <HHSearchGeoSection
      v-model:suggest-areas-query="suggestAreasQuery"
      :form="searchForm"
      :cozy-filled-keys="cozyFilledFieldsList"
      :areas-options="areasOptions"
      :suggest-areas-results="suggestAreasResults"
      :suggest-areas-loading="suggestAreasLoading"
      @suggest-areas-input="onSuggestAreasInput"
      @add-area="addAreaFromSuggest"
    />
    <HHSearchDatesSection :form="searchForm" :has-conflict="!!periodDateConflict" />
    <HHSearchEducationExperienceSection :form="searchForm" :cozy-filled-keys="cozyFilledFieldsList" />
    <HHSearchConditionsSkillsSection
      v-model:suggest-skills-query="suggestSkillsQuery"
      :form="searchForm"
      :cozy-filled-keys="cozyFilledFieldsList"
      :skills-options="skillsOptions"
      :languages-options="languagesOptions"
      :suggest-skills-results="suggestSkillsResults"
      :suggest-skills-loading="suggestSkillsLoading"
      @suggest-skills-input="onSuggestSkillsInput"
      @add-skill="addSkillFromSuggest"
    />
    <HHSearchSalarySection :form="searchForm" :cozy-filled-keys="cozyFilledFieldsList" />
    <HHSearchRoleStatusSection
      :form="searchForm"
      :professional-roles-options="professionalRolesOptions"
    />
    <HHSearchSimilarSection :form="searchForm" />
    <HHSearchFoldersSection :form="searchForm" :has-conflict="!!folderConflict" />
    <HHSearchSortingSection :form="searchForm" />
  </div>
</template>

<style>
@import "../components/ui/fields/fields.css";

.hhsearch-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.form-section {
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.grid {
  display: grid;
  gap: 12px;
}
.grid.two {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}
.grid.three {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
.grid.four {
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.text-queries {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.text-query-row {
  display: flex;
}

.btn {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.btn:hover {
  border-color: rgba(255, 255, 255, 0.35);
}
.btn.primary {
  background: #646cff;
  border-color: #646cff;
  color: #fff;
}
.btn.primary:hover {
  background: #535bf2;
}
.btn.ghost {
  background: transparent;
}

.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

.textarea {
  width: 100%;
  resize: vertical;
}

.hint.warning {
  color: #e2a500;
  font-size: 0.9rem;
  margin: 0;
}

.checkbox-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.session-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.execute-summary {
  font-size: 0.95rem;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.link-session-items {
  color: #646cff;
  text-decoration: underline;
}
.link-session-items:hover {
  color: #8b92ff;
}

/* Подсветка полей, заполненных из Cozy */
.field-cozy-highlight {
  position: relative;
  display: inline-flex;
  align-items: flex-start;
  gap: 6px;
}
.field-cozy-highlight .field-wrapper,
.field-cozy-highlight :deep(.field-wrapper) {
  border: 1px solid #3b82f6;
  border-radius: 8px;
  padding: 4px;
  background: rgba(59, 130, 246, 0.06);
}
.field-cozy-highlight .cozy-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: #3b82f6;
  margin-top: 0.5rem;
}
.field-cozy-highlight .cozy-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* синий #3b82f6 при SVG как img */
  filter: brightness(0) saturate(100%) invert(39%) sepia(90%) saturate(2000%) hue-rotate(202deg) brightness(98%) contrast(101%);
}
</style>

