<script setup>
import { onMounted, ref, reactive, computed } from "vue";
import { useUsers } from "../composables/useUsers";
import TextInputField from "../components/ui/fields/text/TextInputField.vue";
import DropdownField from "../components/ui/fields/select/DropdownField.vue";

const {
  usersList,
  teams,
  error,
  loadingUsers,
  fetchUsers,
  fetchTeams,
  createUser,
  updateUser,
  deleteUser,
} = useUsers();

onMounted(() => {
  fetchUsers();
  fetchTeams();
});

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const selectedUser = ref(null);

const formCreate = reactive({
  email: "",
  password: "",
  role: "user",
  status: "active",
  telegram_id: "",
  team_id: "",
});
const formEdit = reactive({
  email: "",
  role: "user",
  status: "active",
  telegram_id: "",
  team_id: "",
});
const formError = ref("");
const formSubmitting = ref(false);

const roleOptions = [
  { value: "user", label: "Пользователь" },
  { value: "admin", label: "Администратор" },
  { value: "manager", label: "Менеджер" },
];
const statusOptions = [
  { value: "active", label: "Активен" },
  { value: "inactive", label: "Неактивен" },
  { value: "blocked", label: "Заблокирован" },
];

const teamOptions = computed(() => {
  const list = teams.value ?? [];
  if (!list.length) return [];
  return list.map((t) => ({ value: String(t.id), label: t.name || String(t.id) }));
});

function openCreate() {
  const list = teams.value ?? [];
  formCreate.email = "";
  formCreate.password = "";
  formCreate.role = "user";
  formCreate.status = "active";
  formCreate.telegram_id = "";
  formCreate.team_id = list[0] ? String(list[0].id) : "";
  formError.value = list.length ? "" : "Нет доступных команд. Создайте команду в разделе Команды.";
  showCreateModal.value = true;
}

function openEdit(user) {
  const list = teams.value ?? [];
  selectedUser.value = user;
  formEdit.email = user.email ?? "";
  formEdit.role = user.role ?? "user";
  formEdit.status = user.status ?? "active";
  formEdit.telegram_id = user.telegram_id ?? "";
  formEdit.team_id = user.team_id ? String(user.team_id) : (list[0] ? String(list[0].id) : "");
  formError.value = "";
  showEditModal.value = true;
}

function openDelete(user) {
  selectedUser.value = user;
  formError.value = "";
  showDeleteModal.value = true;
}

function closeModals() {
  showCreateModal.value = false;
  showEditModal.value = false;
  showDeleteModal.value = false;
  selectedUser.value = null;
  formError.value = "";
}

async function submitCreate() {
  formError.value = "";
  if (!formCreate.email?.trim()) {
    formError.value = "Введите email.";
    return;
  }
  if (!formCreate.password || formCreate.password.length < 8) {
    formError.value = "Пароль должен быть не менее 8 символов.";
    return;
  }
  if (!formCreate.team_id?.trim()) {
    formError.value = "Выберите команду.";
    return;
  }
  try {
    formSubmitting.value = true;
    await createUser({
      email: formCreate.email.trim(),
      password: formCreate.password,
      role: formCreate.role,
      status: formCreate.status,
      telegram_id: formCreate.telegram_id?.trim() || null,
      team_id: formCreate.team_id.trim(),
    });
    closeModals();
  } catch (err) {
    const msg = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.message ?? "Ошибка создания.";
    formError.value = typeof msg === "string" ? msg : JSON.stringify(msg);
  } finally {
    formSubmitting.value = false;
  }
}

async function submitEdit() {
  formError.value = "";
  if (!selectedUser.value?.id) return;
  if (!formEdit.email?.trim()) {
    formError.value = "Введите email.";
    return;
  }
  try {
    formSubmitting.value = true;
    const editTeamId = formEdit.team_id?.trim();
    if (!editTeamId) {
      formError.value = "Выберите команду.";
      return;
    }
    await updateUser(selectedUser.value.id, {
      email: formEdit.email.trim(),
      role: formEdit.role,
      status: formEdit.status,
      telegram_id: formEdit.telegram_id?.trim() || null,
      team_id: editTeamId,
    });
    closeModals();
  } catch (err) {
    const msg = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.message ?? "Ошибка обновления.";
    formError.value = typeof msg === "string" ? msg : JSON.stringify(msg);
  } finally {
    formSubmitting.value = false;
  }
}

async function submitDelete() {
  formError.value = "";
  if (!selectedUser.value?.id) return;
  try {
    formSubmitting.value = true;
    await deleteUser(selectedUser.value.id);
    closeModals();
  } catch (err) {
    const msg = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.message ?? "Ошибка удаления.";
    formError.value = typeof msg === "string" ? msg : JSON.stringify(msg);
  } finally {
    formSubmitting.value = false;
  }
}
</script>

<template>
  <div class="users-page">
    <header class="page-header">
      <h1>Пользователи</h1>
      <button type="button" class="btn btn-primary" @click="openCreate">
        Добавить пользователя
      </button>
    </header>

    <div v-if="error" class="error-message">
      <p>{{ error?.response?.data?.detail ?? error?.response?.data?.message ?? error?.message ?? error }}</p>
    </div>

    <div v-if="loadingUsers" class="loading">
      <p>Загрузка списка пользователей...</p>
    </div>

    <div v-else-if="!usersList?.length" class="no-data">
      <p>Нет пользователей. Добавьте первого.</p>
    </div>

    <div v-else class="table-wrap">
      <table class="users-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Роль</th>
            <th>Статус</th>
            <th>Telegram ID</th>
            <th>Создан</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in usersList" :key="user.id">
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>{{ user.status }}</td>
            <td>{{ user.telegram_id ?? "—" }}</td>
            <td>{{ user.created_at }}</td>
            <td class="actions">
              <button type="button" class="btn btn-sm btn-edit" @click="openEdit(user)">
                Изменить
              </button>
              <button type="button" class="btn btn-sm btn-delete" @click="openDelete(user)">
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно: создание -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal">
        <h2>Новый пользователь</h2>
        <form @submit.prevent="submitCreate" class="modal-form">
          <TextInputField
            v-model="formCreate.email"
            label="Email"
            type="email"
            required
          />
          <TextInputField
            v-model="formCreate.password"
            label="Пароль"
            type="password"
            required
            hint="Минимум 8 символов"
          />
          <DropdownField
            v-model="formCreate.role"
            label="Роль"
            :options="roleOptions"
          />
          <DropdownField
            v-model="formCreate.status"
            label="Статус"
            :options="statusOptions"
          />
          <DropdownField
            v-model="formCreate.team_id"
            label="Команда"
            :options="teamOptions"
            placeholder="Выберите команду"
            required
          />
          <TextInputField
            v-model="formCreate.telegram_id"
            label="Telegram ID"
          />
          <p v-if="formError" class="form-error">{{ formError }}</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModals">
              Отмена
            </button>
            <button type="submit" class="btn btn-primary" :disabled="formSubmitting || !teamOptions.length">
              {{ formSubmitting ? "Сохранение…" : "Создать" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно: редактирование -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal">
        <h2>Редактировать пользователя</h2>
        <form @submit.prevent="submitEdit" class="modal-form">
          <TextInputField
            v-model="formEdit.email"
            label="Email"
            type="email"
            required
          />
          <DropdownField
            v-model="formEdit.role"
            label="Роль"
            :options="roleOptions"
          />
          <DropdownField
            v-model="formEdit.status"
            label="Статус"
            :options="statusOptions"
          />
          <DropdownField
            v-model="formEdit.team_id"
            label="Команда"
            :options="teamOptions"
            placeholder="Выберите команду"
          />
          <TextInputField
            v-model="formEdit.telegram_id"
            label="Telegram ID"
          />
          <p v-if="formError" class="form-error">{{ formError }}</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModals">
              Отмена
            </button>
            <button type="submit" class="btn btn-primary" :disabled="formSubmitting">
              {{ formSubmitting ? "Сохранение…" : "Сохранить" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно: удаление -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal modal-sm">
        <h2>Удалить пользователя?</h2>
        <p v-if="selectedUser" class="delete-target">
          {{ selectedUser.email }} ({{ selectedUser.id }})
        </p>
        <p v-if="formError" class="form-error">{{ formError }}</p>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="closeModals">
            Отмена
          </button>
          <button type="button" class="btn btn-delete" :disabled="formSubmitting" @click="submitDelete">
            {{ formSubmitting ? "Удаление…" : "Удалить" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.users-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.page-header h1 {
  margin: 0;
}

.error-message {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #e74c3c;
}

.loading,
.no-data {
  text-align: center;
  padding: 40px;
  opacity: 0.9;
}

.no-data {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.table-wrap {
  overflow-x: auto;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.users-table td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.users-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.actions {
  white-space: nowrap;
}

.actions .btn-sm {
  margin-right: 8px;
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

.btn-edit {
  background: rgba(100, 108, 255, 0.3);
  color: inherit;
}

.btn-edit:hover:not(:disabled) {
  background: rgba(100, 108, 255, 0.5);
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

/* Модальные окна */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: #242424;
  border-radius: 12px;
  padding: 24px;
  max-width: 440px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-sm {
  max-width: 360px;
}

.modal h2 {
  margin: 0 0 20px 0;
  font-size: 1.25rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-error {
  color: #e74c3c;
  font-size: 0.9rem;
  margin: 0;
}

.delete-target {
  margin-bottom: 16px;
  opacity: 0.9;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
