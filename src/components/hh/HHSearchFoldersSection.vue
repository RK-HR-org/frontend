<script setup lang="ts">
import TextInputField from "../ui/fields/text/TextInputField.vue";
import CheckboxField from "../ui/fields/boolean/CheckboxField.vue";

const props = defineProps<{
  form: Record<string, any>;
  hasConflict?: boolean;
}>();
</script>

<template>
  <section class="form-section">
    <h2>Папки / автопоиски</h2>
    <div class="grid three">
      <TextInputField
        v-model="props.form.folders"
        label="Папки (ID)"
        placeholder="ID папок через запятую"
      />
      <CheckboxField
        v-model="props.form.includeAllFolders"
        label="Включить все папки"
        name="include_all_folders"
      />
      <TextInputField
        v-model="props.form.savedSearchId"
        label="ID сохранённого поиска"
      />
    </div>
    <div class="grid three">
      <TextInputField
        v-model="props.form.lastUsedTimestamp"
        label="Время последнего использования"
      />
      <TextInputField v-model="props.form.lastUsed" label="Последнее использование" />
      <div></div>
    </div>
    <p v-if="props.hasConflict" class="hint warning">
      Нельзя одновременно указывать folder[] и include_all_folders.
    </p>
  </section>
</template>

