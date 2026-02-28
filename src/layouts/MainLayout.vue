<script lang="ts" setup>
import AppHeader from "../components/layout/AppHeader.vue";
</script>

<template>
  <div class="app-container">
    <AppHeader />
    <div class="app-body">
      <div class="container">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
}

.app-body {
  padding: 0;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>