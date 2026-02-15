<script setup lang="ts">
import { computed } from "vue";
import TextInputField from "../ui/fields/text/TextInputField.vue";
import MultiSelectField from "../ui/fields/select/MultiSelectField.vue";
import CheckboxField from "../ui/fields/boolean/CheckboxField.vue";

const props = withDefaults(
  defineProps<{
    form: Record<string, unknown>;
    professionalRolesOptions?: { value: string; label: string }[];
  }>(),
  { professionalRolesOptions: () => [] }
);

const professionalRole = computed({
  get: () => (props.form.professionalRole as string[]) ?? [],
  set: (v: string[]) => {
    props.form.professionalRole = v;
  },
});
</script>

<template>
  <section class="form-section">
    <h2>Роль и статусы</h2>
    <div class="grid three">
      <MultiSelectField
        v-if="professionalRolesOptions.length > 0"
        v-model="professionalRole"
        :options="professionalRolesOptions"
        label="Профессиональные роли"
        placeholder="Выберите роли"
      />
      <TextInputField
        v-else
        v-model="props.form.professionalRole"
        label="professional_role[]"
        placeholder="ID ролей через запятую"
      />
      <TextInputField
        v-model="props.form.jobSearchStatus"
        label="job_search_status[]"
        placeholder="значения через запятую"
      />
      <CheckboxField
        v-model="props.form.withJobSearchStatus"
        label="with_job_search_status"
        name="with_job_search_status"
      />
    </div>
  </section>
</template>

