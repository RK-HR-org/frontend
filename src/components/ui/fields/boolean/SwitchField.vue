<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: 'switch',
  },
});

const emit = defineEmits(['update:modelValue']);

const inputId = computed(() => props.name || `switch-${Math.random().toString(36).slice(2)}`);

function toggle() {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue);
  }
}
</script>

<template>
  <div class="field-wrapper switch-field">
    <div class="switch-row" :class="{ disabled }">
      <button
        :id="inputId"
        type="button"
        role="switch"
        :aria-checked="modelValue"
        :disabled="disabled"
        class="switch-track"
        :class="{ active: modelValue, 'has-error': !!error }"
        @click="toggle"
      >
        <span class="switch-thumb" />
      </button>
      <label v-if="label" class="field-label switch-label" :for="inputId">
        {{ label }}
      </label>
    </div>
    <span v-if="error" class="field-error">{{ error }}</span>
  </div>
</template>

<style scoped>
@import '../fields.css';

.switch-field {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
}

.switch-row {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.switch-row.disabled {
  opacity: 0.6;
}

.switch-track {
  position: relative;
  width: 2.75rem;
  height: 1.5rem;
  padding: 0;
  border: none;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.switch-track:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.3);
}

.switch-track:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.3);
}

.switch-track.active {
  background-color: #646cff;
}

.switch-track.active:hover:not(:disabled) {
  background-color: #535bf2;
}

.switch-track.has-error {
  background-color: rgba(231, 76, 60, 0.5);
}

.switch-thumb {
  position: absolute;
  top: 0.15rem;
  left: 0.15rem;
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  background-color: #fff;
  transition: transform 0.2s;
  pointer-events: none;
}

.switch-track.active .switch-thumb {
  transform: translateX(1.25rem);
}

.switch-label {
  margin: 0;
  cursor: pointer;
}

@media (prefers-color-scheme: light) {
  .switch-track {
    background-color: rgba(0, 0, 0, 0.15);
  }
  .switch-track:hover:not(:disabled) {
    background-color: rgba(0, 0, 0, 0.25);
  }
}
</style>
