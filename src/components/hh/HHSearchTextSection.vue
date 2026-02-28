<script setup lang="ts">
import { computed } from "vue";
import TextInputField from "../ui/fields/text/TextInputField.vue";
import CheckboxField from "../ui/fields/boolean/CheckboxField.vue";
import DropdownField from "../ui/fields/select/DropdownField.vue";
import DeleteIcon from "../ui/icons/DeleteIcon.vue";
import type { TextQueryItem, TextQueryLogic, TextQueryField, TextQueryPeriod } from "../../types";

interface IndustryGroup {
  id: string;
  name: string;
  industries: { id: string; name: string }[];
}

interface HHSearchFormText {
  textQueries: TextQueryItem[];
  textCompanySize?: string | null;
  textIndustry?: string | null;
  byTextPrefix?: boolean;
}

const props = withDefaults(
  defineProps<{
    form: HHSearchFormText;
    cozyFilledKeys?: string[];
    industriesData?: IndustryGroup[];
    searchMode?: "resumes" | "vacancies";
  }>(),
  { industriesData: () => [], searchMode: "resumes" }
);

const parentOptions = computed(() =>
  props.industriesData?.map((p) => ({ value: p.id, label: p.name })) ?? []
);

const selectedParentId = computed(() => {
  const id = props.form.textIndustry ?? "";
  if (!id) return "";
  const asParent = props.industriesData?.find((p) => p.id === id);
  if (asParent) return id;
  const parent = props.industriesData?.find((p) =>
    p.industries.some((s) => s.id === id)
  );
  return parent?.id ?? "";
});

const subOptions = computed(() => {
  const parent = props.industriesData?.find((p) => p.id === selectedParentId.value);
  const items = parent?.industries?.map((s) => ({ value: s.id, label: s.name })) ?? [];
  return [{ value: "", label: "Вся отрасль" }, ...items];
});

const selectedSubId = computed(() => {
  const id = props.form.textIndustry ?? "";
  if (!id || !selectedParentId.value) return "";
  const parent = props.industriesData?.find((p) => p.id === selectedParentId.value);
  const sub = parent?.industries?.find((s) => s.id === id);
  return sub ? id : "";
});

function onParentChange(v: string | number | null) {
  const id = v != null ? String(v) : "";
  props.form.textIndustry = id || null;
}

function onSubChange(v: string | number | null) {
  const id = v != null ? String(v) : "";
  props.form.textIndustry = id || selectedParentId.value || null;
}

function defaultTextQueryItem(): TextQueryItem {
  return {
    text: "",
    logic: "all",
    field: "everywhere",
    period: "all_time",
  };
}

const logicOptions: { value: TextQueryLogic; label: string }[] = [
  { value: "all", label: "Все слова (all)" },
  { value: "any", label: "Любое слово (any)" },
  { value: "phrase", label: "Фраза (phrase)" },
  { value: "except", label: "Не встречаются (except)" },
];

const resumeFieldOptions: { value: TextQueryField; label: string }[] = [
  { value: "everywhere", label: "Везде" },
  { value: "title", label: "Название" },
  { value: "education", label: "Образование" },
  { value: "experience", label: "Опыт" },
  { value: "experience_company", label: "Компания (опыт)" },
  { value: "experience_position", label: "Должность (опыт)" },
  { value: "experience_description", label: "Описание (опыт)" },
  { value: "skills", label: "Навыки" },
];

const vacancyFieldOptions: { value: string; label: string }[] = [
  { value: "name", label: "В названии вакансии" },
  { value: "company_name", label: "В названии компании" },
  { value: "description", label: "В описании вакансии" },
];

const fieldOptions = computed(() =>
  props.searchMode === "vacancies" ? vacancyFieldOptions : resumeFieldOptions
);

const periodOptions: { value: TextQueryPeriod; label: string }[] = [
  { value: "all_time", label: "За всё время" },
  { value: "last_year", label: "За год" },
  { value: "last_three_years", label: "За 3 года" },
  { value: "last_six_years", label: "За 6 лет" },
];

function addTextQuery() {
  props.form.textQueries.push(defaultTextQueryItem());
}

function removeTextQuery(idx: number) {
  props.form.textQueries.splice(idx, 1);
}
</script>

<template>
  <section class="form-section">
    <h2>Текст</h2>
    <div :class="{ 'field-cozy-highlight': cozyFilledKeys?.includes('textQueries') }" class="text-queries-wrap">
      <div class="text-queries">
        <div
          v-for="(q, idx) in props.form.textQueries"
          :key="idx"
          class="text-query-block"
        >
          <div class="text-query-phrase-row">
            <TextInputField
              v-model="props.form.textQueries[idx].text"
              :label="`Условие ${idx + 1}: фраза`"
              placeholder="Поисковая фраза"
            />
          </div>
          <div class="text-query-options-row" :class="props.searchMode === 'vacancies' ? 'grid two' : 'grid four'">
            <DropdownField
              v-if="props.searchMode !== 'vacancies'"
              v-model="props.form.textQueries[idx].logic"
              label="Логика"
              :options="logicOptions"
              placeholder="Логика"
            />
            <DropdownField
              v-model="props.form.textQueries[idx].field"
              label="Поле поиска"
              :options="fieldOptions"
              placeholder="Поле"
            />
            <DropdownField
              v-if="props.searchMode !== 'vacancies'"
              v-model="props.form.textQueries[idx].period"
              label="Период"
              :options="periodOptions"
              placeholder="Период"
            />
            <div v-if="props.form.textQueries.length > 1" class="field-wrapper remove-cell">
              <label class="field-label">&nbsp;</label>
              <button
                type="button"
                class="btn ghost icon-btn"
                aria-label="Удалить условие"
                @click="removeTextQuery(idx)"
              >
                <DeleteIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
      <span v-if="cozyFilledKeys?.includes('textQueries')" class="cozy-icon" aria-hidden="true">
        <img src="/cozy.svg" alt="" />
      </span>
    </div>
    <button type="button" class="btn ghost add-text-query-btn" @click="addTextQuery">
        Добавить условие
    </button>
    <div class="grid four">
      <TextInputField
        :model-value="(props.form.textCompanySize ?? '')"
        label="Размер компании"
        placeholder="any / small / medium / large"
        @update:model-value="(v) => (props.form.textCompanySize = v)"
      />
      <template v-if="industriesData?.length">
        <DropdownField
          :model-value="selectedParentId"
          label="Отрасль"
          :options="parentOptions"
          placeholder="Выберите отрасль"
          @update:model-value="onParentChange"
        />
        <DropdownField
          v-if="selectedParentId"
          :model-value="selectedSubId"
          label="Подотрасль"
          :options="subOptions"
          placeholder="Вся отрасль"
          @update:model-value="onSubChange"
        />
        <div v-else class="field-wrapper" />
      </template>
      <TextInputField
        v-else
        :model-value="(props.form.textIndustry ?? '')"
        label="Отрасль"
        placeholder="ID отрасли"
        @update:model-value="(v) => (props.form.textIndustry = v)"
      />
      <CheckboxField
        :model-value="!!props.form.byTextPrefix"
        label="По префиксу текста"
        name="by_text_prefix"
        @update:model-value="(v) => (props.form.byTextPrefix = v)"
      />
    </div>
  </section>
</template>

<style scoped>
.text-queries-wrap {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
.text-queries-wrap .text-queries {
  flex: 1;
  min-width: 0;
}
.text-queries {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.text-query-block {
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid rgb(104, 101, 101);
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.text-query-phrase-row {
  width: 100%;
}

.text-query-options-row {
  display: grid;
  gap: 12px;
}

.grid.four {
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.grid.two {
  grid-template-columns: 1fr auto;
}

.remove-cell {
  display: flex;
  align-items: flex-end;
  height: 3rem;
  color: rgb(247, 244, 244);
  
}

.btn.icon-btn {
  padding: 0.35rem 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn.icon-btn :deep(.icon) {
  width: 1rem;
  height: 1rem;
}
.add-text-query-btn {
  width: 100%;
  background: white;
  color: white !important;
  border: 3px rgb(255, 255, 255) dashed !important;
  transition: all 0.2s;
}
.add-text-query-btn:hover {
  background: rgb(255, 255, 255);
  color: rgb(0, 0, 0) !important;
  border: 3px rgb(255, 255, 255) solid !important;
}
</style>
