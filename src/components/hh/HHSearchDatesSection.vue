<script setup lang="ts">
import TextInputField from "../ui/fields/text/TextInputField.vue";

const props = defineProps<{
  form: Record<string, any>;
  hasConflict?: boolean;
}>();
</script>

<template>
  <section class="form-section">
    <h2>Даты публикации</h2>
    <div class="grid three">
      <TextInputField
        v-model="props.form.period"
        label="period (days)"
        type="number"
      />
      <TextInputField
        v-model="props.form.dateFrom"
        label="date_from"
        placeholder="YYYY-MM-DD"
      />
      <TextInputField
        v-model="props.form.dateTo"
        label="date_to"
        placeholder="YYYY-MM-DD"
      />
    </div>
    <p v-if="props.hasConflict" class="hint warning">
      Нельзя одновременно задавать period и date_from/date_to.
    </p>
  </section>
</template>

