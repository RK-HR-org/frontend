<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
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
    default: 'Выберите несколько...',
  },
  disabled: {
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

const normalizedOptions = computed(() =>
  props.options.map((o) => normalizeOption(o))
);

const selectedSet = computed(() => new Set(props.modelValue));

function toggle(value) {
  if (props.disabled) return;
  const arr = [...props.modelValue];
  const idx = arr.indexOf(value);
  if (idx === -1) arr.push(value);
  else arr.splice(idx, 1);
  emit('update:modelValue', arr);
}
</script>

<template>
  <div class="field-wrapper">
    <label v-if="label" class="field-label" :for="name || undefined">
      {{ label }}
    </label>
    <div
      class="multiselect-box field-input-base"
      :class="{ 'has-error': !!error, disabled }"
      role="listbox"
      :aria-multiselectable="true"
    >
      <button
        v-for="opt in normalizedOptions"
        :key="opt.value"
        type="button"
        role="option"
        :aria-selected="selectedSet.has(opt.value)"
        class="multiselect-option"
        :class="{ selected: selectedSet.has(opt.value) }"
        :disabled="disabled"
        @click="toggle(opt.value)"
      >
        <span v-if="selectedSet.has(opt.value)" class="multiselect-check">{{ selectedSet.has(opt.value) ? '✓' : '' }}</span>
        {{ opt.label }}
      </button>
      <span v-if="normalizedOptions.length === 0" class="multiselect-placeholder">
        {{ placeholder }}
      </span>
    </div>
    <span v-if="error" class="field-error">{{ error }}</span>
    <span v-else-if="hint" class="field-hint">{{ hint }}</span>
    <span v-else class="field-hint">{{ modelValue.length }} выбрано</span>
  </div>
</template>

<style scoped>
@import '../fields.css';

.multiselect-box {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  cursor: default;
}

.multiselect-box.disabled {
  cursor: not-allowed;
}

.multiselect-option {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.6rem;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  color: inherit;
  font-family: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.multiselect-option:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.12);
}

.multiselect-option.selected {
  border-color: #54e46c;
  background: rgba(156, 216, 164, 0.2);
}

.multiselect-option:disabled {
  cursor: not-allowed;
}

.multiselect-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  font-size: 1rem;
  color: #ffffff;
}

.multiselect-placeholder {
  opacity: 0.5;
  font-size: 0.95rem;
}

@media (prefers-color-scheme: light) {
  .multiselect-option {
    border-color: rgba(0, 0, 0, 0.2);
    background: rgba(0, 0, 0, 0.04);
  }
  .multiselect-option:hover:not(:disabled) {
    border-color: rgba(0, 0, 0, 0.3);
    background: rgba(0, 0, 0, 0.08);
  }
  .multiselect-option.selected {
    border-color: #646cff;
    background: rgba(100, 108, 255, 0.12);
  }
}
</style>
