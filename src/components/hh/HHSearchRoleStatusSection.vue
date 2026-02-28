<script setup lang="ts">
import { computed } from "vue";
import TextInputField from "../ui/fields/text/TextInputField.vue";
import MultiSelectField from "../ui/fields/select/MultiSelectField.vue";
import CheckboxField from "../ui/fields/boolean/CheckboxField.vue";
import TagsAutocompleteField from "../ui/fields/tags/TagsAutocompleteField.vue";
import { JOB_SEARCH_STATUSES_APPLICANT } from "../../constants/hhDictionaries";

const props = withDefaults(
  defineProps<{
    form: Record<string, unknown>;
    professionalRolesOptions?: { value: string; label: string }[];
    suggestRolesQuery?: string;
  }>(),
  { professionalRolesOptions: () => [], suggestRolesQuery: "" }
);

const emit = defineEmits<{
  "update:suggestRolesQuery": [value: string];
  addRole: [opt: { value: string; label: string }];
}>();

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

const rolesLabelsMap = computed(() =>
  Object.fromEntries(
    props.professionalRolesOptions.map((o) => [o.value, o.label])
  )
);

const suggestRolesResults = computed(() => {
  const q = (props.suggestRolesQuery ?? "").trim().toLowerCase();
  if (q.length < 2) return [];
  const selected = new Set(professionalRole.value);
  return props.professionalRolesOptions.filter(
    (o) =>
      o.label.toLowerCase().includes(q) && !selected.has(o.value)
  );
});
</script>

<template>
  <section class="form-section">
    <h2>Роль и статусы</h2>
    <div class="grid three">
      <TagsAutocompleteField
        v-if="professionalRolesOptions.length > 0"
        v-model="professionalRole"
        :query="suggestRolesQuery"
        :suggestions="suggestRolesResults"
        :labels-map="rolesLabelsMap"
        label="Профессиональные роли"
        placeholder="Введите название роли (минимум 2 символа)..."
        :min-chars="2"
        @update:query="(v: string) => emit('update:suggestRolesQuery', v)"
        @add="(opt) => emit('addRole', opt)"
      />
      <!-- <TextInputField
        v-else
        v-model="props.form.professionalRole"
        label="Профессиональные роли"
        placeholder="ID ролей через запятую"
      /> -->
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

