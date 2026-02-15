<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { API_URL } from "../api/api";

const route = useRoute();

onMounted(() => {
  const query = route.fullPath.includes("?")
    ? route.fullPath.slice(route.fullPath.indexOf("?"))
    : "";
  const callbackUrl = `${API_URL}/v1/hh/oauth/callback${query}`;
  window.location.href = callbackUrl;
});
</script>

<template>
  <div class="page-container callback-page">
    <p>Перенаправление для завершения авторизации HH…</p>
  </div>
</template>

<style scoped>
.callback-page {
  padding: 2rem;
  text-align: center;
}
</style>
