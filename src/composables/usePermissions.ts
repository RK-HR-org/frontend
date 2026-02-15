import { computed } from "vue";
import { useAuthStore } from "../stores/auth";
import type { PermissionType } from "../types";

/** Имя роли суперадминистратора (по OpenAPI: SUPERADMIN). */
export const ROLE_SUPERADMIN = "SUPERADMIN";

/**
 * Composable для проверки прав доступа (Variant B: по роли и teams с is_manager).
 * Эффективные права с бэкенда в UserResponse не приходят — суперадмин считается по имени роли,
 * остальные действия ограничиваются известными правилами (Роли, права/квоты команды только для superadmin).
 */
export function usePermissions() {
  const auth = useAuthStore();

  const user = computed(() => auth.user);
  const roleName = computed(() => auth.user?.role?.name?.toUpperCase() ?? "");

  const isSuperadmin = computed(() => roleName.value === ROLE_SUPERADMIN);

  /** Доступ к странице «Роли» и управлению ролями (по API только superadmin). */
  const canAccessRoles = computed(() => isSuperadmin.value);

  /** Просмотр списка пользователей. Бэкенд вернёт 403 при отсутствии права. */
  const canViewUsersList = computed(() => !!user.value);

  /** Просмотр деталей пользователя. Бэкенд вернёт 403/404 при отсутствии права. */
  const canViewUserDetails = computed(() => !!user.value);

  /** Добавление пользователей. Без API прав — только superadmin. */
  const canAddUsers = computed(() => isSuperadmin.value);

  /** Редактирование пользователей. Без API прав — только superadmin. */
  const canEditUsers = computed(() => isSuperadmin.value);

  /** Удаление пользователей. Без API прав — только superadmin. */
  const canDeleteUsers = computed(() => isSuperadmin.value);

  /** Просмотр списка команд. Бэкенд вернёт 403 при отсутствии права. */
  const canViewTeamsList = computed(() => !!user.value);

  /** Просмотр деталей команды. Бэкенд вернёт 403 при отсутствии права. */
  const canViewTeamDetails = computed(() => !!user.value);

  /** Создание команды. По API — по правам; без прав в user — только superadmin. */
  const canCreateTeam = computed(() => isSuperadmin.value);

  /** Редактирование команды: superadmin или менеджер этой команды. */
  function canEditTeam(teamId: string | undefined): boolean {
    if (!user.value || !teamId) return false;
    if (isSuperadmin.value) return true;
    const team = user.value.teams?.find((t) => String(t.id) === String(teamId));
    return team?.is_manager === true;
  }

  /** Удаление команды. По API только superadmin. */
  const canDeleteTeam = computed(() => isSuperadmin.value);

  /** Управление правами команды (по API только superadmin). */
  const canManageTeamPermissions = computed(() => isSuperadmin.value);

  /** Управление лимитами квот команды (по API только superadmin). */
  const canManageTeamQuotas = computed(() => isSuperadmin.value);

  /** Выполнение HH-поиска. Бэкенд отфильтрует команды по праву execute_hh_search. */
  const canExecuteHHSearch = computed(() => !!user.value);

  /** Является ли пользователь менеджером указанной команды. */
  function isManagerOf(teamId: string | undefined): boolean {
    if (!user.value || !teamId) return false;
    const team = user.value.teams?.find((t) => String(t.id) === String(teamId));
    return team?.is_manager === true;
  }

  /**
   * Проверка наличия права для маршрута (для router guard).
   * meta.requiresPermission = 'view_users_list' | 'view_teams_list' | ... | 'superadmin'
   */
  function hasPermissionForRoute(
    permission: PermissionType | "superadmin" | undefined,
  ): boolean {
    if (!permission) return true;
    if (permission === "superadmin") return isSuperadmin.value;
    switch (permission) {
      case "view_users_list":
        return canViewUsersList.value;
      case "view_teams_list":
        return canViewTeamsList.value;
      case "view_team_details":
        return canViewTeamDetails.value;
      case "execute_hh_search":
        return canExecuteHHSearch.value;
      case "view_user_details":
        return canViewUserDetails.value;
      default:
        return true;
    }
  }

  return {
    user,
    roleName,
    isSuperadmin,
    canAccessRoles,
    canViewUsersList,
    canViewUserDetails,
    canAddUsers,
    canEditUsers,
    canDeleteUsers,
    canViewTeamsList,
    canViewTeamDetails,
    canCreateTeam,
    canEditTeam,
    canDeleteTeam,
    canManageTeamPermissions,
    canManageTeamQuotas,
    canExecuteHHSearch,
    isManagerOf,
    hasPermissionForRoute,
  };
}
