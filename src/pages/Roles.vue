<script setup>
import { onMounted, ref, reactive, computed } from "vue";
import { useRoles } from "../composables/useRoles";
import TextInputField from "../components/ui/fields/text/TextInputField.vue";
import TextAreaField from "../components/ui/fields/text/TextAreaField.vue";
import DropdownField from "../components/ui/fields/select/DropdownField.vue";

const {
  roles,
  rolePermissions,
  error,
  loading,
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  fetchRolePermissions,
  addRolePermission,
  deleteRolePermission,
} = useRoles();

onMounted(() => {
  fetchRoles();
});

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDeleteModal = ref(false);
const showPermissionsModal = ref(false);
const selectedRole = ref(null);

const formCreate = reactive({ name: "", description: "" });
const formEdit = reactive({ name: "", description: "" });
const formError = ref("");
const formSubmitting = ref(false);
const newPermissionType = ref("");

const PERMISSION_TYPES = [
  "add_users",
  "edit_users",
  "delete_users",
  "view_users_list",
  "view_user_details",
  "view_teams_list",
  "view_team_details",
  "execute_hh_search",
  "manage_team_permissions",
  "manage_team_quotas",
];

const permissionOptions = computed(() =>
  PERMISSION_TYPES.map((v) => ({ value: v, label: v.replace(/_/g, " ") }))
);

const assignedPermissionTypes = computed(() =>
  rolePermissions.value?.permissions?.map((p) => p.permission_type) ?? []
);

const availablePermissionOptions = computed(() =>
  permissionOptions.value.filter(
    (o) => !assignedPermissionTypes.value.includes(o.value)
  )
);

function openCreate() {
  formCreate.name = "";
  formCreate.description = "";
  formError.value = "";
  showCreateModal.value = true;
}

function openEdit(role) {
  selectedRole.value = role;
  formEdit.name = role.name ?? "";
  formEdit.description = role.description ?? "";
  formError.value = "";
  showEditModal.value = true;
}

function openDelete(role) {
  selectedRole.value = role;
  formError.value = "";
  showDeleteModal.value = true;
}

async function openPermissions(role) {
  selectedRole.value = role;
  formError.value = "";
  newPermissionType.value = "";
  showPermissionsModal.value = true;
  try {
    await fetchRolePermissions(role.id);
  } catch {
    formError.value = "Не удалось загрузить права.";
  }
}

function closeModals() {
  showCreateModal.value = false;
  showEditModal.value = false;
  showDeleteModal.value = false;
  showPermissionsModal.value = false;
  selectedRole.value = null;
  formError.value = "";
}

function parseApiError(err) {
  const msg =
    err?.response?.data?.detail ??
    err?.response?.data?.message ??
    err?.message ??
    "Ошибка.";
  return typeof msg === "string" ? msg : JSON.stringify(msg);
}

async function submitCreate() {
  formError.value = "";
  if (!formCreate.name?.trim()) {
    formError.value = "Введите название роли.";
    return;
  }
  try {
    formSubmitting.value = true;
    await createRole({
      name: formCreate.name.trim(),
      description: formCreate.description?.trim() || null,
    });
    closeModals();
  } catch (err) {
    formError.value = parseApiError(err);
  } finally {
    formSubmitting.value = false;
  }
}

async function submitEdit() {
  formError.value = "";
  if (!selectedRole.value?.id) return;
  if (!formEdit.name?.trim()) {
    formError.value = "Введите название роли.";
    return;
  }
  try {
    formSubmitting.value = true;
    await updateRole(selectedRole.value.id, {
      name: formEdit.name.trim(),
      description: formEdit.description?.trim() || null,
    });
    closeModals();
  } catch (err) {
    formError.value = parseApiError(err);
  } finally {
    formSubmitting.value = false;
  }
}

async function submitDelete() {
  formError.value = "";
  if (!selectedRole.value?.id) return;
  try {
    formSubmitting.value = true;
    await deleteRole(selectedRole.value.id);
    closeModals();
  } catch (err) {
    formError.value = parseApiError(err);
  } finally {
    formSubmitting.value = false;
  }
}

async function submitAddPermission() {
  if (!selectedRole.value?.id || !newPermissionType.value) return;
  formError.value = "";
  try {
    formSubmitting.value = true;
    await addRolePermission(
      selectedRole.value.id,
      newPermissionType.value
    );
    newPermissionType.value = "";
  } catch (err) {
    formError.value = parseApiError(err);
  } finally {
    formSubmitting.value = false;
  }
}

async function removePermission(permission_type) {
  if (!selectedRole.value?.id) return;
  formError.value = "";
  try {
    formSubmitting.value = true;
    await deleteRolePermission(
      selectedRole.value.id,
      permission_type
    );
  } catch (err) {
    formError.value = parseApiError(err);
  } finally {
    formSubmitting.value = false;
  }
}
</script>

<template>
  <div class="page-container roles-page">
    <header class="page-header">
      <h1>Роли</h1>
      <button type="button" class="btn btn-primary" @click="openCreate">
        Добавить роль
      </button>
    </header>

    <div v-if="error" class="error-message">
      <p>{{ parseApiError(error) }}</p>
    </div>

    <div v-if="loading" class="loading">
      <p>Загрузка списка ролей...</p>
    </div>

    <div v-else-if="!roles?.length" class="no-data">
      <p>Нет ролей. Добавьте первую.</p>
    </div>

    <div v-else class="table-wrap">
      <table class="roles-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Описание</th>
            <th>Системная</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in roles" :key="role.id">
            <td>{{ role.name }}</td>
            <td>{{ role.description ?? "—" }}</td>
            <td>{{ role.is_system ? "Да" : "Нет" }}</td>
            <td class="actions">
              <button type="button" class="btn btn-sm btn-edit" @click="openEdit(role)">
                Изменить
              </button>
              <button type="button" class="btn btn-sm btn-delete" @click="openDelete(role)">
                Удалить
              </button>
              <button type="button" class="btn btn-sm btn-permissions" @click="openPermissions(role)">
                Права
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Модальное окно: создание -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal">
        <h2>Новая роль</h2>
        <form @submit.prevent="submitCreate" class="modal-form">
          <TextInputField
            v-model="formCreate.name"
            label="Название"
            required
            placeholder="Введите название роли"
          />
          <TextAreaField
            v-model="formCreate.description"
            label="Описание"
            placeholder="Введите описание роли"
            :rows="3"
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
        <h2>Редактировать роль</h2>
        <form @submit.prevent="submitEdit" class="modal-form">
          <TextInputField
            v-model="formEdit.name"
            label="Название"
            required
            placeholder="Введите название роли"
          />
          <TextAreaField
            v-model="formEdit.description"
            label="Описание"
            placeholder="Введите описание роли"
            :rows="3"
          />
          <p v-if="selectedRole?.is_system" class="field-hint">Системная роль (нельзя изменить тип).</p>
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
        <h2>Удалить роль?</h2>
        <p v-if="selectedRole" class="delete-target">
          {{ selectedRole.name }} ({{ selectedRole.id }})
        </p>
        <p v-if="selectedRole?.is_system" class="form-error">Системную роль удалить нельзя.</p>
        <p v-else-if="formError" class="form-error">{{ formError }}</p>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="closeModals">
            Отмена
          </button>
          <button
            type="button"
            class="btn btn-delete"
            :disabled="formSubmitting || selectedRole?.is_system"
            @click="submitDelete"
          >
            {{ formSubmitting ? "Удаление…" : "Удалить" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Модальное окно: права роли -->
    <div v-if="showPermissionsModal" class="modal-overlay" @click.self="closeModals">
      <div class="modal modal-wide">
        <h2>Права роли: {{ selectedRole?.name }}</h2>
        <p v-if="formError" class="form-error">{{ formError }}</p>
        <div class="permissions-list">
          <table v-if="rolePermissions?.permissions?.length" class="mini-table">
            <thead>
              <tr>
                <th>Право</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in rolePermissions.permissions" :key="p.id">
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
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="closeModals">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.roles-table {
  width: 100%;
  border-collapse: collapse;
}

.roles-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.roles-table td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.roles-table tbody tr:hover {
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

.btn-permissions {
  background: rgba(100, 108, 255, 0.2);
  color: inherit;
}

.btn-permissions:hover:not(:disabled) {
  background: rgba(100, 108, 255, 0.4);
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

.modal-wide {
  max-width: 560px;
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

.field-hint {
  font-size: 0.85rem;
  opacity: 0.8;
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

.permissions-list {
  margin-bottom: 16px;
}

.mini-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.mini-table th,
.mini-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.mini-table th {
  font-weight: 600;
}

.no-data-inline {
  padding: 12px;
  opacity: 0.7;
}

.add-permission-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.add-permission-row .field-wrapper {
  flex: 1;
  min-width: 200px;
}
</style>
