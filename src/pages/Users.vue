<script lang="ts" setup>
import { onMounted } from "vue";
import { useUsers } from "../composables/useUsers";

const { currentUser, teams, error, loading, fetchCurrentUser, fetchTeams } =
  useUsers();

onMounted(() => {
  fetchCurrentUser();
  fetchTeams();
});
</script>

<template>
  <div class="users-container">
    <h1>Информация об аккаунте</h1>

    <div v-if="error" class="error-message">
      <p>Ошибка при загрузке данных: {{ error.message }}</p>
    </div>

    <!-- Информация о текущем пользователе -->
    <div class="current-user-section">
      <h2>Ваш профиль</h2>
      <div v-if="loading" class="loading">
        <p>Загрузка...</p>
      </div>
      <div v-else-if="currentUser" class="user-card">
        <div class="user-info">
          <p><strong>Email:</strong> {{ currentUser.email }}</p>
          <p><strong>Роль:</strong> {{ currentUser.role }}</p>
          <p><strong>Статус:</strong> {{ currentUser.status }}</p>
          <p v-if="currentUser.telegram_id">
            <strong>Telegram ID:</strong> {{ currentUser.telegram_id }}
          </p>
          <p><strong>ID:</strong> {{ currentUser.id }}</p>
          <p><strong>Создан:</strong> {{ currentUser.created_at }}</p>
        </div>
      </div>
    </div>

    <!-- Список команд -->
    <div class="teams-section">
      <h2>Мои команды</h2>
      <div v-if="loading" class="loading">
        <p>Загрузка...</p>
      </div>
      <div v-else-if="teams.length === 0" class="no-data">
        <p>Нет доступных команд</p>
      </div>
      <table v-else class="teams-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>ID</th>
            <th>Дата создания</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="team in teams" :key="team.id">
            <td>{{ team.name }}</td>
            <td class="team-id">{{ team.id }}</td>
            <td>{{ team.created_at }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.users-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

h2 {
  color: #555;
  margin-top: 30px;
  margin-bottom: 20px;
  font-size: 1.3em;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  border-left: 4px solid #c33;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #999;
  background-color: #f9f9f9;
  border-radius: 4px;
}

/* Текущий пользователь */
.current-user-section {
  margin-bottom: 40px;
}

.user-card {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 4px;
  border-left: 4px solid #4a90e2;
}

.user-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.user-info p {
  margin: 0;
  color: #333;
}

.user-info strong {
  color: #555;
}

/* Таблица команд */
.teams-section {
  margin-bottom: 40px;
}

.teams-table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.teams-table th {
  background-color: #f5f5f5;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #ddd;
  color: #333;
}

.teams-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.teams-table tbody tr:hover {
  background-color: #f9f9f9;
}

.team-id {
  font-family: monospace;
  font-size: 0.85em;
  color: #999;
}
</style>
