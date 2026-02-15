<script setup lang="ts">
import TextInputField from "../ui/fields/text/TextInputField.vue";
import RangeFromToField from "../ui/fields/range/RangeFromToField.vue";

const props = defineProps<{
  form: Record<string, unknown>;
  cozyFilledKeys?: string[];
}>();

const ageFromCozy = () =>
  props.cozyFilledKeys?.includes("ageFrom") || props.cozyFilledKeys?.includes("ageTo");
</script>

<template>
  <section class="form-section">
    <h2>Возраст / Пол / Метки</h2>
    <div class="grid four">
      <div :class="{ 'field-cozy-highlight': ageFromCozy() }" class="age-cell">
        <RangeFromToField
          v-model:from="props.form.ageFrom"
          v-model:to="props.form.ageTo"
          label="age_from / age_to"
        />
        <span v-if="ageFromCozy()" class="cozy-icon" aria-hidden="true">
          <img src="/cozy.svg" alt="" />
        </span>
      </div>
      <TextInputField v-model="props.form.gender" label="gender" />
      <TextInputField
        v-model="props.form.labels"
        label="label[]"
        placeholder="через запятую"
      />
    </div>
  </section>
</template>

<style scoped>
.age-cell {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
</style>

