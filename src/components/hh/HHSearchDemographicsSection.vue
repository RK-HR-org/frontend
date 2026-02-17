<script setup lang="ts">
import TextInputField from "../ui/fields/text/TextInputField.vue";
import RangeFromToField from "../ui/fields/range/RangeFromToField.vue";
import DropdownField from "../ui/fields/select/DropdownField.vue";
import { GENDER } from "../../constants/hhDictionaries";

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
          label="Возраст (от – до)"
        />
        <span v-if="ageFromCozy()" class="cozy-icon" aria-hidden="true">
          <img src="/cozy.svg" alt="" />
        </span>
      </div>
      <DropdownField
        v-model="props.form.gender"
        :options="GENDER"
        label="Пол"
        placeholder="Выберите пол"
      />
      <TextInputField
        v-model="props.form.labels"
        label="Метки"
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
