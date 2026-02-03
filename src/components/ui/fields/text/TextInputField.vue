<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
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
  autocomplete: {
    type: String,
    default: 'off',
  },
});

const emit = defineEmits(['update:modelValue']);

function onInput(event) {
  const value = event.target.type === 'number' ? event.target.valueAsNumber : event.target.value;
  emit('update:modelValue', value);
}
</script>

<template>
  <div class="field-wrapper">
    <label v-if="label" class="field-label" :class="{ required }" :for="name || undefined">
      {{ label }}
    </label>
    <input
      :id="name || undefined"
      :name="name"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete"
      class="field-input field-input-base"
      :class="{ 'has-error': !!error }"
      @input="onInput"
    />
    <span v-if="error" class="field-error">{{ error }}</span>
    <span v-else-if="hint" class="field-hint">{{ hint }}</span>
  </div>
</template>

<style scoped>
@import '../fields.css';

.field-input {
  min-height: 2.75rem;
}
</style>
