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
        label="folder[]"
        placeholder="ID папок через запятую"
      />
      <CheckboxField
        v-model="props.form.includeAllFolders"
        label="include_all_folders"
        name="include_all_folders"
      />
      <TextInputField
        v-model="props.form.savedSearchId"
        label="saved_search_id"
      />
    </div>
    <div class="grid three">
      <TextInputField
        v-model="props.form.lastUsedTimestamp"
        label="last_used_timestamp"
      />
      <TextInputField v-model="props.form.lastUsed" label="last_used" />
      <div></div>
    </div>
    <p v-if="props.hasConflict" class="hint warning">
      Нельзя одновременно указывать folder[] и include_all_folders.
    </p>
  </section>
</template>

