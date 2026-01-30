<script lang="ts" setup>
import { ref } from 'vue';
type Props = {
  isActive?: boolean;
  label?: string;
  hasLabel?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  label: 'Switch',
  hasLabel: false,
});
const isActive = ref(props.isActive);
</script>

<template>
  <div class="switch-container">
    <div
      class="switch"
      :class="{ active: isActive }"
      @click="isActive = !isActive"
      role="switch"
      :aria-checked="isActive"
    >
      <div class="switch-toggle"></div>
    </div>
    <label v-if="hasLabel" class="switch-label">{{ label }}</label>
  </div>
</template>

<style scoped>
.switch-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.switch {
  position: relative;
  width: 50px;
  height: 28px;
  background-color: #ccc;
  border-radius: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.switch.active {
  background-color: #646cff;
}

.switch-toggle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 24px;
  height: 24px;
  background-color: white;
  border-radius: 50%;
  transition: left 0.3s;
}

.switch.active .switch-toggle {
  left: 24px;
}

.switch-label {
  margin: 0;
  cursor: pointer;
}
</style>