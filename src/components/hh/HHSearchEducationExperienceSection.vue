<script setup lang="ts">
import TextInputField from "../ui/fields/text/TextInputField.vue";

const props = defineProps<{
  form: Record<string, unknown>;
  cozyFilledKeys?: string[];
}>();
</script>

<template>
  <section class="form-section">
    <h2>Образование и опыт</h2>
    <div class="grid three">
      <TextInputField
        v-model="props.form.educationLevels"
        label="education_levels[]"
        placeholder="ID через запятую"
      />
      <TextInputField
        v-model="props.form.educationLevelDeprecated"
        label="education_level (deprecated)"
      />
      <div :class="{ 'field-cozy-highlight': cozyFilledKeys?.includes('experience') }" class="exp-cell">
        <TextInputField
          v-model="props.form.experience"
          label="experience[]"
          placeholder="значения через запятую"
        />
        <span v-if="cozyFilledKeys?.includes('experience')" class="cozy-icon" aria-hidden="true">
          <img src="/cozy.svg" alt="" />
        </span>
      </div>
    </div>
    <div class="grid three">
      <TextInputField
        v-model="props.form.educationalInstitution"
        label="educational_institution[]"
        placeholder="подсказки вузов"
      />
      <TextInputField
        v-model="props.form.filterExpIndustry"
        label="filter_exp_industry[]"
        placeholder="ID отраслей через запятую"
      />
      <TextInputField
        v-model="props.form.filterExpPeriod"
        label="filter_exp_period"
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
</style>
