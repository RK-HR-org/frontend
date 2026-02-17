<script setup lang="ts">
import TextInputField from "../ui/fields/text/TextInputField.vue";
import DropdownField from "../ui/fields/select/DropdownField.vue";
import { RESUME_SEARCH_ORDER } from "../../constants/hhDictionaries";

const props = defineProps<{
  form: Record<string, any>;
}>();
</script>

<template>
  <section class="form-section">
    <h2>Сортировка и пагинация</h2>
    <div class="grid three">
      <DropdownField
        v-model="props.form.orderBy"
        :options="RESUME_SEARCH_ORDER"
        label="Сортировка"
        placeholder="Выберите сортировку"
      />
      <TextInputField
        v-model="props.form.page"
        label="Страница"
        type="number"
      />
      <TextInputField
        v-model="props.form.perPage"
        label="На странице"
        type="number"
      />
    </div>
  </section>
</template>

