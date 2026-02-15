# API CRUD операции - Обновления от 3 февраля 2026

## Обновленные файлы

### 1. [src/stores/auth.ts](src/stores/auth.ts)
**Изменения в типах:**
- ✅ Добавлены интерфейсы `RoleInfo` и `TeamInfo`
- ✅ Обновлен интерфейс `UserResponse`:
  - `role: string` → `role: RoleInfo` (объект с `id` и `name`)
  - `teams: TeamInfo[]` (массив объектов вместо `team_id`)
  - `first_name` и `last_name` (вместо `telegram_id`)
  - Удален `team_id`

### 2. [src/composables/useUsers.ts](src/composables/useUsers.ts)
**Обновления типов:**
- ✅ Добавлены интерфейсы `StatusInfo`
- ✅ Обновлены `UserItem`, `UserCreateRequest`, `UserUpdateRequest`
- ✅ Все интерфейсы синхронизированы с backend API

**Обновления методов CRUD по пользователям:**
- ✅ `updateUser()` переведен с PUT на PATCH метод (`/v1/user/{user_id}`)
- ✅ `createUser()` используется `/v1/auth/register` с полями `role_id`, `team_ids`
- ✅ `fetchUsers()` добавлена поддержка фильтров: `role_id`, `team_id`, `user_status`

**Обновления методов CRUD по командам:**
- ✅ `fetchTeams()` - удален trailing slash (`/v1/team`)
- ✅ `createTeam()` - путь обновлен
- ✅ `updateTeam()` - использует PUT с обновленной структурой
- ✅ `deleteTeam()` - без изменений

**Новые методы справочников:**
- ✅ `fetchRoles()` - получить список ролей из `/v1/roles`
- ✅ `fetchUserStatuses()` - получить статусы из `/v1/static/user-statuses`

**Состояние composable:**
- ✅ Добавлены `roles` и `userStatuses` refs
- ✅ Возвращены новые методы из composable

## API Endpoints

### Авторизация
- `POST /v1/auth/register` - Регистрация с `role_id` и `team_ids`
- `POST /v1/auth/login` - Авторизация
- `POST /v1/auth/refresh` - Обновление токенов
- `POST /v1/auth/logout` - Выход
- `GET /v1/auth/me` - Получить текущего пользователя

### CRUD Команды
- `GET /v1/team` - Получить все команды
- `POST /v1/team` - Создать команду
- `GET /v1/team/{team_id}` - Получить команду по ID
- `PUT /v1/team/{team_id}` - Обновить команду
- `DELETE /v1/team/{team_id}` - Удалить команду

### CRUD Пользователи
- `GET /v1/user` - Получить всех пользователей (с фильтрами: `role_id`, `team_id`, `user_status`)
- `PATCH /v1/user/{user_id}` - Обновить пользователя (вместо PUT!)
- `DELETE /v1/user/{user_id}` - Удалить пользователя

### Справочники
- `GET /v1/roles` - Список ролей
- `GET /v1/static/user-statuses` - Список статусов пользователей

## Миграция существующего кода

При использовании этих компонентов обновите:

```typescript
// ДО
const user = {
  role: "admin",
  team_id: "uuid",
  telegram_id: "123"
}

// ПОСЛЕ
const user = {
  role: { id: "uuid", name: "admin" },
  teams: [{ id: "uuid", name: "HR", ... }],
  first_name: "Ivan",
  last_name: "Ivanov"
}
```

```typescript
// ДО - обновление пользователя
updateUser(userId, payload)  // PUT метод

// ПОСЛЕ - обновление пользователя
updateUser(userId, payload)  // PATCH метод
```

```typescript
// Использование фильтров
const { fetchUsers } = useUsers()

// Получить пользователей по роли
await fetchUsers({ role_id: "role-uuid" })

// Получить пользователей по команде и статусу
await fetchUsers({ team_id: "team-uuid", user_status: "active" })
```
