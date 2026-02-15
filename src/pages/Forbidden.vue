<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

function goHome() {
  router.push("/");
}

function goBack() {
  router.back();
}
</script>

<template>
  <div class="forbidden page-container">
    <h1>Доступ запрещён</h1>
    <p>У вас недостаточно прав для просмотра этой страницы.</p>
    <div class="actions">
      <button type="button" class="btn btn-primary" @click="goHome">
        На главную
      </button>
      <button type="button" class="btn btn-secondary" @click="goBack">
        Назад
      </button>
    </div>
  </div>
</template>

<style scoped>
.forbidden {
  padding: 2rem;
  text-align: center;
  max-width: 480px;
  margin: 0 auto;
}

.forbidden h1 {
  margin: 0 0 1rem 0;
  font-size: 1.75rem;
}

.forbidden p {
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
