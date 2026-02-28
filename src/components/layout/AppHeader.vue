<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import { useHHOAuth } from "../../composables/useHHOAuth";
import { usePermissions } from "../../composables/usePermissions";
import AppMenu from "./AppMenu.vue";

const latLogo = new URL("../../assets/lat-logo.svg", import.meta.url).href;
const auth = useAuthStore();
const { canExecuteHHSearch } = usePermissions();
const { balance, balanceLoading, fetchBalance } = useHHOAuth();

const userName = computed(() => {
  const user = auth.user;
  if (!user) return "Гость";
  const parts = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return parts || user.email || "Гость";
});

const formattedBalance = computed(() => {
  const v = balance.value;
  if (v === null || v === undefined) return null;
  return v.toLocaleString("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
});

onMounted(() => {
  if (auth.isAuthenticated && canExecuteHHSearch.value) {
    fetchBalance();
  }
});
</script>

<template>
  <header class="app-header">
    <router-link to="/" class="header-left">
      <div class="brand-logo">
        <img :src="latLogo" alt="Логотип компании" class="logo-image" />
      </div>
      <div class="brand-text">
        <span class="brand-main">ПартКом</span>
        <span class="brand-sub">HR IT</span>
      </div>
    </router-link>
    <div class="header-right">
      <span
        v-if="
          auth.isAuthenticated &&
          canExecuteHHSearch &&
          (balanceLoading || formattedBalance !== null)
        "
        class="hh-balance"
      >
        <template v-if="balanceLoading">—</template>
        <template v-else>Токены: {{ formattedBalance }}</template>
      </span>
      <span class="user-name">{{ userName }}</span>
      <AppMenu />
    </div>
  </header>
</template>

<style scoped>
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

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  color: inherit;
  text-decoration: none;
  transition: opacity 0.2s;
}
.header-left:hover {
  opacity: 0.9;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
}

.logo-image {
  max-width: 100%;
  max-height: 100%;
  display: block;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-main {
  font-weight: 600;
  font-size: 1.05rem;
}

.brand-sub {
  font-size: 0.85rem;
  opacity: 0.8;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hh-balance {
  font-size: 0.9rem;
  opacity: 0.9;
  padding-right: 12px;
  border-right: 1px solid rgba(255, 255, 255, 0.25);
}

.user-name {
  font-size: 0.95rem;
  opacity: 0.9;
}
</style>

