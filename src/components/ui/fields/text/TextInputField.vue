<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number, Array],
    default: '',
  },
  type: { type: String, default: 'text' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  name: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
});

const emit = defineEmits(['update:modelValue']);

function displayValue(modelValue) {
  if (Array.isArray(modelValue)) {
    return modelValue.join(', ');
  }
  if (modelValue === null || modelValue === undefined) return '';
  return String(modelValue);
}

function onInput(event) {
  const raw = event.target.value;
  const modelValue = props.modelValue;
  if (Array.isArray(modelValue)) {
    const arr = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    emit('update:modelValue', arr);
    return;
  }
  const value = event.target.type === 'number' ? event.target.valueAsNumber : raw;
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
      :value="displayValue(modelValue)"
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
