<script setup>
defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
  label: {
    type: String,
    default: '',
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  step: {
    type: [Number, String],
    default: 1,
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

function onInput(event) {
  const value = parseFloat(event.target.value);
  emit('update:modelValue', Number.isNaN(value) ? 0 : value);
}
</script>

<template>
  <div class="field-wrapper">
    <div v-if="label" class="range-header">
      <label class="field-label" :class="{ required }" :for="name || undefined">
        {{ label }}
      </label>
      <span class="range-value">{{ modelValue }}</span>
    </div>
    <input
      :id="name || undefined"
      :name="name"
      type="range"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      class="range-input"
      :class="{ 'has-error': !!error }"
      @input="onInput"
    />
    <span v-if="error" class="field-error">{{ error }}</span>
    <span v-else-if="hint" class="field-hint">{{ hint }}</span>
  </div>
</template>

<style scoped>
@import '../fields.css';

.range-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.range-value {
  font-size: 0.9rem;
  font-weight: 500;
  opacity: 0.9;
}

.range-input {
  width: 100%;
  height: 0.5rem;
  padding: 0;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  cursor: pointer;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  border: none;
  border-radius: 50%;
  background: #646cff;
  cursor: pointer;
  transition: transform 0.15s;
}

.range-input::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.range-input::-moz-range-thumb {
  width: 1.25rem;
  height: 1.25rem;
  border: none;
  border-radius: 50%;
  background: #646cff;
  cursor: pointer;
  transition: transform 0.15s;
}

.range-input::-moz-range-thumb:hover {
  transform: scale(1.1);
}

.range-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.range-input.has-error {
  --thumb-color: #e74c3c;
}

.range-input.has-error::-webkit-slider-thumb {
  background: #e74c3c;
}

.range-input.has-error::-moz-range-thumb {
  background: #e74c3c;
}

@media (prefers-color-scheme: light) {
  .range-input {
    background: rgba(0, 0, 0, 0.1);
  }
}
</style>
