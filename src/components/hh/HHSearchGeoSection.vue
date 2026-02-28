<script setup lang="ts">
import { computed } from "vue";
import TextInputField from "../ui/fields/text/TextInputField.vue";
import DropdownField from "../ui/fields/select/DropdownField.vue";
import MultiSelectField from "../ui/fields/select/MultiSelectField.vue";
import TagsAutocompleteField from "../ui/fields/tags/TagsAutocompleteField.vue";
import {
  RESUME_SEARCH_RELOCATION,
  BUSINESS_TRIP_READINESS,
} from "../../constants/hhDictionaries";

const props = withDefaults(
  defineProps<{
    form: Record<string, unknown>;
    cozyFilledKeys?: string[];
    countriesOptions?: { value: string; label: string }[];
    suggestCitiesQuery?: string;
    suggestCitiesResults?: { value: string; label: string }[];
    suggestCitiesLoading?: boolean;
    areaLabels?: Record<string, string>;
  }>(),
  {
    countriesOptions: () => [],
    suggestCitiesQuery: "",
    suggestCitiesResults: () => [],
    suggestCitiesLoading: false,
    areaLabels: () => ({}),
  }
);

const emit = defineEmits<{
  "update:suggestCitiesQuery": [value: string];
  suggestCitiesInput: [];
  addCity: [opt: { value: string; label: string }];
}>();

const country = computed({
  get: () => (props.form.country as string) ?? "113",
  set: (v: string | null) => {
    props.form.country = v ?? "113";
  },
});

const areas = computed({
  get: () => (props.form.areas as string[]) ?? [],
  set: (v: string[]) => {
    props.form.areas = v;
  },
});

const relocation = computed({
  get: () => (props.form.relocation as string) ?? "",
  set: (v: string | null) => {
    props.form.relocation = v ?? "";
  },
});

const businessTripReadiness = computed({
  get: () => (props.form.businessTripReadiness as string[]) ?? [],
  set: (v: string[]) => {
    props.form.businessTripReadiness = v;
  },
});
</script>

<template>
  <section class="form-section">
    <h2>География</h2>
    <div class="grid three">
      <div :class="{ 'field-cozy-highlight': cozyFilledKeys?.includes('areas') }" class="geo-cell geo-cell-country">
        <DropdownField
          v-if="countriesOptions.length > 0"
          v-model="country"
          :options="countriesOptions"
          label="Страна"
          placeholder="Выберите страну"
        />
        <span v-if="cozyFilledKeys?.includes('areas')" class="cozy-icon" aria-hidden="true">
          <img src="/cozy.svg" alt="" />
        </span>
      </div>
      <div class="geo-cell geo-cell-cities">
        <TagsAutocompleteField
          v-model="areas"
          :query="suggestCitiesQuery ?? ''"
          :suggestions="suggestCitiesResults ?? []"
          :loading="suggestCitiesLoading"
          :labels-map="areaLabels ?? {}"
          label="Населённые пункты"
          placeholder="Введите город (мин. 2 символа)..."
          :min-chars="2"
          @update:query="(v) => { emit('update:suggestCitiesQuery', v); emit('suggestCitiesInput'); }"
          @add="(opt) => emit('addCity', opt)"
        />
      </div>
      <DropdownField
        v-model="relocation"
        :options="RESUME_SEARCH_RELOCATION"
        label="Готовность к переезду"
        placeholder="Выберите готовность к переезду"
      />
    </div>
    <div class="grid three">
      <!-- <TextInputField
        v-model="props.form.metro"
        label="Метро"
        placeholder="ID метро через запятую"
      />
      <TextInputField v-model="props.form.district" label="Район" /> -->
      <!-- <TextInputField
        v-model="props.form.citizenship"
        label="Гражданство"
        placeholder="ID стран через запятую"
      />
      <TextInputField
        v-model="props.form.workTicket"
        label="Рабочая виза"
        placeholder="ID стран через запятую"
      /> -->
    </div>
    <div class="grid two">
      <MultiSelectField
        v-model="businessTripReadiness"
        :options="BUSINESS_TRIP_READINESS"
        label="Готовность к командировкам"
        placeholder="Выберите"
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

.geo-cell-country {
  max-width: 16rem;
}

.geo-cell-cities {
  flex: 1;
  min-width: 0;
}
</style>
