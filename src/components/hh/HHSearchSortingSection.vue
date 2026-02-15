<script setup lang="ts">
import TextInputField from "../ui/fields/text/TextInputField.vue";

const props = defineProps<{
  form: Record<string, any>;
}>();
</script>

<template>
  <section class="form-section">
    <h2>Сортировка и пагинация</h2>
    <div class="grid three">
      <TextInputField v-model="props.form.orderBy" label="order_by" />
      <TextInputField
        v-model="props.form.page"
        label="page"
        type="number"
      />
      <TextInputField
        v-model="props.form.perPage"
        label="per_page"
        type="number"
      />
    </div>
  </section>
</template>

