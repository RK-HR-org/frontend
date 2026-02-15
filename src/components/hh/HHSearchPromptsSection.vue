<script setup lang="ts">
import TextAreaField from "../ui/fields/text/TextAreaField.vue";

defineProps<{
  form: { positivePrompt?: string; negativePrompt?: string };
  cozyFilledKeys?: string[];
}>();
</script>

<template>
  <section class="form-section">
    <h3>Промпты</h3>
    <div class="grid two">
      <div :class="{ 'field-cozy-highlight': cozyFilledKeys?.includes('positivePrompt') }" class="prompt-cell">
        <TextAreaField
          v-model="form.positivePrompt"
          label="Положительный промпт"
          placeholder="Желаемые характеристики, например: Python разработчик с опытом 3+ года, возраст 25–50"
          :rows="4"
        />
        <span v-if="cozyFilledKeys?.includes('positivePrompt')" class="cozy-icon" aria-hidden="true">
          <img src="/cozy.svg" alt="" />
        </span>
      </div>
      <div :class="{ 'field-cozy-highlight': cozyFilledKeys?.includes('negativePrompt') }" class="prompt-cell">
        <TextAreaField
          v-model="form.negativePrompt"
          label="Отрицательный промпт"
          placeholder="Нежелательные характеристики, например: без опыта, стажёр"
          :rows="4"
        />
        <span v-if="cozyFilledKeys?.includes('negativePrompt')" class="cozy-icon" aria-hidden="true">
          <img src="/cozy.svg" alt="" />
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.prompt-cell {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
</style>
