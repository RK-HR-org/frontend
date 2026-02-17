<script setup lang="ts">
import { computed } from "vue";
import TextInputField from "../ui/fields/text/TextInputField.vue";
import MultiSelectField from "../ui/fields/select/MultiSelectField.vue";
import CheckboxField from "../ui/fields/boolean/CheckboxField.vue";
import { JOB_SEARCH_STATUSES_APPLICANT } from "../../constants/hhDictionaries";

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

const jobSearchStatus = computed({
  get: () => (props.form.jobSearchStatus as string[]) ?? [],
  set: (v: string[]) => {
    props.form.jobSearchStatus = v;
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
        label="Профессиональные роли"
        placeholder="ID ролей через запятую"
      />
      <MultiSelectField
        v-model="jobSearchStatus"
        :options="JOB_SEARCH_STATUSES_APPLICANT"
        label="Статус поиска работы"
        placeholder="Выберите статусы"
      />
      <CheckboxField
        v-model="props.form.withJobSearchStatus"
        label="Учитывать статус поиска"
        name="with_job_search_status"
      />
    </div>
  </section>
</template>

