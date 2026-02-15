<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { usePermissions } from "../../composables/usePermissions";

const router = useRouter();
const auth = useAuthStore();
const {
  canViewUsersList,
  canViewTeamsList,
  canAccessRoles,
  canExecuteHHSearch,
} = usePermissions();
const isOpen = ref(false);

const isAuthenticated = computed(() => auth.isAuthenticated);

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

function closeMenu() {
  isOpen.value = false;
}

function goTo(path: string) {
  closeMenu();
  router.push(path);
}

function logout() {
  closeMenu();
  auth.logout();
}
</script>

<template>
  <div class="app-menu">
    <button
      type="button"
      class="menu-button"
      :aria-expanded="isOpen ? 'true' : 'false'"
      aria-label="Меню"
      @click="toggleMenu"
    >
      <span class="menu-icon">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </button>
    <div v-if="isOpen" class="menu-dropdown">
      <nav class="menu-nav">
        <button type="button" class="menu-item" @click="goTo('/')">
          Главная
        </button>
        <button
          v-if="isAuthenticated && canExecuteHHSearch"
          type="button"
          class="menu-item menu-item-primary"
          @click="goTo('/hh-search')"
        >
          Поиск кандидатов и вакансий
        </button>
        <button
          v-if="isAuthenticated && canViewUsersList"
          type="button"
          class="menu-item"
          @click="goTo('/users')"
        >
          Пользователи
        </button>
        <button
          v-if="isAuthenticated && canViewTeamsList"
          type="button"
          class="menu-item"
          @click="goTo('/teams')"
        >
          Команды
        </button>
        <button
          v-if="isAuthenticated && canAccessRoles"
          type="button"
          class="menu-item"
          @click="goTo('/roles')"
        >
          Роли
        </button>
        <button type="button" class="menu-item" @click="goTo('/account')">
          Аккаунт
        </button>
      </nav>
      <template v-if="isAuthenticated">
        <div class="menu-divider" />
        <button type="button" class="menu-item menu-item-logout" @click="logout">
          Выход
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.app-menu {
  position: relative;
}

.menu-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: background 0.2s, border-color 0.2s;
}

.menu-button:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.4);
}

.menu-icon {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
}

.menu-icon span {
  width: 16px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
}

.menu-dropdown {
  position: absolute;
  right: 0;
  top: 46px;
  min-width: 180px;
  padding: 8px 0;
  border-radius: 8px;
  background: #242424;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  z-index: 20;
}

.menu-nav {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  background: none;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.menu-item-logout {
  color: #e74c3c;
}

.menu-item-logout:hover {
  background: rgba(231, 76, 60, 0.15);
}

.menu-item-primary {
  font-weight: 500;
  color: #646cff;
}
.menu-item-primary:hover {
  background: rgba(100, 108, 255, 0.12);
}

.menu-divider {
  height: 1px;
  margin: 4px 0;
  background: rgba(255, 255, 255, 0.1);
}
</style>

