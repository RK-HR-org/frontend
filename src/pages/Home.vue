<script setup>
import Checkbox from '../components/ui/fields/boolean/Checkbox.vue';
import Switch from '../components/ui/fields/boolean/Switch.vue';

</script>

<template>
  <div class="home">
    <h1>Welcome to Home</h1>
    <p>This is the home page of the application.</p>
    <Checkbox :hasLabel="true" label="Accept Terms and Conditions" />
    <Switch name="notifications" label="Enable Notifications" :isOn="false" />
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
