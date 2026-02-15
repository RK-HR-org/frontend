<script setup>
import { onMounted, ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTeams } from "../composables/useTeams";
import { useUsers } from "../composables/useUsers";
import { useQuota } from "../composables/useQuota";
import { usePermissions } from "../composables/usePermissions";
import DropdownField from "../components/ui/fields/select/DropdownField.vue";

const route = useRoute();
const router = useRouter();

const {
  selectedTeam,
  teamPermissions,
  loading,
  error,
  getTeamById,
  fetchTeamPermissions,
  addTeamPermission,
  deleteTeamPermission,
} = useTeams();

const { usersList, loadingUsers, fetchUsers } = useUsers();

const { teamLimits, loading: quotaLoading, error: quotaError, getTeamLimits, setTeamLimits, deleteTeamLimits } = useQuota();

const { canManageTeamPermissions, canManageTeamQuotas } = usePermissions();

const formError = ref("");
const formSubmitting = ref(false);
const newPermissionType = ref("");

const teamId = computed(() => route.params.teamId);

const PERMISSION_TYPES = [
  "add_users", "edit_users", "delete_users", "view_users_list", "view_user_details",
  "view_teams_list", "view_team_details", "execute_hh_search", "manage_team_permissions", "manage_team_quotas",
];

const teamPermissionOptions = computed(() =>
  PERMISSION_TYPES.map((v) => ({ value: v, label: v.replace(/_/g, " ") }))
);

const assignedPermissionTypes = computed(() =>
  teamPermissions.value?.permissions?.map((p) => p.permission_type) ?? []
);

const availablePermissionOptions = computed(() =>
  teamPermissionOptions.value.filter(
    (o) => !assignedPermissionTypes.value.includes(o.value)
  )
);

async function loadTeamData() {
  const id = teamId.value;
  if (!id) return;
  formError.value = "";
  try {
    await getTeamById(id);
    if (canManageTeamPermissions.value) {
      await fetchTeamPermissions(id);
    }
    if (canManageTeamQuotas.value) {
      await getTeamLimits(id);
    }
    await fetchUsers({ team_id: id });
  } catch (err) {
    if (err?.response?.status === 404) {
      formError.value = "";
    } else {
      formError.value = parseApiError(err);
    }
  }
}

onMounted(() => {
  loadTeamData();
});

watch(teamId, (newId) => {
  if (newId) loadTeamData();
});

function goBack() {
  router.push({ name: "Teams" });
}

function parseApiError(err) {
  const msg = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.message ?? "Ошибка.";
  return typeof msg === "string" ? msg : JSON.stringify(msg);
}

async function submitAddPermission() {
  const id = teamId.value;
  if (!id || !newPermissionType.value) return;
  formError.value = "";
  try {
    formSubmitting.value = true;
    await addTeamPermission(id, { permission_type: newPermissionType.value });
    newPermissionType.value = "";
  } catch (err) {
    formError.value = parseApiError(err);
  } finally {
    formSubmitting.value = false;
  }
}

async function removePermission(permission_type) {
  const id = teamId.value;
  if (!id) return;
  formError.value = "";
  try {
    formSubmitting.value = true;
    await deleteTeamPermission(id, permission_type);
  } catch (err) {
    formError.value = parseApiError(err);
  } finally {
    formSubmitting.value = false;
  }
}

  async function saveTeamLimits(newHour, newDay) {
  const id = teamId.value;
  if (!id) return;
  formError.value = "";
  try {
    formSubmitting.value = true;
    await setTeamLimits(id, {
      requests_per_hour: newHour,
      requests_per_day: newDay,
    });
  } catch (err) {
    formError.value = parseApiError(err);
  } finally {
    formSubmitting.value = false;
  }
}

async function resetTeamLimits() {
  const id = teamId.value;
  if (!id) return;
  formError.value = "";
  try {
    formSubmitting.value = true;
    await deleteTeamLimits(id);
  } catch (err) {
    formError.value = parseApiError(err);
  } finally {
    formSubmitting.value = false;
  }
}
</script>

<template>
  <div class="page-container team-detail-page">
    <header class="page-header">
      <button type="button" class="btn btn-secondary" @click="goBack">
        Назад к списку команд
      </button>
    </header>

    <div v-if="loading && !selectedTeam" class="loading">
      <p>Загрузка команды...</p>
    </div>

    <div v-else-if="error?.response?.status === 404 || (!loading && teamId && !selectedTeam)" class="not-found">
      <p>Команда не найдена.</p>
      <router-link to="/teams" class="btn btn-secondary">К списку команд</router-link>
    </div>

    <template v-else-if="selectedTeam">
      <section class="team-info">
        <h1>{{ selectedTeam.name }}</h1>
        <p v-if="selectedTeam.description" class="team-description">{{ selectedTeam.description }}</p>
      </section>

      <p v-if="formError" class="form-error">{{ formError }}</p>

      <section v-if="canManageTeamPermissions" class="section permissions-section">
        <h2>Права команды</h2>
        <div class="permissions-list">
          <table v-if="teamPermissions?.permissions?.length" class="mini-table">
            <thead>
              <tr>
                <th>Право</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in teamPermissions.permissions" :key="p.id">
                <td>{{ p.permission_type.replace(/_/g, " ") }}</td>
                <td>
                  <button
                    type="button"
                    class="btn btn-sm btn-delete"
                    :disabled="formSubmitting"
                    @click="removePermission(p.permission_type)"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="no-data-inline">Нет назначенных прав.</p>
        </div>
        <div class="add-permission-row">
          <DropdownField
            v-model="newPermissionType"
            label="Добавить право"
            :options="availablePermissionOptions"
            placeholder="Выберите право"
          />
          <button
            type="button"
            class="btn btn-primary"
            :disabled="!newPermissionType || formSubmitting"
            @click="submitAddPermission"
          >
            Добавить
          </button>
        </div>
      </section>

      <section v-if="canManageTeamQuotas" class="section quota-section">
        <h2>Лимиты квот команды</h2>
        <div v-if="quotaLoading" class="loading-inline">Загрузка лимитов...</div>
        <p v-else-if="quotaError" class="form-error">
          Не удалось загрузить лимиты: {{ quotaError?.message ?? quotaError }}
        </p>
        <div v-else>
          <p v-if="!teamLimits">
            Лимиты не заданы. Будут использоваться глобальные настройки системы.
          </p>
          <p v-else>
            <strong>Запросов в час:</strong> {{ teamLimits.requests_per_hour }}<br />
            <strong>Запросов в день:</strong> {{ teamLimits.requests_per_day }}
          </p>
          <div class="quota-actions">
            <button
              type="button"
              class="btn btn-primary"
              :disabled="formSubmitting"
              @click="() => saveTeamLimits(100, 1000)"
            >
              Установить примерные лимиты (100/1000)
            </button>
            <button
              type="button"
              class="btn btn-delete"
              :disabled="formSubmitting"
              @click="resetTeamLimits"
            >
              Сбросить лимиты
            </button>
          </div>
        </div>
      </section>

      <section class="section users-section">
        <h2>Пользователи команды</h2>
        <div v-if="loadingUsers" class="loading-inline">Загрузка...</div>
        <div v-else-if="!usersList?.length" class="no-data-inline">В команде нет пользователей.</div>
        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Имя</th>
                <th>Роль</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in usersList" :key="user.id">
                <td>{{ user.email }}</td>
                <td>{{ [user.first_name, user.last_name].filter(Boolean).join(" ") || "—" }}</td>
                <td>{{ user.role?.name ?? "—" }}</td>
                <td>{{ user.status ?? "—" }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.team-info {
  margin-bottom: 32px;
}

.team-info h1 {
  margin: 0 0 8px 0;
  font-size: 1.75rem;
}

.team-description {
  margin: 0;
  opacity: 0.9;
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

.permissions-list {
  margin-bottom: 16px;
}

.mini-table,
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.mini-table th,
.mini-table td,
.data-table th,
.data-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.mini-table th,
.data-table th {
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
}

.no-data-inline,
.loading-inline {
  padding: 12px;
  opacity: 0.7;
}

.add-permission-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.add-permission-row :deep(.field-wrapper) {
  flex: 1;
  min-width: 200px;
}

.table-wrap {
  overflow-x: auto;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.data-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #646cff;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #535bf2;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.15);
  color: inherit;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
}

.btn-delete {
  background: rgba(231, 76, 60, 0.3);
  color: #e74c3c;
}

.btn-delete:hover:not(:disabled) {
  background: rgba(231, 76, 60, 0.5);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.85rem;
}
</style>
