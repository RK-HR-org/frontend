<script setup lang="ts">
import { computed } from "vue";
import TextInputField from "../ui/fields/text/TextInputField.vue";
import MultiSelectField from "../ui/fields/select/MultiSelectField.vue";

const props = withDefaults(
  defineProps<{
    form: Record<string, unknown>;
    cozyFilledKeys?: string[];
    areasOptions?: { value: string; label: string }[];
    suggestAreasQuery?: string;
    suggestAreasResults?: { value: string; label: string }[];
    suggestAreasLoading?: boolean;
  }>(),
  {
    areasOptions: () => [],
    suggestAreasQuery: "",
    suggestAreasResults: () => [],
    suggestAreasLoading: false,
  }
);

const emit = defineEmits<{
  "update:suggestAreasQuery": [value: string];
  suggestAreasInput: [];
  addArea: [opt: { value: string; label: string }];
}>();

const areas = computed({
  get: () => (props.form.areas as string[]) ?? [],
  set: (v: string[]) => {
    props.form.areas = v;
  },
});
</script>

<template>
  <section class="form-section">
    <h2>География</h2>
    <div class="grid three">
      <div :class="{ 'field-cozy-highlight': cozyFilledKeys?.includes('areas') }" class="geo-cell">
        <MultiSelectField
          v-if="areasOptions.length > 0"
          v-model="areas"
          :options="areasOptions"
          label="Регионы"
          placeholder="Выберите регионы"
        />
        <TextInputField
          v-else
          v-model="props.form.areas"
          label="area[]"
          placeholder="ID через запятую"
        />
        <div class="suggest-block">
          <input
            :value="suggestAreasQuery"
            type="text"
            class="field-input-base suggest-input"
            placeholder="Поиск региона (минимум 2 символа)..."
            :disabled="suggestAreasLoading"
            @input="(e: Event) => { emit('update:suggestAreasQuery', (e.target as HTMLInputElement).value); emit('suggestAreasInput'); }"
          />
          <span v-if="suggestAreasLoading" class="suggest-loading">Загрузка…</span>
          <div v-else-if="suggestAreasResults?.length" class="suggest-list">
            <button
              v-for="opt in suggestAreasResults"
              :key="opt.value"
              type="button"
              class="suggest-item"
              @click="emit('addArea', opt)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
        <span v-if="cozyFilledKeys?.includes('areas')" class="cozy-icon" aria-hidden="true">
          <img src="/cozy.svg" alt="" />
        </span>
      </div>
      <TextInputField v-model="props.form.relocation" label="relocation" />
      <TextInputField
        v-model="props.form.metro"
        label="metro[]"
        placeholder="ID метро через запятую"
      />
    </div>
    <div class="grid three">
      <TextInputField v-model="props.form.district" label="district" />
      <TextInputField
        v-model="props.form.citizenship"
        label="citizenship[]"
        placeholder="ID стран через запятую"
      />
      <TextInputField
        v-model="props.form.workTicket"
        label="work_ticket[]"
        placeholder="ID стран через запятую"
      />
    </div>
    <div class="grid two">
      <TextInputField
        v-model="props.form.businessTripReadiness"
        label="business_trip_readiness[]"
        placeholder="значения через запятую"
      />
    </div>
  </section>
</template>

<style scoped>
.geo-cell {
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
