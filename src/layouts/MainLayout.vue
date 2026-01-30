<script lang="ts" setup>
import { useAuth } from "../composables/useAuth";

const { isAuthenticated, logout } = useAuth();
</script>

<template>
  <div class="app-container">
    <div class="app-header">
      <div class="header-links">
        <router-link to="/">Home</router-link>
        <router-link v-if="isAuthenticated" to="/users">Users</router-link>
        <router-link to="/account">Account</router-link>
      </div>
      <div class="header-auth">
        <router-link v-if="!isAuthenticated" to="/login" class="login-link">
          Вход
        </router-link>
        <button v-else @click="logout" class="logout-button">Выход</button>
      </div>
    </div>
    <div class="app-body">
      <router-view></router-view>
    </div>
    <div class="app-footer">
      <div class="footer-links">
        <router-link to="/">Home</router-link>
        <router-link v-if="isAuthenticated" to="/users">Users</router-link>
        <router-link to="/account">Account</router-link>
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

.app-header {
  background-color: #333;
  color: #fff;
  padding: 10px 20px;
  flex-shrink: 0;
  border-bottom: 1px solid #555;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-links,
.footer-links {
  display: flex;
  gap: 20px;
}

.header-auth {
  display: flex;
  gap: 10px;
}

.app-header a,
.app-footer a {
  color: #fff;
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 3px;
  transition: background-color 0.3s;
}

.app-header a:hover,
.app-footer a:hover {
  background-color: #555;
}

.login-link {
  background-color: #667eea;
  padding: 8px 16px !important;
}

.login-link:hover {
  background-color: #5568d3 !important;
}

.logout-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 3px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 0.9em;
}

.logout-button:hover {
  background-color: #c0392b;
}

.app-body {
  padding: 10px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.app-footer {
  background-color: #333;
  color: #fff;
  padding: 10px 20px;
  flex-shrink: 0;
  border-top: 1px solid #555;
}
</style>