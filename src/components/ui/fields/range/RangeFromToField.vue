<script setup lang="ts">
type MaybeNumber = number | null;

const props = defineProps<{
  from: MaybeNumber;
  to: MaybeNumber;
  label?: string;
  fromLabel?: string;
  toLabel?: string;
  fromPlaceholder?: string;
  toPlaceholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
}>();

const emit = defineEmits<{
  (e: "update:from", value: MaybeNumber): void;
  (e: "update:to", value: MaybeNumber): void;
}>();

function onFromInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value === "" ? null : target.valueAsNumber;
  emit("update:from", Number.isNaN(value as number) ? null : value);
}

function onToInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value === "" ? null : target.valueAsNumber;
  emit("update:to", Number.isNaN(value as number) ? null : value);
}
</script>

<template>
  <div class="field-wrapper range-from-to-field">
    <label
      v-if="label"
      class="field-label"
      :class="{ required }"
    >
      {{ label }}
    </label>

    <div class="range-from-to-row">
      <div class="range-from-to-row-item">
        <span class="field-sub-label">
          {{ fromLabel || "От" }}
        </span>
        <input
          type="number"
          class="field-input-base"
          :placeholder="fromPlaceholder"
          :disabled="disabled"
          :value="from ?? ''"
          @input="onFromInput"
        />
      </div>
      <div class="range-from-to-row-item">
        <span class="field-sub-label">
          {{ toLabel || "До" }}
        </span>
        <input
          type="number"
          class="field-input-base"
          :placeholder="toPlaceholder"
          :disabled="disabled"
          :value="to ?? ''"
          @input="onToInput"
        />
      </div>
    </div>

    <span v-if="error" class="field-error">
      {{ error }}
    </span>
    <span v-else-if="hint" class="field-hint">
      {{ hint }}
    </span>
  </div>
</template>

<style scoped>
@import "../fields.css";

.range-from-to-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.range-from-to-col {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.range-from-to-row-item {
  display: flex;
  flex-direction: row;
  align-items: start;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
}

.field-sub-label {
  font-size: 0.8rem;
  opacity: 0.85;
}
</style>

