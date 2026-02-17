<script setup lang="ts">
import { computed } from "vue";
import TextInputField from "../ui/fields/text/TextInputField.vue";
import MultiSelectField from "../ui/fields/select/MultiSelectField.vue";
import { EDUCATION_LEVEL, EXPERIENCE } from "../../constants/hhDictionaries";

const props = withDefaults(
  defineProps<{
    form: Record<string, unknown>;
    cozyFilledKeys?: string[];
    suggestEduQuery?: string;
    suggestEduResults?: { value: string; label: string }[];
    suggestEduLoading?: boolean;
  }>(),
  {
    suggestEduQuery: "",
    suggestEduResults: () => [],
    suggestEduLoading: false,
  }
);

const emit = defineEmits<{
  "update:suggestEduQuery": [value: string];
  suggestEduInput: [];
  "add-edu": [opt: { value: string; label: string }];
}>();

const educationLevels = computed({
  get: () => (props.form.educationLevels as string[]) ?? [],
  set: (v: string[]) => {
    props.form.educationLevels = v;
  },
});

const experience = computed({
  get: () => (props.form.experience as string[]) ?? [],
  set: (v: string[]) => {
    props.form.experience = v;
  },
});

const educationalInstitution = computed({
  get: () => (props.form.educationalInstitution as string[]) ?? [],
  set: (v: string[]) => {
    props.form.educationalInstitution = v;
  },
});

function removeEdu(id: string) {
  const arr = educationalInstitution.value.filter((x) => x !== id);
  educationalInstitution.value = arr;
}
</script>

<template>
  <section class="form-section">
    <h2>Образование и опыт</h2>
    <div class="grid three">
      <MultiSelectField
        v-model="educationLevels"
        :options="EDUCATION_LEVEL"
        label="Уровень образования"
        placeholder="Выберите уровень"
      />
      <div :class="{ 'field-cozy-highlight': cozyFilledKeys?.includes('experience') }" class="exp-cell">
        <MultiSelectField
          v-model="experience"
          :options="EXPERIENCE"
          label="Опыт работы"
          placeholder="Выберите опыт"
        />
        <span v-if="cozyFilledKeys?.includes('experience')" class="cozy-icon" aria-hidden="true">
          <img src="/cozy.svg" alt="" />
        </span>
      </div>
      <div></div>
    </div>
    <div class="grid three">
      <div class="edu-cell">
        <label class="field-label">Учебные заведения</label>
        <div class="suggest-block">
          <input
            :value="suggestEduQuery"
            type="text"
            class="field-input-base suggest-input"
            placeholder="Поиск по названию вуза (мин. 2 символа)..."
            :disabled="suggestEduLoading"
            @input="
              (e: Event) => {
                emit('update:suggestEduQuery', (e.target as HTMLInputElement).value);
                emit('suggestEduInput');
              }
            "
          />
          <span v-if="suggestEduLoading" class="suggest-loading">Загрузка…</span>
          <div v-else-if="suggestEduResults?.length" class="suggest-list">
            <button
              v-for="opt in suggestEduResults"
              :key="opt.value"
              type="button"
              class="suggest-item"
              @click="emit('add-edu', opt)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
        <div v-if="educationalInstitution.length > 0" class="selected-list">
          <span
            v-for="id in educationalInstitution"
            :key="id"
            class="selected-tag"
          >
            {{ id }}
            <button type="button" class="tag-remove" aria-label="Удалить" @click="removeEdu(id)">
              ×
            </button>
          </span>
        </div>
      </div>
      <TextInputField
        v-model="props.form.filterExpIndustry"
        label="Отрасли опыта"
        placeholder="ID отраслей через запятую"
      />
      <TextInputField
        v-model="props.form.filterExpPeriod"
        label="Период опыта"
        placeholder="all_time / last_year ..."
      />
    </div>
  </section>
</template>

<style scoped>
.exp-cell {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.edu-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.suggest-block {
  position: relative;
}

.suggest-input {
  width: 100%;
}

.suggest-loading {
  font-size: 0.9rem;
  opacity: 0.8;
}

.suggest-list {
  position: absolute;
  z-index: 10;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  background: var(--bg-fields, #1a1a1a);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 4px;
}

.suggest-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 0.95rem;
}

.suggest-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  font-size: 0.9rem;
}

.tag-remove {
  padding: 0 2px;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  opacity: 0.8;
}

.tag-remove:hover {
  opacity: 1;
}
</style>
