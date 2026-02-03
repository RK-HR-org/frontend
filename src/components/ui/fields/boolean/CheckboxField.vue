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
  required: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: 'checkbox',
  },
});

const emit = defineEmits(['update:modelValue']);

const inputId = computed(() => props.name || `checkbox-${Math.random().toString(36).slice(2)}`);

function onChange(event) {
  emit('update:modelValue', event.target.checked);
}
</script>

<template>
  <div class="field-wrapper checkbox-field">
    <label class="checkbox-row" :class="{ disabled }">
      <input
        :id="inputId"
        type="checkbox"
        :name="name"
        :checked="modelValue"
        :disabled="disabled"
        :required="required"
        class="checkbox-input"
        :class="{ 'has-error': !!error }"
        @change="onChange"
      />
      <span class="checkbox-box" aria-hidden="true">
        <span class="checkbox-check">✓</span>
      </span>
      <span v-if="label" class="field-label checkbox-label">
        <span :class="{ required }">{{ label }}</span>
      </span>
    </label>
    <span v-if="error" class="field-error">{{ error }}</span>
  </div>
</template>

<style scoped>
@import '../fields.css';

.checkbox-field {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
}

.checkbox-row {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-row.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkbox-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

.checkbox-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
  transition: border-color 0.2s, background-color 0.2s;
}

.checkbox-input:hover + .checkbox-box:not(.disabled),
.checkbox-input:focus + .checkbox-box {
  border-color: #646cff;
}

.checkbox-input:checked + .checkbox-box {
  border-color: #646cff;
  background-color: #646cff;
}

.checkbox-input.has-error + .checkbox-box {
  border-color: #e74c3c;
}

.checkbox-check {
  font-size: 0.75rem;
  color: #fff;
  opacity: 0;
  transition: opacity 0.15s;
}

.checkbox-input:checked + .checkbox-box .checkbox-check {
  opacity: 1;
}

.checkbox-label .required::after {
  content: ' *';
  color: #e74c3c;
}

@media (prefers-color-scheme: light) {
  .checkbox-box {
    border-color: rgba(0, 0, 0, 0.25);
    background-color: #fff;
  }
  .checkbox-input:checked + .checkbox-box {
    border-color: #646cff;
    background-color: #646cff;
  }
}
</style>
