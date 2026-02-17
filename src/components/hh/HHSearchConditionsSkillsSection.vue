<script setup lang="ts">
import { computed } from "vue";
import TextInputField from "../ui/fields/text/TextInputField.vue";
import MultiSelectField from "../ui/fields/select/MultiSelectField.vue";
import { EMPLOYMENT, SCHEDULE } from "../../constants/hhDictionaries";

const props = withDefaults(
  defineProps<{
    form: Record<string, unknown>;
    cozyFilledKeys?: string[];
    skillsOptions?: { value: string; label: string }[];
    languagesOptions?: { value: string; label: string }[];
    suggestSkillsQuery?: string;
    suggestSkillsResults?: { value: string; label: string }[];
    suggestSkillsLoading?: boolean;
  }>(),
  {
    skillsOptions: () => [],
    languagesOptions: () => [],
    suggestSkillsQuery: "",
    suggestSkillsResults: () => [],
    suggestSkillsLoading: false,
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

const languages = computed({
  get: () => (props.form.languages as string[]) ?? [],
  set: (v: string[]) => {
    props.form.languages = v;
  },
});
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
        <MultiSelectField
          v-if="skillsOptions.length > 0"
          v-model="skills"
          :options="skillsOptions"
          label="Навыки"
          placeholder="Выберите навыки"
        />
        <TextInputField
          v-else
          v-model="props.form.skills"
          label="skill[]"
          placeholder="ID навыков через запятую"
        />
        <div class="suggest-block">
          <input
            :value="suggestSkillsQuery"
            type="text"
            class="field-input-base suggest-input"
            placeholder="Поиск навыка (минимум 2 символа)..."
            :disabled="suggestSkillsLoading"
            @input="(e: Event) => { emit('update:suggestSkillsQuery', (e.target as HTMLInputElement).value); emit('suggestSkillsInput'); }"
          />
          <span v-if="suggestSkillsLoading" class="suggest-loading">Загрузка…</span>
          <div v-else-if="suggestSkillsResults?.length" class="suggest-list">
            <button
              v-for="opt in suggestSkillsResults"
              :key="opt.value"
              type="button"
              class="suggest-item"
              @click="emit('addSkill', opt)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
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
      <TextInputField
        v-else
        v-model="props.form.languages"
        label="language[]"
        placeholder="lang.level через запятую (ita.c2)"
      />
      <TextInputField
        v-model="props.form.driverLicenseTypes"
        label="Категории прав"
        placeholder="A, B, C..."
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
