<script setup>
defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  rows: {
    type: Number,
    default: 4,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  maxlength: {
    type: [Number, String],
    default: undefined,
  },
});

const emit = defineEmits(['update:modelValue']);

function onInput(event) {
  emit('update:modelValue', event.target.value);
}
</script>

<template>
  <div class="field-wrapper">
    <label v-if="label" class="field-label" :class="{ required }" :for="name || undefined">
      {{ label }}
    </label>
    <textarea
      :id="name || undefined"
      :name="name"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      :maxlength="maxlength"
      class="field-input field-input-base"
      :class="{ 'has-error': !!error }"
      @input="onInput"
    />
    <span v-if="error" class="field-error">{{ error }}</span>
    <span v-else-if="hint" class="field-hint">{{ hint }}</span>
    <span v-else-if="maxlength" class="field-hint">{{ modelValue?.length ?? 0 }} / {{ maxlength }}</span>
  </div>
</template>

<style scoped>
@import '../fields.css';

.field-input {
  resize: vertical;
  min-height: 6rem;
}
</style>
