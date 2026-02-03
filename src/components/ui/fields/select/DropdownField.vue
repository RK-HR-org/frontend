<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number, null],
    default: null,
  },
  options: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Выберите...',
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
});

const emit = defineEmits(['update:modelValue']);

function normalizeOption(opt) {
  if (typeof opt === 'string' || typeof opt === 'number') {
    return { value: opt, label: String(opt) };
  }
  return { value: opt.value, label: opt.label ?? String(opt.value) };
}

function onChange(event) {
  const raw = event.target.value;
  if (raw === '') {
    emit('update:modelValue', null);
    return;
  }
  const opt = props.options.find((o) => String(normalizeOption(o).value) === raw);
  const value = opt !== undefined ? normalizeOption(opt).value : raw;
  emit('update:modelValue', value);
}
</script>

<template>
  <div class="field-wrapper">
    <label v-if="label" class="field-label" :class="{ required }" :for="name || undefined">
      {{ label }}
    </label>
    <select
      :id="name || undefined"
      :name="name"
      :value="modelValue == null ? '' : modelValue"
      :disabled="disabled"
      class="field-select field-input-base"
      :class="{ 'has-error': !!error }"
      @change="onChange"
    >
      <option value="" disabled :hidden="required">{{ placeholder }}</option>
      <option
        v-for="(opt, idx) in options"
        :key="idx"
        :value="normalizeOption(opt).value"
      >
        {{ normalizeOption(opt).label }}
      </option>
    </select>
    <span v-if="error" class="field-error">{{ error }}</span>
    <span v-else-if="hint" class="field-hint">{{ hint }}</span>
  </div>
</template>

<style scoped>
@import '../fields.css';

.field-select {
  min-height: 2.75rem;
  cursor: pointer;
  padding-right: 2rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='currentColor' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 0.75rem;
  -webkit-appearance: none;
  appearance: none;
}
</style>
