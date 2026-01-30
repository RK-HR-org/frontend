<script lang="ts" setup>
import { ref } from 'vue';
type Props = {
  isChecked?: boolean;
  label?: string;
  hasLabel?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  isChecked: false,
  label: 'Checkbox',
  hasLabel: false,
});
const isChecked = ref(props.isChecked);

</script>
<template>
  <div class="checkbox-container">
    <input
      type="checkbox"
      :checked="isChecked"
      @change="isChecked = !isChecked"
      id="checkbox"
    />
    <label v-if="hasLabel" for="checkbox">{{ label }}</label>
  </div>
</template>
<style scoped>
.checkbox-container {
  display: flex;
  align-items: center;
}

.checkbox-container label {
  margin-left: 0.5rem;
}
</style>

