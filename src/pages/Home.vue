<script setup>
import { ref } from 'vue';
import CheckboxField from '../components/ui/fields/boolean/CheckboxField.vue';
import SwitchField from '../components/ui/fields/boolean/SwitchField.vue';
import TextAreaField from '../components/ui/fields/text/TextAreaField.vue';
import DropdownField from '../components/ui/fields/select/DropdownField.vue';

const textValue = ref('');
const acceptTerms = ref(false);
const notifications = ref(false);
const dropdownValue = ref(null);
const dropdownOptions = ref([
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
]);
</script>

<template>
  <div class="home">
    <h1>Welcome to Home</h1>
    <p>This is the home page of the application.</p>
    <CheckboxField v-model="acceptTerms" label="Accept Terms and Conditions" />
    <SwitchField v-model="notifications" name="notifications" label="Enable Notifications" />
    <p>Accept: {{ acceptTerms }}, Notifications: {{ notifications }}</p>
    <DropdownField v-model="dropdownValue" label="Select Item" :options="dropdownOptions" />
    <TextAreaField v-model="textValue" label="Комментарий" placeholder="Enter your text here..." :rows="6" />
    <p>{{ textValue }}</p>
  </div>
</template>

<style scoped>
.home {
  padding: 2rem;
}

.home h1 {
  margin-bottom: 1rem;
}
</style>
