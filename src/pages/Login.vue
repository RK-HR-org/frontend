<script lang="ts" setup>
import { ref } from "vue";
import { useAuth } from "../composables/useAuth";

const { login, loading, error } = useAuth();

const email = ref("");
const password = ref("");

const handleLogin = async () => {
  await login(email.value, password.value);
};
</script>

<template>
  <div class="login-container">
    <div class="login-form">
      <h1>Вход в систему</h1>

      <div v-if="error" class="error-message">
        <p>
          Ошибка авторизации:
          {{ error.response?.data?.detail || error.message }}
        </p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Введите ваш email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Введите ваш пароль"
            required
          />
        </div>

        <button type="submit" :disabled="loading" class="login-button">
          {{ loading ? "Загрузка..." : "Войти" }}
        </button>
      </form>

      <p class="hint">
        Используйте учетные данные, которые вы получили при регистрации
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-form {
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 1.8em;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  border-left: 4px solid #c33;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.login-button:hover:not(:disabled) {
  background-color: #5568d3;
}

.login-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.hint {
  text-align: center;
  color: #999;
  font-size: 0.9em;
  margin-top: 20px;
}
</style>
