<script setup lang="ts">
import { computed } from "vue";

export interface SuggestOption {
  value: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    query: string;
    suggestions: SuggestOption[];
    loading?: boolean;
    label?: string;
    placeholder?: string;
    minChars?: number;
    labelsMap?: Record<string, string>;
  }>(),
  {
    loading: false,
    label: "",
    placeholder: "Введите для поиска...",
    minChars: 2,
    labelsMap: () => ({}),
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string[]];
  "update:query": [value: string];
  add: [opt: SuggestOption];
}>();

function getLabel(id: string): string {
  return props.labelsMap[id] ?? id;
}

function onInput(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  emit("update:query", value);
}

function onSelect(opt: SuggestOption) {
  if (!props.modelValue.includes(opt.value)) {
    emit("add", opt);
    emit("update:query", "");
  }
}

function remove(id: string) {
  const next = props.modelValue.filter((x) => x !== id);
  emit("update:modelValue", next);
}

const showSuggestions = computed(
  () =>
    props.suggestions.length > 0 &&
    props.query.trim().length >= props.minChars
);
</script>

<template>
  <div class="field-wrapper">
    <label v-if="label" class="field-label">{{ label }}</label>
    <div class="tags-autocomplete">
      <div class="tags-row">
        <span
          v-for="id in modelValue"
          :key="id"
          class="field-tag"
        >
          {{ getLabel(id) }}
          <button
            type="button"
            class="field-tag-remove"
            aria-label="Удалить"
            @click="remove(id)"
          >
            ×
          </button>
        </span>
        <input
          :value="query"
          type="text"
          class="field-input-base tags-input"
          :placeholder="placeholder"
          autocomplete="off"
          @input="onInput"
        />
      </div>
      <span v-if="loading" class="tags-loading">Загрузка…</span>
      <div v-else-if="showSuggestions" class="tags-suggestions">
        <button
          v-for="opt in suggestions"
          :key="opt.value"
          type="button"
          class="tags-suggest-item"
          :disabled="modelValue.includes(opt.value)"
          @click="onSelect(opt)"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "../fields.css";

.tags-autocomplete {
  position: relative;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  min-height: 2.75rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
}

.tags-row:focus-within {
  border-color: #646cff;
  box-shadow: 0 0 0 3px rgba(100, 108, 255, 0.2);
}

.tags-input {
  flex: 1;
  min-width: 8rem;
  min-height: unset;
  padding: 0.25rem 0.5rem;
  border: none;
  background: transparent;
  box-shadow: none;
}

.tags-input:focus {
  box-shadow: none;
}

.tags-loading {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.tags-suggestions {
  position: absolute;
  z-index: 10;
  margin-top: 4px;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: var(--bg-fields, #1a1a1a);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 4px;
}

.tags-suggest-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 0.95rem;
}

.tags-suggest-item:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
}

.tags-suggest-item:disabled {
  opacity: 0.6;
  cursor: default;
}

@media (prefers-color-scheme: light) {
  .tags-row {
    border-color: rgba(0, 0, 0, 0.15);
    background-color: #fff;
  }
  .tags-tag {
    background: rgba(0, 0, 0, 0.08);
  }
  .tags-suggestions {
    background: #fff;
    border-color: rgba(0, 0, 0, 0.15);
  }
  .tags-suggest-item:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.06);
  }
}
</style>
