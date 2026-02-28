<script setup>
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
  <div class="account-container">
    <h1>Информация об аккаунте</h1>

    <div v-if="error" class="error-message">
      <p>Ошибка при загрузке данных: {{ error?.message ?? error }}</p>
    </div>

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

    <div class="teams-section">
      <h2>Мои команды</h2>
      <div v-if="loading" class="loading">
        <p>Загрузка...</p>
      </div>
      <div v-else-if="!teams?.length" class="no-data">
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
            <td class="team-name">{{ team.name }}</td>
            <td class="team-id">{{ team.id }}</td>
            <td class="team-created">{{ team.created_at }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.account-container {
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
}

h2 {
  margin-top: 30px;
  margin-bottom: 20px;
  font-size: 1.3em;
}

.error-message {
  background-color: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #e74c3c;
}

.loading {
  text-align: center;
  padding: 40px;
  opacity: 0.8;
}

.no-data {
  text-align: center;
  padding: 20px;
  opacity: 0.7;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.current-user-section {
  margin-bottom: 40px;
}

.user-card {
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #646cff;
  background: rgba(255, 255, 255, 0.05);
}

.user-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.user-info p {
  margin: 0;
}

.user-info strong {
  opacity: 0.9;
}

.teams-section {
  margin-bottom: 40px;
}

.teams-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  overflow: hidden;
}

.teams-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.teams-table td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.teams-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.team-id,
.team-created,
.team-name {
  font-size: 0.95em;
}
</style>
