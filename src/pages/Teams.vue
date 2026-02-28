<script setup>
import { onMounted, ref, reactive } from "vue";
import { useUsers } from "../composables/useUsers";
import TextInputField from "../components/ui/fields/text/TextInputField.vue";

const {
  teams,
  error,
  loading,
  fetchTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} = useUsers();

onMounted(() => {
  fetchTeams();
});

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const selectedTeam = ref(null);

const formCreate = reactive({ name: "" });
const formEdit = reactive({ name: "" });
const formError = ref("");
const formSubmitting = ref(false);

function openCreate() {
  formCreate.name = "";
  formError.value = "";
  showCreateModal.value = true;
}

function openEdit(team) {
  selectedTeam.value = team;
  formEdit.name = team.name ?? "";
  formError.value = "";
  showEditModal.value = true;
}

function openDelete(team) {
  selectedTeam.value = team;
  formError.value = "";
  showDeleteModal.value = true;
}

function closeModals() {
  showCreateModal.value = false;
  showEditModal.value = false;
  showDeleteModal.value = false;
  selectedTeam.value = null;
  formError.value = "";
}

function parseApiError(err) {
  const msg = err?.response?.data?.detail ?? err?.response?.data?.message ?? err?.message ?? "Ошибка.";
  return typeof msg === "string" ? msg : JSON.stringify(msg);
}

async function submitCreate() {
  formError.value = "";
  if (!formCreate.name?.trim()) {
    formError.value = "Введите название команды.";
    return;
  }
  try {
    formSubmitting.value = true;
    await createTeam({ name: formCreate.name.trim() });
    closeModals();
  } catch (err) {
    formError.value = parseApiError(err);
  } finally {
    formSubmitting.value = false;
  }
}

async function submitEdit() {
  formError.value = "";
  if (!selectedTeam.value?.id) return;
  if (!formEdit.name?.trim()) {
    formError.value = "Введите название команды.";
    return;
  }
  try {
    formSubmitting.value = true;
    await updateTeam(selectedTeam.value.id, { name: formEdit.name.trim() });
    closeModals();
  } catch (err) {
    formError.value = parseApiError(err);
  } finally {
    formSubmitting.value = false;
  }
}

async function submitDelete() {
  formError.value = "";
  if (!selectedTeam.value?.id) return;
  try {
    formSubmitting.value = true;
    await deleteTeam(selectedTeam.value.id);
    closeModals();
  } catch (err) {
    formError.value = parseApiError(err);
  } finally {
    formSubmitting.value = false;
  }
}
</script>

<template>
  <div class="teams-page">
    <header class="page-header">
      <h1>Команды</h1>
      <button type="button" class="btn btn-primary" @click="openCreate">
        Добавить команду
      </button>
    </header>

    <div v-if="error" class="error-message">
      <p>{{ error?.response?.data?.detail ?? error?.response?.data?.message ?? error?.message ?? error }}</p>
    </div>

    <div v-if="loading" class="loading">
      <p>Загрузка списка команд...</p>
    </div>

    <div v-else-if="!teams?.length" class="no-data">
      <p>Нет команд. Добавьте первую.</p>
    </div>

    <div v-else class="table-wrap">
      <table class="teams-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>ID</th>
            <th>Дата создания</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="team in teams" :key="team.id">
            <td>{{ team.name }}</td>
            <td class="team-id">{{ team.id }}</td>
            <td>{{ team.created_at }}</td>
            <td class="actions">
              <button type="button" class="btn btn-sm btn-edit" @click="openEdit(team)">
                Изменить
              </button>
              <button type="button" class="btn btn-sm btn-delete" @click="openDelete(team)">
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
        <h2>Новая команда</h2>
        <form @submit.prevent="submitCreate" class="modal-form">
          <TextInputField
            v-model="formCreate.name"
            label="Название"
            required
            placeholder="Введите название команды"
          />
          <p v-if="formError" class="form-error">{{ formError }}</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModals">
              Отмена
            </button>
            <button type="submit" class="btn btn-primary" :disabled="formSubmitting">
              {{ formSubmitting ? "Сохранение…" : "Создать" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно: редактирование -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal">
        <h2>Редактировать команду</h2>
        <form @submit.prevent="submitEdit" class="modal-form">
          <TextInputField
            v-model="formEdit.name"
            label="Название"
            required
            placeholder="Введите название команды"
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
        <h2>Удалить команду?</h2>
        <p v-if="selectedTeam" class="delete-target">
          {{ selectedTeam.name }} ({{ selectedTeam.id }})
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
.teams-page {
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

.teams-table {
  width: 100%;
  border-collapse: collapse;
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

.team-id {
  font-family: monospace;
  font-size: 0.9em;
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
