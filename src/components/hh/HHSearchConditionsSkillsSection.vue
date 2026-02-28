<script setup lang="ts">
import { computed, ref } from "vue";
import TextInputField from "../ui/fields/text/TextInputField.vue";
import MultiSelectField from "../ui/fields/select/MultiSelectField.vue";
import TagsAutocompleteField from "../ui/fields/tags/TagsAutocompleteField.vue";
import { EMPLOYMENT, SCHEDULE, DRIVER_LICENSE_TYPES } from "../../constants/hhDictionaries";

const props = withDefaults(
  defineProps<{
    form: Record<string, unknown>;
    cozyFilledKeys?: string[];
    skillsOptions?: { value: string; label: string }[];
    languagesOptions?: { value: string; label: string }[];
    suggestSkillsQuery?: string;
    suggestSkillsResults?: { value: string; label: string }[];
    suggestSkillsLoading?: boolean;
    skillLabels?: Record<string, string>;
  }>(),
  {
    skillsOptions: () => [],
    languagesOptions: () => [],
    suggestSkillsQuery: "",
    suggestSkillsResults: () => [],
    suggestSkillsLoading: false,
    skillLabels: () => ({}),
  }
);

const emit = defineEmits<{
  "update:suggestSkillsQuery": [value: string];
  suggestSkillsInput: [];
  addSkill: [opt: { value: string; label: string }];
}>();

const employment = computed({
  get: () => (props.form.employment as string[]) ?? [],
  set: (v: string[]) => {
    props.form.employment = v;
  },
});

const schedule = computed({
  get: () => (props.form.schedule as string[]) ?? [],
  set: (v: string[]) => {
    props.form.schedule = v;
  },
});

const skills = computed({
  get: () => (props.form.skills as string[]) ?? [],
  set: (v: string[]) => {
    props.form.skills = v;
  },
});

const skillsLabelsMap = computed(() => {
  const map: Record<string, string> = { ...(props.skillLabels ?? {}) };
  for (const o of props.skillsOptions ?? []) {
    if (!map[o.value]) map[o.value] = o.label;
  }
  for (const o of props.suggestSkillsResults ?? []) {
    if (!map[o.value]) map[o.value] = o.label;
  }
  return map;
});

const languages = computed({
  get: () => (props.form.languages as string[]) ?? [],
  set: (v: string[]) => {
    props.form.languages = v;
  },
});

const driverLicenseTypes = computed({
  get: () => (props.form.driverLicenseTypes as string[]) ?? [],
  set: (v: string[]) => {
    props.form.driverLicenseTypes = v;
  },
});

const driverLicenseQuery = ref("");

const driverLicenseLabelsMap = computed(() =>
  Object.fromEntries(DRIVER_LICENSE_TYPES.map((o) => [o.value, o.label]))
);

const driverLicenseSuggestions = computed(() => {
  const q = driverLicenseQuery.value.trim().toLowerCase();
  if (q.length < 1) return [];
  return DRIVER_LICENSE_TYPES.filter(
    (o) =>
      o.label.toLowerCase().includes(q) ||
      o.value.toLowerCase().includes(q)
  );
});

function addDriverLicense(opt: { value: string; label: string }) {
  if (!driverLicenseTypes.value.includes(opt.value)) {
    driverLicenseTypes.value = [...driverLicenseTypes.value, opt.value];
  }
}

const suggestLanguagesQuery = ref("");
const suggestLanguagesLoading = ref(false);

const suggestLanguagesResults = computed(() => {
  const q = suggestLanguagesQuery.value.trim().toLowerCase();
  if (q.length < 1) return [];
  return (props.languagesOptions ?? []).filter(
    (o) =>
      o.label.toLowerCase().includes(q) ||
      o.value.toLowerCase().includes(q)
  );
});

const languagesLabelsMap = computed(() => {
  const map: Record<string, string> = {};
  for (const o of props.languagesOptions ?? []) {
    if (!map[o.value]) map[o.value] = o.label;
  }
  return map;
});

function addLanguage(opt: { value: string; label: string }) {
  if (!languages.value.includes(opt.value)) {
    languages.value = [...languages.value, opt.value];
  }
}
</script>

<template>
  <section class="form-section">
    <h2>Условия работы и навыки</h2>
    <div class="grid three">
      <div :class="{ 'field-cozy-highlight': cozyFilledKeys?.includes('employment') }" class="cond-cell">
        <MultiSelectField
          v-model="employment"
          :options="EMPLOYMENT"
          label="Тип занятости"
          placeholder="Выберите тип"
        />
        <span v-if="cozyFilledKeys?.includes('employment')" class="cozy-icon" aria-hidden="true">
          <img src="/cozy.svg" alt="" />
        </span>
      </div>
      <div :class="{ 'field-cozy-highlight': cozyFilledKeys?.includes('schedule') }" class="cond-cell">
        <MultiSelectField
          v-model="schedule"
          :options="SCHEDULE"
          label="График работы"
          placeholder="Выберите график"
        />
        <span v-if="cozyFilledKeys?.includes('schedule')" class="cozy-icon" aria-hidden="true">
          <img src="/cozy.svg" alt="" />
        </span>
      </div>
      <div :class="{ 'field-cozy-highlight': cozyFilledKeys?.includes('skills') }" class="cond-cell">
        <TagsAutocompleteField
          v-model="skills"
          :query="suggestSkillsQuery ?? ''"
          :suggestions="suggestSkillsResults ?? []"
          :loading="suggestSkillsLoading"
          :labels-map="skillsLabelsMap"
          label="Навыки"
          placeholder="Введите навык (минимум 2 символа)..."
          :min-chars="2"
          @update:query="(v: string) => { emit('update:suggestSkillsQuery', v); emit('suggestSkillsInput'); }"
          @add="(opt) => emit('addSkill', opt)"
        />
        <span v-if="cozyFilledKeys?.includes('skills')" class="cozy-icon" aria-hidden="true">
          <img src="/cozy.svg" alt="" />
        </span>
      </div>
    </div>
    <div class="grid three">
      <MultiSelectField
        v-if="languagesOptions.length > 0"
        v-model="languages"
        :options="languagesOptions"
        label="Языки"
        placeholder="Выберите языки"
      />
      <TagsAutocompleteField
        v-else
        v-model="languages"
        :query="suggestLanguagesQuery ?? ''"
        :suggestions="suggestLanguagesResults ?? []"
        :loading="suggestLanguagesLoading"
        :labels-map="languagesLabelsMap"
        label="Языки"
        placeholder="Выберите языки"
        :min-chars="1"
        @update:query="(v: string) => (suggestLanguagesQuery = v)"
        @add="addLanguage"
      />
      <TagsAutocompleteField
        v-model="driverLicenseTypes"
        :query="driverLicenseQuery"
        :suggestions="driverLicenseSuggestions"
        :labels-map="driverLicenseLabelsMap"
        label="Категории прав"
        placeholder="Введите категории прав..."
        :min-chars="1"
        @update:query="(v: string) => (driverLicenseQuery = v)"
        @add="addDriverLicense"
      />
      <div></div>
    </div>
  </section>
</template>

<style scoped>
.cond-cell {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
.suggest-block {
  margin-top: 0.5rem;
}
.suggest-input {
  width: 100%;
  max-width: 20rem;
}
.suggest-loading {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.9rem;
  opacity: 0.8;
}
.suggest-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.35rem;
}
.suggest-item {
  padding: 0.25rem 0.5rem;
  font-size: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  cursor: pointer;
}
.suggest-item:hover {
  background: rgba(255, 255, 255, 0.12);
}
</style>
