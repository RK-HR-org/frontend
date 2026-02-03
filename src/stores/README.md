Auth store

- File: src/stores/auth.ts

Usage

- Import the store in components/pages:

```ts
import { useAuthStore } from '../stores/auth'
const auth = useAuthStore()
```

- `auth.login(email, password)` — логин, сохраняет токены и загружает `user`.
- `auth.logout()` — логаут, пытается вызвать `/v1/auth/logout` и очищает токены.
- `auth.checkAuth()` — проверяет токен, получает `/v1/auth/me` и обновляет `user`.

State

- `auth.user: UserResponse | null` — данные пользователя (тип `UserResponse` описан в файле).
- `auth.isAuthenticated: boolean` — признак аутентификации.
- `auth.loading: boolean` — флаг загрузки.
- `auth.error: unknown | null` — ошибка.

Notes

- Токены хранятся в `localStorage` (`access_token`, `refresh_token`).
- Централизованный axios находится в `src/api/api.ts` и содержит логику автоматического обновления токена.
- Router-guard использует стор для проверки `isAuthenticated` и вызывает `checkAuth()` при необходимости.
