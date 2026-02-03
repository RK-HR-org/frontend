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
  showValue: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue']);

function onInput(event) {
  const value = parseFloat(event.target.value);
  emit('update:modelValue', Number.isNaN(value) ? 0 : value);
}
</script>

<template>
  <div class="field-wrapper slider-field">
    <div v-if="label || showValue" class="slider-header">
      <label v-if="label" class="field-label" :for="name || undefined">
        {{ label }}
      </label>
      <span v-if="showValue" class="slider-value">{{ modelValue }}</span>
    </div>
    <div class="slider-track-wrap">
      <input
        :id="name || undefined"
        :name="name"
        type="range"
        :value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        class="slider-input"
        :class="{ 'has-error': !!error }"
        :style="{ '--percent': ((modelValue - min) / (max - min)) * 100 }"
        @input="onInput"
      />
    </div>
    <span v-if="error" class="field-error">{{ error }}</span>
    <span v-else-if="hint" class="field-hint">{{ hint }}</span>
  </div>
</template>

<style scoped>
@import '../fields.css';

.slider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.slider-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #646cff;
}

.slider-track-wrap {
  position: relative;
  width: 100%;
}

.slider-input {
  width: 100%;
  height: 0.5rem;
  padding: 0;
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  border-radius: 999px;
  cursor: pointer;
}

.slider-input::-webkit-slider-runnable-track {
  height: 0.5rem;
  background: linear-gradient(
    to right,
    #646cff 0%,
    #646cff calc(var(--percent, 0) * 1%),
    rgba(255, 255, 255, 0.15) calc(var(--percent, 0) * 1%),
    rgba(255, 255, 255, 0.15) 100%
  );
  border-radius: 999px;
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: -0.375rem;
  border: 2px solid #646cff;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  transition: transform 0.15s;
}

.slider-input::-moz-range-track {
  height: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 999px;
}

.slider-input::-moz-range-progress {
  height: 0.5rem;
  background: #646cff;
  border-radius: 999px;
}

.slider-input::-moz-range-thumb {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #646cff;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  transition: transform 0.15s;
}

.slider-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.slider-input.has-error::-webkit-slider-runnable-track {
  background: linear-gradient(
    to right,
    #e74c3c 0%,
    #e74c3c calc(var(--percent, 0) * 1%),
    rgba(231, 76, 60, 0.2) calc(var(--percent, 0) * 1%),
    rgba(231, 76, 60, 0.2) 100%
  );
}

.slider-input.has-error::-webkit-slider-thumb {
  border-color: #e74c3c;
}

.slider-input.has-error::-moz-range-thumb {
  border-color: #e74c3c;
}

@media (prefers-color-scheme: light) {
  .slider-input::-webkit-slider-runnable-track {
    background: linear-gradient(
      to right,
      #646cff 0%,
      #646cff calc(var(--percent, 0) * 1%),
      rgba(0, 0, 0, 0.1) calc(var(--percent, 0) * 1%),
      rgba(0, 0, 0, 0.1) 100%
    );
  }
  .slider-input::-webkit-slider-thumb {
    background: #fff;
  }
  .slider-input::-moz-range-track {
    background: rgba(0, 0, 0, 0.1);
  }
}
</style>
