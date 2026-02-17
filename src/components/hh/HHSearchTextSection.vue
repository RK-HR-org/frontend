<script setup lang="ts">
import TextInputField from "../ui/fields/text/TextInputField.vue";
import CheckboxField from "../ui/fields/boolean/CheckboxField.vue";
import DropdownField from "../ui/fields/select/DropdownField.vue";
import type { TextQueryItem, TextQueryLogic, TextQueryField, TextQueryPeriod } from "../../types";

interface HHSearchFormText {
  textQueries: TextQueryItem[];
  textCompanySize?: string | null;
  textIndustry?: string | null;
  byTextPrefix?: boolean;
}

const props = defineProps<{
  form: HHSearchFormText;
  cozyFilledKeys?: string[];
}>();

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
];

const fieldOptions: { value: TextQueryField; label: string }[] = [
  { value: "everywhere", label: "Везде" },
  { value: "title", label: "Название" },
  { value: "education", label: "Образование" },
  { value: "keywords", label: "Ключевые слова" },
  { value: "experience", label: "Опыт" },
  { value: "experience_company", label: "Компания (опыт)" },
  { value: "experience_position", label: "Должность (опыт)" },
  { value: "experience_description", label: "Описание (опыт)" },
  { value: "skills", label: "Навыки" },
];

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
          <div class="text-query-row grid four">
          <TextInputField
            v-model="props.form.textQueries[idx].text"
            :label="`Условие #${idx + 1}: фраза`"
            placeholder="Поисковая фраза"
          />
          <DropdownField
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
            v-model="props.form.textQueries[idx].period"
            label="Период"
            :options="periodOptions"
            placeholder="Период"
          />
          <div v-if="props.form.textQueries.length > 1" class="field-wrapper remove-cell">
            <label class="field-label">&nbsp;</label>
            <button
              type="button"
              class="btn ghost"
              aria-label="Удалить условие"
              @click="removeTextQuery(idx)"
            >
              Удалить
            </button>
          </div>
          </div>
        </div>
      </div>
      <button type="button" class="btn ghost" @click="addTextQuery">
        Добавить условие
      </button>
      <span v-if="cozyFilledKeys?.includes('textQueries')" class="cozy-icon" aria-hidden="true">
        <img src="/cozy.svg" alt="" />
      </span>
    </div>
    <div class="grid three">
      <TextInputField
        :model-value="(props.form.textCompanySize ?? '')"
        label="Размер компании"
        placeholder="any / small / medium / large"
        @update:model-value="(v) => (props.form.textCompanySize = v)"
      />
      <TextInputField
        :model-value="(props.form.textIndustry ?? '')"
        label="Отрасль"
        @update:model-value="(v) => (props.form.textIndustry = v)"
      />
      <CheckboxField
        v-model="props.form.byTextPrefix"
        label="По префиксу текста"
        name="by_text_prefix"
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
}

.text-query-row {
  display: grid;
  gap: 12px;
}

.grid.four {
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.remove-cell {
  display: flex;
  align-items: flex-end;
}
</style>
