<script setup lang="ts">
import TextInputField from "../ui/fields/text/TextInputField.vue";
import RangeFromToField from "../ui/fields/range/RangeFromToField.vue";

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
        <TextInputField v-model="props.form.currency" label="currency" />
        <span v-if="cozyFilledKeys?.includes('currency')" class="cozy-icon" aria-hidden="true">
          <img src="/cozy.svg" alt="" />
        </span>
      </div>
      <div :class="{ 'field-cozy-highlight': salaryRangeCozy() }" class="salary-cell">
        <RangeFromToField
          v-model:from="props.form.salaryFrom"
          v-model:to="props.form.salaryTo"
          label="salary_from / salary_to"
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

