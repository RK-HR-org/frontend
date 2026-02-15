import { ref } from "vue";
import api from "../api/api";
import type {
  RoleResponse,
  RoleCreateUpdate,
  RolePermissionResponse,
  PermissionType,
} from "../types";

export const useRoles = () => {
  const roles = ref<RoleResponse[]>([]);
  const selectedRole = ref<RoleResponse | null>(null);
  const rolePermissions = ref<RolePermissionResponse | null>(null);
  const error = ref<unknown>(null);
  const loading = ref(false);

  const fetchRoles = async () => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get("/v1/role");
      roles.value = Array.isArray(response.data) ? response.data : [];
    } catch (err) {
      error.value = err;
      roles.value = [];
    } finally {
      loading.value = false;
    }
  };

  const getRoleById = async (roleId: string) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await api.get(`/v1/role/${roleId}`);
      selectedRole.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err;
      selectedRole.value = null;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createRole = async (payload: RoleCreateUpdate) => {
    try {
      error.value = null;
      const response = await api.post("/v1/role", payload);
      await fetchRoles();
      return response.data;
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  const updateRole = async (roleId: string, payload: RoleCreateUpdate) => {
    try {
      error.value = null;
      const response = await api.patch(`/v1/role/${roleId}`, payload);
      await fetchRoles();
      return response.data;
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      error.value = null;
      await api.delete(`/v1/role/${roleId}`);
      await fetchRoles();
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  const fetchRolePermissions = async (roleId: string) => {
    try {
      error.value = null;
      const response = await api.get(`/v1/role/${roleId}/permission`);
      rolePermissions.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err;
      rolePermissions.value = null;
      throw err;
    }
  };

  const addRolePermission = async (
    roleId: string,
    permission_type: PermissionType
  ) => {
    try {
      error.value = null;
      await api.post(`/v1/role/${roleId}/permission`, { permission_type });
      await fetchRolePermissions(roleId);
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  const deleteRolePermission = async (
    roleId: string,
    permission_type: PermissionType
  ) => {
    try {
      error.value = null;
      await api.delete(`/v1/role/${roleId}/permission/${permission_type}`);
      await fetchRolePermissions(roleId);
    } catch (err) {
      error.value = err;
      throw err;
    }
  };

  return {
    roles,
    selectedRole,
    rolePermissions,
    error,
    loading,
    fetchRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    fetchRolePermissions,
    addRolePermission,
    deleteRolePermission,
  };
};
