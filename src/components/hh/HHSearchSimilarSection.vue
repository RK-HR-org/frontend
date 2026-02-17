<script setup lang="ts">
import TextInputField from "../ui/fields/text/TextInputField.vue";
import CheckboxField from "../ui/fields/boolean/CheckboxField.vue";

const props = defineProps<{
  form: Record<string, any>;
}>();
</script>

<template>
  <section class="form-section">
    <h2>Похожие резюме / вакансии / отклики</h2>
    <div class="grid three">
      <TextInputField v-model="props.form.vacancyId" label="ID вакансии" />
      <TextInputField
        v-model="props.form.resumeSimilar"
        label="Резюме (ID похожего)"
      />
      <CheckboxField
        v-model="props.form.searchInResponses"
        label="Искать в откликах"
        name="search_in_responses"
      />
    </div>
    <div class="grid two">
      <TextInputField
        v-model="props.form.searchByVacancyId"
        label="Поиск по ID вакансии"
      />
    </div>
  </section>
</template>

