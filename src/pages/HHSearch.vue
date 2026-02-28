<script setup lang="ts">
import { reactive, computed, ref, onMounted, watch } from "vue";
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
  AdvancedSearchFiltersDTO,
  SearchEnrichResponse,
  TextQueryItem,
  RemainingQuotaResponse,
  EnrichedDataDTO,
  LanguageDTO,
  TextQueryField,
  TextQueryLogic,
  TextQueryPeriod,
} from "../types";

type MaybeString = string | null;
type MaybeNumber = number | null;

/** Иерархическая структура отраслей: родитель + подотрасли. */
interface IndustryGroup {
  id: string;
  name: string;
  industries: { id: string; name: string }[];
}

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
  country: "113" as string, // Россия по умолчанию
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
  getSession,
  loading: sessionLoading,
  error: sessionError,
} = useSearchSessions();

const ACTIVE_SESSION_KEY = "hh-search-active-session";

function saveActiveSession(sessionId: string, teamId: string, mode: string) {
  try {
    sessionStorage.setItem(
      ACTIVE_SESSION_KEY,
      JSON.stringify({ session_id: sessionId, team_id: teamId, mode })
    );
  } catch {
    // ignore
  }
}

function clearActiveSession() {
  try {
    sessionStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {
    // ignore
  }
}

async function restoreActiveSession() {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(ACTIVE_SESSION_KEY);
  } catch {
    return;
  }
  if (!raw) return;
  let data: { session_id?: string; team_id?: string; mode?: string };
  try {
    data = JSON.parse(raw);
  } catch {
    return;
  }
  const sessionId = data?.session_id;
  if (!sessionId || typeof sessionId !== "string") return;
  try {
    const session = await getSession(sessionId, true);
    const s = session as {
      id?: string;
      team_id?: string;
      mode?: string;
      status?: string;
      query_enriched?: Record<string, unknown> | null;
      results?: unknown[];
    };
    selectedTeamId.value = s.team_id ?? data.team_id ?? "";
    searchMode.value = (s.mode === "vacancies" ? "vacancies" : "resumes") as "resumes" | "vacancies";
    enrichResult.value = {
      session_id: s.id ?? sessionId,
      enriched_filters: (s.query_enriched && typeof s.query_enriched === "object")
        ? (s.query_enriched as EnrichedDataDTO)
        : {},
      diff: {},
    };
    if (s.status === "executed" && Array.isArray(s.results) && s.results.length > 0) {
      const result = await executeSession(sessionId, { page: 0 });
      executeResult.value = result;
      if (selectedTeamId.value) getRemaining(selectedTeamId.value);
    }
  } catch {
    clearActiveSession();
  }
}

const { remaining, getRemaining, loading: quotaLoading, error: quotaError } = useQuota();

const {
  getAreas,
  getProfessionalRoles,
  getIndustries,
  getLanguages,
  suggestAreas,
  suggestAreaLeaves,
  suggestPositions,
  suggestSkills,
  suggestEducationalInstitutions,
} = useStatics();

/** Опции для селектов (значение/подпись). */
function normOpt(item: unknown): { value: string; label: string } {
  if (item == null) return { value: "", label: "" };
  const o = item as Record<string, unknown>;
  const val = o.id ?? o.value ?? "";
  const label = (o.name ?? o.label ?? o.text ?? String(val)) as string;
  return { value: String(val), label };
}

const countriesOptions = ref<{ value: string; label: string }[]>([]);
const professionalRolesOptions = ref<{ value: string; label: string }[]>([]);
const skillsOptions = ref<{ value: string; label: string }[]>([]);
const industriesData = ref<IndustryGroup[]>([]);
const languagesOptions = ref<{ value: string; label: string }[]>([]);

const suggestCitiesQuery = ref("");
const suggestCitiesResults = ref<{ value: string; label: string }[]>([]);
const suggestCitiesLoading = ref(false);
const areaLabels = ref<Record<string, string>>({});
const suggestSkillsQuery = ref("");
const suggestSkillsResults = ref<{ value: string; label: string }[]>([]);
const suggestSkillsLoading = ref(false);
const skillLabels = ref<Record<string, string>>({});
const suggestEduQuery = ref("");
const suggestEduResults = ref<{ value: string; label: string }[]>([]);
const suggestEduLoading = ref(false);
const suggestRolesQuery = ref("");

const selectedTeamId = ref<string>("");
watch(selectedTeamId, (id) => {
  if (id) getRemaining(id);
}, { immediate: true });
const searchMode = ref<"resumes" | "vacancies">("resumes");
const searchVariant = ref<"cozy" | "form">("form");
watch(searchVariant, () => {
  enrichResult.value = null;
  executeResult.value = null;
});
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
  "everywhere", "title", "education", "experience",
  "experience_company", "experience_position", "experience_description", "skills",
];
const VALID_LOGIC: TextQueryLogic[] = ["all", "any", "phrase", "except"];
const VALID_PERIOD: TextQueryPeriod[] = [
  "all_time", "last_year", "last_three_years", "last_six_years",
];
/** Поля «должность/опыт»: при наличии таких text_queries добавляем условие по title (желаемая должность). */
const EXPERIENCE_POSITION_FIELDS = new Set<TextQueryField>([
  "experience_position",
  "experience",
  "experience_company",
  "experience_description",
]);

function applyEnrichedToForm(enriched: EnrichedDataDTO) {
  cozyFilledFields.value = new Set();

  if (enriched.keywords_include?.length) {
    searchForm.positivePrompt = enriched.keywords_include.join(", ");
    cozyFilledFields.value.add("positivePrompt");
  }
  if (enriched.keywords_exclude?.length) {
    searchForm.negativePrompt = enriched.keywords_exclude.join(", ");
    cozyFilledFields.value.add("negativePrompt");
  }

  if (enriched.text_queries?.length) {
    const mapped: TextQueryItem[] = enriched.text_queries.map((tq) => {
      const rawField = (tq.field ?? "everywhere") as string;
      const field = (VALID_FIELDS.includes(rawField as TextQueryField)
        ? rawField
        : rawField === "keywords"
          ? "skills"
          : "everywhere") as TextQueryField;
      const logic = (VALID_LOGIC.includes((tq.logic ?? "all") as TextQueryLogic)
        ? (tq.logic ?? "all")
        : "all") as TextQueryLogic;
      const period = (VALID_PERIOD.includes((tq.period ?? "all_time") as TextQueryPeriod)
        ? (tq.period ?? "all_time")
        : "all_time") as TextQueryPeriod;
      return {
        text: tq.text ?? "",
        logic,
        field,
        period,
      };
    });
    const positionQueries = mapped.filter(
      (q) => (q.text ?? "").trim() !== "" && EXPERIENCE_POSITION_FIELDS.has(q.field)
    );
    const uniquePositionTexts = [...new Set(positionQueries.map((q) => q.text.trim()))];
    if (uniquePositionTexts.length > 0) {
      mapped.push({
        field: "title",
        logic: "any",
        text: uniquePositionTexts.join(" "),
        period: "all_time",
      });
    }
    searchForm.textQueries = mapped.length > 0 ? mapped : [defaultTextQueryItem()];
    cozyFilledFields.value.add("textQueries");
  } else if (enriched.text_search?.query) {
    const ts = enriched.text_search;
    const fieldVal = ts.field?.[0] as string | undefined;
    const field = (VALID_FIELDS.includes((fieldVal ?? "") as TextQueryField)
      ? fieldVal
      : fieldVal === "keywords"
        ? "skills"
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
      const id = String(enriched.location.area_id);
      searchForm.areas = [id];
      if (enriched.location.area_name) {
        areaLabels.value = { ...areaLabels.value, [id]: enriched.location.area_name };
      }
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
  if (enriched.languages?.length) {
    searchForm.languages = enriched.languages.map((l) =>
      l.level ? `${l.id}.${l.level}` : l.id
    );
    cozyFilledFields.value.add("languages");
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
  const [areas, roles, industries, languages] = await Promise.all([
    loadOne(getAreas),
    loadOne(getProfessionalRoles),
    loadOne(getIndustries),
    loadOne(getLanguages),
  ]);
  // Страны: верхний уровень дерева регионов (HH API) или весь список
  const areasArr = areas as unknown[];
  countriesOptions.value = areasArr.map(normOpt).filter((o) => o.value !== "");
  professionalRolesOptions.value = (roles as unknown[]).map(normOpt).filter((o) => o.value !== "");
  skillsOptions.value = []; // не загружаем: GET /v1/static/skills даёт 502, навыки — через suggest
  const industriesArr = industries as Array<{ id?: string; name?: string; industries?: { id?: string; name?: string }[] }>;
  industriesData.value = Array.isArray(industriesArr)
    ? industriesArr
        .filter((p) => p?.id != null && p?.name != null)
        .map((p) => ({
          id: String(p.id),
          name: String(p.name),
          industries: Array.isArray(p.industries)
            ? p.industries
                .filter((s) => s?.id != null && s?.name != null)
                .map((s) => ({ id: String(s.id), name: String(s.name) }))
            : [],
        }))
    : [];
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

let suggestCitiesTimer: ReturnType<typeof setTimeout> | null = null;
async function fetchSuggestCities() {
  const q = suggestCitiesQuery.value.trim();
  if (q.length < 2) {
    suggestCitiesResults.value = [];
    return;
  }
  suggestCitiesLoading.value = true;
  try {
    const countryId = searchForm.country || "113";
    const data = await suggestAreaLeaves(q, countryId);
    suggestCitiesResults.value = normalizeSuggestResponse(data);
  } catch {
    suggestCitiesResults.value = [];
  } finally {
    suggestCitiesLoading.value = false;
  }
}

function onSuggestCitiesInput() {
  if (suggestCitiesTimer) clearTimeout(suggestCitiesTimer);
  suggestCitiesTimer = setTimeout(fetchSuggestCities, 300);
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

function addCityFromSuggest(opt: { value: string; label: string }) {
  if (!searchForm.areas.includes(opt.value)) {
    searchForm.areas = [...searchForm.areas, opt.value];
    areaLabels.value = { ...areaLabels.value, [opt.value]: opt.label };
  }
}

function addSkillFromSuggest(opt: { value: string; label: string }) {
  if (!searchForm.skills.includes(opt.value)) {
    searchForm.skills = [...searchForm.skills, opt.value];
    skillLabels.value = { ...skillLabels.value, [opt.value]: opt.label };
  }
}

function addRoleFromSuggest(opt: { value: string; label: string }) {
  if (!searchForm.professionalRole.includes(opt.value)) {
    searchForm.professionalRole = [...searchForm.professionalRole, opt.value];
  }
}

let suggestEduTimer: ReturnType<typeof setTimeout> | null = null;
async function fetchSuggestEdu() {
  const q = suggestEduQuery.value.trim();
  if (q.length < 2) {
    suggestEduResults.value = [];
    return;
  }
  suggestEduLoading.value = true;
  try {
    const data = await suggestEducationalInstitutions(q);
    suggestEduResults.value = normalizeSuggestResponse(data);
  } catch {
    suggestEduResults.value = [];
  } finally {
    suggestEduLoading.value = false;
  }
}

function onSuggestEduInput() {
  if (suggestEduTimer) clearTimeout(suggestEduTimer);
  suggestEduTimer = setTimeout(fetchSuggestEdu, 300);
}

function addEduFromSuggest(opt: { value: string; label: string }) {
  const arr = searchForm.educationalInstitution as string[];
  if (!arr.includes(opt.value)) {
    searchForm.educationalInstitution = [...arr, opt.value];
  }
}

onMounted(async () => {
  fetchTeams();
  loadDictionaries();
  await restoreActiveSession();
});

/** Преобразует значение формы (строка с запятыми или массив) в number[]. */
function toIntArray(val: unknown): number[] {
  if (Array.isArray(val)) {
    return val.map((x) => parseInt(String(x), 10)).filter((n) => !Number.isNaN(n));
  }
  if (typeof val === "string" && val.trim()) {
    return val
      .split(",")
      .map((x) => parseInt(x.trim(), 10))
      .filter((n) => !Number.isNaN(n));
  }
  return [];
}

/** Преобразует значение формы в number[] ТОЛЬКО если элементы выглядят как числовые ID. */
function toIntArrayOnlyNumericIds(val: unknown): number[] {
  if (Array.isArray(val)) {
    const asStrings = val.map((x) => String(x).trim());
    if (!asStrings.length) return [];
    // Разрешаем только элементы, которые являются строками из цифр (ID из справочников HH).
    if (!asStrings.every((s) => /^\d+$/.test(s))) return [];
    return asStrings.map((s) => parseInt(s, 10));
  }
  if (typeof val === "string" && val.trim()) {
    const parts = val
      .split(",")
      .map((x) => x.trim())
      .filter((x) => x.length > 0);
    if (!parts.length) return [];
    if (!parts.every((s) => /^\d+$/.test(s))) return [];
    return parts.map((s) => parseInt(s, 10));
  }
  return [];
}

/** Преобразует languages формы (строки "id.level") в LanguageDTO[]. */
function toLanguageDTOList(val: unknown): LanguageDTO[] {
  if (!Array.isArray(val)) return [];
  return val
    .map((s) => {
      const str = String(s).trim();
      if (!str) return null;
      const dot = str.indexOf(".");
      if (dot >= 0) {
        return { id: str.slice(0, dot), level: str.slice(dot + 1) || undefined };
      }
      return { id: str };
    })
    .filter((l): l is LanguageDTO => l != null && !!l.id);
}

function buildFilters(): AdvancedSearchFiltersDTO {
  const textQueries = searchForm.textQueries
    ?.filter((q) => (q.text ?? "").trim() !== "")
    .map((q) => {
      const field = ((q.field as string) === "keywords" ? "skills" : q.field) ?? null;
      return {
        text: q.text.trim(),
        logic: q.logic ?? null,
        field,
        period: q.period ?? null,
      };
    });
  return {
    ...(textQueries?.length ? { textQueries } : {}),
    ...(searchForm.textCompanySize != null && searchForm.textCompanySize !== ""
      ? { textCompanySize: searchForm.textCompanySize }
      : {}),
    ...(searchForm.textIndustry != null && searchForm.textIndustry !== ""
      ? { textIndustry: searchForm.textIndustry }
      : {}),
    ...(searchForm.byTextPrefix ? { byTextPrefix: true } : {}),
    ageFrom: searchForm.ageFrom ?? undefined,
    ageTo: searchForm.ageTo ?? undefined,
    ...(searchForm.gender != null && searchForm.gender !== ""
      ? { gender: searchForm.gender }
      : {}),
    ...(searchForm.labels?.length ? { labels: searchForm.labels } : {}),
    areas: toIntArray(searchForm.areas).length ? toIntArray(searchForm.areas) : undefined,
    ...(searchForm.relocation != null && searchForm.relocation !== ""
      ? { relocation: searchForm.relocation }
      : {}),
    metro: toIntArray(searchForm.metro).length ? toIntArray(searchForm.metro) : undefined,
    ...(searchForm.district != null && searchForm.district !== ""
      ? { district: searchForm.district }
      : {}),
    citizenship: toIntArray(searchForm.citizenship).length
      ? toIntArray(searchForm.citizenship)
      : undefined,
    workTicket: toIntArray(searchForm.workTicket).length
      ? toIntArray(searchForm.workTicket)
      : undefined,
    ...(searchForm.businessTripReadiness?.length
      ? { businessTripReadiness: searchForm.businessTripReadiness }
      : {}),
    period: searchForm.period ?? undefined,
    ...(searchForm.dateFrom != null && searchForm.dateFrom !== ""
      ? { dateFrom: searchForm.dateFrom }
      : {}),
    ...(searchForm.dateTo != null && searchForm.dateTo !== ""
      ? { dateTo: searchForm.dateTo }
      : {}),
    ...(searchForm.educationLevels?.length
      ? { educationLevels: searchForm.educationLevels }
      : {}),
    educationalInstitution: toIntArray(searchForm.educationalInstitution).length
      ? toIntArray(searchForm.educationalInstitution)
      : undefined,
    ...(searchForm.experience?.length ? { experience: searchForm.experience } : {}),
    filterExpIndustry: toIntArray(searchForm.filterExpIndustry).length
      ? toIntArray(searchForm.filterExpIndustry)
      : undefined,
    ...(searchForm.filterExpPeriod != null && searchForm.filterExpPeriod !== ""
      ? { filterExpPeriod: searchForm.filterExpPeriod }
      : {}),
    ...(searchForm.employment?.length ? { employment: searchForm.employment } : {}),
    ...(searchForm.schedule?.length ? { schedule: searchForm.schedule } : {}),
    skills:
      toIntArrayOnlyNumericIds(searchForm.skills).length > 0
        ? toIntArrayOnlyNumericIds(searchForm.skills)
        : undefined,
    languages:
      toLanguageDTOList(searchForm.languages).length > 0
        ? toLanguageDTOList(searchForm.languages)
        : undefined,
    ...(searchForm.driverLicenseTypes?.length
      ? { driverLicenseTypes: searchForm.driverLicenseTypes }
      : {}),
    currency: searchForm.currency ?? undefined,
    salaryFrom: searchForm.salaryFrom ?? undefined,
    salaryTo: searchForm.salaryTo ?? undefined,
    professionalRole:
      toIntArrayOnlyNumericIds(searchForm.professionalRole).length > 0
        ? toIntArrayOnlyNumericIds(searchForm.professionalRole)
        : undefined,
    ...(searchForm.jobSearchStatus?.length
      ? { jobSearchStatus: searchForm.jobSearchStatus }
      : {}),
    withJobSearchStatus: searchForm.withJobSearchStatus || undefined,
    ...(searchForm.vacancyId != null && searchForm.vacancyId !== ""
      ? { vacancyId: searchForm.vacancyId }
      : {}),
    ...(searchForm.resumeSimilar != null && searchForm.resumeSimilar !== ""
      ? { resumeSimilar: searchForm.resumeSimilar }
      : {}),
    searchInResponses: searchForm.searchInResponses || undefined,
    ...(searchForm.searchByVacancyId != null && searchForm.searchByVacancyId !== ""
      ? { searchByVacancyId: searchForm.searchByVacancyId }
      : {}),
    ...(searchForm.folders?.length ? { folders: searchForm.folders } : {}),
    includeAllFolders: searchForm.includeAllFolders || undefined,
    ...(searchForm.savedSearchId != null && searchForm.savedSearchId !== ""
      ? { savedSearchId: searchForm.savedSearchId }
      : {}),
    ...(searchForm.orderBy != null && searchForm.orderBy !== ""
      ? { orderBy: searchForm.orderBy }
      : {}),
    page: searchForm.page ?? undefined,
    perPage: searchForm.perPage ?? undefined,
  };
}

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
  clearActiveSession();
  enrichResult.value = null;
  executeResult.value = null;
  try {
    const filters = buildFilters();
    const hasFilters = Object.values(filters).some(
      (v) =>
        v !== undefined &&
        v !== null &&
        (typeof v !== "object" || !Array.isArray(v) || (v as unknown[]).length > 0)
    );
    const payload: import("../types").SearchCreateRequest = {
      team_id: selectedTeamId.value,
      mode: searchMode.value,
      searchType: hasFilters ? "advanced" : "simple",
      queryRaw: buildQueryRaw(),
      filters: hasFilters ? filters : null,
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
      saveActiveSession(sessionId, selectedTeamId.value, searchMode.value);
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

function hasAnyFilters(filters: AdvancedSearchFiltersDTO): boolean {
  return Object.values(filters).some(
    (v) =>
      v !== undefined &&
      v !== null &&
      (typeof v !== "object" || !Array.isArray(v) || (v as unknown[]).length > 0)
  );
}

async function createSessionDirect() {
  sessionError.value = null;
  if (!selectedTeamId.value) {
    sessionError.value = new Error("Выберите команду");
    return;
  }
  const filters = buildFilters();
  if (!hasAnyFilters(filters)) {
    sessionError.value = new Error("Заполните хотя бы одно поле формы");
    return;
  }
  await getRemaining(selectedTeamId.value);
  if (quotaInfo.value && !quotaInfo.value.can_make_request) {
    sessionError.value = new Error(
      "Недостаточно квоты для выполнения поиска. Обратитесь к администратору команды."
    );
    return;
  }
  clearActiveSession();
  enrichResult.value = null;
  executeResult.value = null;
  try {
    const payload: import("../types").SearchCreateRequest = {
      team_id: selectedTeamId.value,
      mode: searchMode.value,
      searchType: "advanced",
      queryRaw: { query: "" },
      filters,
    };
    const data = await createSession(payload);
    const sessionId = (data as { session_id?: string; id?: string }).session_id ?? (data as { id?: string }).id;
    if (sessionId) {
      enrichResult.value = {
        session_id: sessionId,
        enriched_filters: {},
        diff: {},
      };
      saveActiveSession(sessionId, selectedTeamId.value, searchMode.value);
    }
  } catch {
    // error already in sessionError
  }
}

async function confirmApprove() {
  if (!enrichResult.value?.session_id) return;
  try {
    const filters = buildFilters();
    const hh_request =
      Object.keys(filters).length > 0 ? (filters as Record<string, unknown>) : undefined;
    await approveSession(enrichResult.value.session_id, {
      ...(hh_request ? { hh_request } : {}),
    });
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
    if (selectedTeamId.value) getRemaining(selectedTeamId.value);
  } catch {
    // error in sessionError
  }
}

async function goToExecutePage(page: number) {
  if (!enrichResult.value?.session_id || !executeResult.value) return;
  if (page < 0 || page >= executeResult.value.pages) return;
  try {
    const result = await executeSession(enrichResult.value.session_id, { page });
    executeResult.value = result;
    if (selectedTeamId.value) getRemaining(selectedTeamId.value);
  } catch {
    // error in sessionError
  }
}

function formatSalary(
  salary: { amount?: number | null; from?: number | null; to?: number | null; currency?: string | null } | null | undefined
): string {
  if (!salary) return "—";
  const parts: string[] = [];
  if (typeof (salary as { amount?: number }).amount === "number") {
    parts.push(String((salary as { amount: number }).amount));
  } else if (salary.from != null || salary.to != null) {
    if (salary.from != null && salary.to != null) parts.push(`${salary.from} – ${salary.to}`);
    else if (salary.from != null) parts.push(String(salary.from));
    else if (salary.to != null) parts.push(String(salary.to));
  }
  if (salary.currency) parts.push(salary.currency);
  return parts.length ? parts.join(" ") : "—";
}

function getItemArea(item: import("../types").HHExecuteItem): string {
  const area = (item as { area?: { name?: string | null } | null }).area;
  return area?.name ?? "—";
}

function getResumeExperienceMeta(item: { experience?: Array<{ position?: string; company?: string }> }): string {
  const exp = item.experience;
  if (!Array.isArray(exp) || exp.length === 0) return "";
  const first = exp[0];
  const pos = first?.position;
  const company = first?.company;
  if (pos && company) return `${pos} в ${company}`;
  return pos ?? company ?? "";
}

function exportJson() {
  // Экспортируем тот же payload, который уходит в createSessionWithEnrich,
  // чтобы структура совпадала с SearchCreateRequest и примером hh-search-params.
  const filters = buildFilters();
  const hasFilters = Object.values(filters).some(
    (v) =>
      v !== undefined &&
      v !== null &&
      (typeof v !== "object" || !Array.isArray(v) || (v as unknown[]).length > 0),
  );
  const prompts = getPrompts();
  const payload: import("../types").SearchCreateRequest = {
    team_id: selectedTeamId.value || "",
    mode: searchMode.value,
    searchType: hasFilters ? "advanced" : "simple",
    queryRaw: buildQueryRaw(),
    filters: hasFilters ? filters : null,
    ...(prompts ? { prompts } : {}),
  };
  const dataStr = JSON.stringify(payload, null, 2);
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
      <h1>{{ searchMode === 'vacancies' ? 'Поиск вакансий (HH)' : 'Поиск резюме (HH)' }}</h1>
      <div class="header-actions">
        <router-link :to="{ name: 'SessionList' }" class="btn secondary">
          Поисковые сессии
        </router-link>
        <button type="button" class="btn primary" @click="exportJson">
          Экспорт JSON
        </button>
      </div>
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
        <div class="field-wrapper">
          <span class="field-label">Вариант поиска</span>
          <div class="checkbox-group">
            <label class="checkbox">
              <input v-model="searchVariant" type="radio" value="cozy" />
              С промптом AI
            </label>
            <label class="checkbox">
              <input v-model="searchVariant" type="radio" value="form" />
              По заполненной форме
            </label>
          </div>
        </div>
      </div>

      <div v-if="selectedTeamId" class="quota-block field-wrapper">
        <span class="field-label">Квота запросов API HH</span>
        <div v-if="quotaLoading" class="hint">Загрузка квоты…</div>
        <p v-else-if="quotaError" class="hint warning">
          {{ quotaError instanceof Error ? quotaError.message : String(quotaError) }}
        </p>
        <template v-else-if="quotaInfo">
          <template v-if="!quotaInfo.has_limits">
            <span class="hint">Лимиты квот для команды не заданы.</span>
          </template>
          <template v-else>
            <div class="quota-stats">
              <span v-if="quotaInfo.hour">
                За час: использовано {{ quotaInfo.hour.used }} из {{ quotaInfo.hour.limit }} (осталось {{ quotaInfo.hour.remaining }}).
              </span>
              <span v-if="quotaInfo.day">
                За день: использовано {{ quotaInfo.day.used }} из {{ quotaInfo.day.limit }} (осталось {{ quotaInfo.day.remaining }}).
              </span>
            </div>
            <p v-if="!quotaInfo.can_make_request" class="hint warning">
              Недостаточно квоты для выполнения поиска. Обратитесь к администратору команды.
            </p>
          </template>
        </template>
      </div>
      <p v-else class="hint">Выберите команду для отображения квоты.</p>

      <HHSearchPromptsSection
        v-if="searchVariant === 'cozy'"
        :form="searchForm"
        :cozy-filled-keys="cozyFilledFieldsList"
      />
      <p v-if="sessionError" class="hint warning">
        {{ sessionError instanceof Error ? sessionError.message : String(sessionError) }}
      </p>
      <button
        v-if="searchVariant === 'cozy'"
        type="button"
        class="btn primary"
        :disabled="sessionLoading || !selectedTeamId"
        @click="createSessionWithEnrich"
      >
        {{ sessionLoading ? "Отправка…" : "Отправить в Cozy AI и заполнить форму" }}
      </button>
      <button
        v-if="searchVariant === 'form'"
        type="button"
        class="btn primary"
        :disabled="sessionLoading || !selectedTeamId"
        @click="createSessionDirect"
      >
        {{ sessionLoading ? "Создание…" : "Создать сессию поиска" }}
      </button>

      <template v-if="enrichResult">
        <HHSearchEnrichedResult
          v-if="searchVariant === 'cozy'"
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
            {{ searchVariant === 'cozy' ? 'Подтвердить сессию' : 'Подтвердить' }}
          </button>
          <button
            type="button"
            class="btn primary"
            :disabled="sessionLoading"
            @click="confirmExecute"
          >
            {{ searchVariant === 'cozy' ? 'Выполнить поиск' : 'Реализовать запрос к HH' }}
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
          <span v-if="enrichResult?.session_id" class="execute-summary-hint">
            Сохранённые элементы сессии (избранное, скрытие).
          </span>
        </div>
      </template>
    </section>

    <section v-if="executeResult" class="form-section results-section">
      <h2 class="results-heading">Результаты поиска</h2>
      <div v-if="executeResult.items.length === 0" class="results-empty">
        Нет результатов на этой странице.
      </div>
      <ul v-else class="results-list">
        <li
          v-for="(item, idx) in executeResult.items"
          :key="(item as { id?: string | number }).id ?? idx"
          class="result-card"
        >
          <template v-if="searchMode === 'resumes'">
            <div class="result-card-title">{{ (item as { title?: string }).title ?? "—" }}</div>
            <div class="result-card-meta">
              {{ [
                "Возраст: " + ((item as { age?: number }).age ?? "—"),
                getItemArea(item),
                getResumeExperienceMeta(item as { experience?: Array<{ position?: string; company?: string }> })
              ].filter(Boolean).join(" · ") }}
            </div>
            <div class="result-card-salary">
              {{ formatSalary((item as { salary?: { amount?: number; from?: number; to?: number; currency?: string } }).salary) }}
            </div>
          </template>
          <template v-else>
            <div class="result-card-title">{{ (item as { name?: string }).name ?? "—" }}</div>
            <div class="result-card-meta">
              {{ (item as { employer?: { name?: string } }).employer?.name ?? "—" }} · {{ getItemArea(item) }}
            </div>
            <div class="result-card-salary">
              {{ formatSalary((item as { salary?: { from?: number; to?: number; currency?: string } }).salary) }}
            </div>
          </template>
          <a
            v-if="(item as { alternate_url?: string }).alternate_url"
            :href="(item as { alternate_url: string }).alternate_url"
            target="_blank"
            rel="noopener noreferrer"
            class="result-card-link"
          >
            Открыть на HH
          </a>
        </li>
      </ul>
      <div v-if="executeResult.pages > 1" class="results-pagination">
        <button
          type="button"
          class="btn small"
          :disabled="executeResult.page <= 0"
          @click="goToExecutePage(executeResult.page - 1)"
        >
          Назад
        </button>
        <span class="results-page-num">
          Страница {{ executeResult.page + 1 }} из {{ executeResult.pages }}
        </span>
        <button
          type="button"
          class="btn small"
          :disabled="executeResult.page >= executeResult.pages - 1"
          @click="goToExecutePage(executeResult.page + 1)"
        >
          Вперёд
        </button>
      </div>
    </section>

    <HHSearchTextSection
      :form="searchForm"
      :cozy-filled-keys="cozyFilledFieldsList"
      :industries-data="industriesData"
    />
    <HHSearchDemographicsSection :form="searchForm" :cozy-filled-keys="cozyFilledFieldsList" />
    <HHSearchGeoSection
      v-model:suggest-cities-query="suggestCitiesQuery"
      :form="searchForm"
      :cozy-filled-keys="cozyFilledFieldsList"
      :countries-options="countriesOptions"
      :suggest-cities-results="suggestCitiesResults"
      :suggest-cities-loading="suggestCitiesLoading"
      :area-labels="areaLabels"
      @suggest-cities-input="onSuggestCitiesInput"
      @add-city="addCityFromSuggest"
    />
    <HHSearchDatesSection :form="searchForm" :has-conflict="!!periodDateConflict" />
    <HHSearchEducationExperienceSection
      :form="searchForm"
      :cozy-filled-keys="cozyFilledFieldsList"
      :suggest-edu-query="suggestEduQuery"
      :suggest-edu-results="suggestEduResults"
      :suggest-edu-loading="suggestEduLoading"
      @update:suggest-edu-query="suggestEduQuery = $event"
      @suggest-edu-input="onSuggestEduInput"
      @add-edu="addEduFromSuggest"
    />
    <HHSearchConditionsSkillsSection
      v-model:suggest-skills-query="suggestSkillsQuery"
      :form="searchForm"
      :cozy-filled-keys="cozyFilledFieldsList"
      :skills-options="skillsOptions"
      :languages-options="languagesOptions"
      :suggest-skills-results="suggestSkillsResults"
      :suggest-skills-loading="suggestSkillsLoading"
      :skill-labels="skillLabels"
      @suggest-skills-input="onSuggestSkillsInput"
      @add-skill="addSkillFromSuggest"
    />
    <HHSearchSalarySection :form="searchForm" :cozy-filled-keys="cozyFilledFieldsList" />
    <HHSearchRoleStatusSection
      :form="searchForm"
      :professional-roles-options="professionalRolesOptions"
      v-model:suggest-roles-query="suggestRolesQuery"
      @add-role="addRoleFromSuggest"
    />
    <!-- <HHSearchSimilarSection :form="searchForm" />
    <HHSearchFoldersSection :form="searchForm" :has-conflict="!!folderConflict" />
    <HHSearchSortingSection :form="searchForm" /> -->
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
.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}
.btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.form-section {
  padding: 12px;
  border: 1px solid rgb(255, 255, 255);
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

.quota-block {
  margin: 0;
}
.quota-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
.execute-summary-hint {
  font-size: 0.9rem;
  opacity: 0.75;
}

.results-section {
  margin-top: 0.5rem;
}
.results-heading {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
}
.results-empty {
  padding: 1rem;
  text-align: center;
  opacity: 0.9;
}
.results-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.result-card {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.result-card-title {
  font-weight: 600;
  font-size: 1rem;
}
.result-card-meta,
.result-card-salary {
  font-size: 0.9rem;
  opacity: 0.9;
}
.result-card-link {
  margin-top: 0.25rem;
  font-size: 0.9rem;
}
.results-pagination {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}
.results-page-num {
  font-size: 0.95rem;
  opacity: 0.9;
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
  color: #5af63b;
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

