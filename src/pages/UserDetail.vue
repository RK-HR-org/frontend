<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUsers } from "../composables/useUsers";
import { usePermissions } from "../composables/usePermissions";

const route = useRoute();
const router = useRouter();

const {
  selectedUser,
  loadingUser,
  error,
  getUserById,
  deleteUser,
} = useUsers();

const { canEditUsers, canDeleteUsers } = usePermissions();

const userId = computed(() => route.params.userId);
const formError = ref("");
const formSubmitting = ref(false);

async function loadUser() {
  const id = userId.value;
  if (!id) return;
  formError.value = "";
  try {
    await getUserById(id);
  } catch (err) {
    if (err?.response?.status !== 404) {
      formError.value = parseApiError(err);
    }
  }
}

onMounted(() => {
  loadUser();
});

watch(userId, (newId) => {
  if (newId) loadUser();
});

function goBack() {
  router.push({ name: "Users" });
}

function parseApiError(err) {
  const msg = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.message ?? "Ошибка.";
  return typeof msg === "string" ? msg : JSON.stringify(msg);
}

function goToEdit() {
  router.push({ name: "Users", query: { edit: userId.value } });
}

async function confirmDelete() {
  if (!selectedUser.value?.id) return;
  if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) return;
  formError.value = "";
  try {
    formSubmitting.value = true;
    await deleteUser(selectedUser.value.id);
    goBack();
  } catch (err) {
    formError.value = parseApiError(err);
  } finally {
    formSubmitting.value = false;
  }
}
</script>

<template>
  <div class="page-container user-detail-page">
    <header class="page-header">
      <button type="button" class="btn btn-secondary" @click="goBack">
        Назад к списку пользователей
      </button>
    </header>

    <div v-if="loadingUser && !selectedUser" class="loading">
      <p>Загрузка пользователя...</p>
    </div>

    <div
      v-else-if="error?.response?.status === 404 || (!loadingUser && userId && !selectedUser)"
      class="not-found"
    >
      <p>Пользователь не найден.</p>
      <router-link to="/users" class="btn btn-secondary">К списку пользователей</router-link>
    </div>

    <template v-else-if="selectedUser">
      <p v-if="formError" class="form-error">{{ formError }}</p>

      <section class="user-info">
        <h1>{{ [selectedUser.first_name, selectedUser.last_name].filter(Boolean).join(" ") || selectedUser.email }}</h1>
        <dl class="user-details">
          <dt>Email</dt>
          <dd>{{ selectedUser.email }}</dd>
          <dt>Имя</dt>
          <dd>{{ selectedUser.first_name ?? "—" }}</dd>
          <dt>Фамилия</dt>
          <dd>{{ selectedUser.last_name ?? "—" }}</dd>
          <dt>Роль</dt>
          <dd>{{ selectedUser.role?.name ?? "—" }}</dd>
          <dt>Статус</dt>
          <dd>{{ selectedUser.status ?? "—" }}</dd>
          <dt>Команды</dt>
          <dd>{{ selectedUser.teams?.map((t) => t.name).join(", ") || "—" }}</dd>
          <dt>Дата создания</dt>
          <dd>{{ selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : "—" }}</dd>
        </dl>
      </section>

      <section v-if="canEditUsers || canDeleteUsers" class="section actions-section">
        <h2>Действия</h2>
        <div class="actions">
          <button
            v-if="canEditUsers"
            type="button"
            class="btn btn-primary"
            @click="goToEdit"
          >
            Изменить
          </button>
          <button
            v-if="canDeleteUsers"
            type="button"
            class="btn btn-delete"
            :disabled="formSubmitting"
            @click="confirmDelete"
          >
            {{ formSubmitting ? "Удаление…" : "Удалить" }}
          </button>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.user-info {
  margin-bottom: 32px;
}

.user-info h1 {
  margin: 0 0 16px 0;
  font-size: 1.75rem;
}

.user-details {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 24px;
  margin: 0;
}

.user-details dt {
  margin: 0;
  font-weight: 600;
  color: var(--text-secondary, #666);
}

.user-details dd {
  margin: 0;
}

.loading,
.not-found {
  text-align: center;
  padding: 40px;
  opacity: 0.9;
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.not-found a {
  text-decoration: none;
}

.form-error {
  color: #e74c3c;
  font-size: 0.9rem;
  margin: 0 0 16px 0;
}

.section {
  margin-bottom: 32px;
}

.section h2 {
  margin: 0 0 16px 0;
  font-size: 1.2rem;
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
