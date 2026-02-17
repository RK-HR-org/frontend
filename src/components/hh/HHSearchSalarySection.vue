<script setup lang="ts">
import RangeFromToField from "../ui/fields/range/RangeFromToField.vue";
import DropdownField from "../ui/fields/select/DropdownField.vue";
import { CURRENCY_OPTIONS } from "../../constants/hhDictionaries";

const props = defineProps<{
  form: Record<string, unknown>;
  cozyFilledKeys?: string[];
}>();

const salaryRangeCozy = () =>
  props.cozyFilledKeys?.includes("salaryFrom") || props.cozyFilledKeys?.includes("salaryTo");
</script>

<template>
  <section class="form-section">
    <h2>Зарплата</h2>
    <div class="grid three">
      <div :class="{ 'field-cozy-highlight': cozyFilledKeys?.includes('currency') }" class="salary-cell">
        <DropdownField
          v-model="props.form.currency"
          :options="CURRENCY_OPTIONS"
          label="Валюта"
          placeholder="Выберите валюту"
        />
        <span v-if="cozyFilledKeys?.includes('currency')" class="cozy-icon" aria-hidden="true">
          <img src="/cozy.svg" alt="" />
        </span>
      </div>
      <div :class="{ 'field-cozy-highlight': salaryRangeCozy() }" class="salary-cell">
        <RangeFromToField
          v-model:from="props.form.salaryFrom"
          v-model:to="props.form.salaryTo"
          label="Зарплата (от – до)"
        />
        <span v-if="salaryRangeCozy()" class="cozy-icon" aria-hidden="true">
          <img src="/cozy.svg" alt="" />
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.salary-cell {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
</style>

