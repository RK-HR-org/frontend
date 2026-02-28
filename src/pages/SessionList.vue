<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useSearchSessions } from "../composables/useSearchSessions";
import { useTeams } from "../composables/useTeams";
import { useStatics } from "../composables/useStatics";
import DropdownField from "../components/ui/fields/select/DropdownField.vue";
import type { SearchSessionResponse, SearchStatus } from "../types";

const router = useRouter();

const {
  getUserSessions,
  getTeamSessions,
  loading,
  error,
} = useSearchSessions();

const { teams, fetchTeams } = useTeams();
const { sessionStatuses, fetchSessionStatuses } = useStatics();

const mode = ref<"user" | "team">("user");
const selectedTeamId = ref<string | null>(null);
const sessions = ref<SearchSessionResponse[]>([]);
const total = ref(0);
const limit = ref(50);
const offset = ref(0);
const sortBy = ref<keyof SearchSessionResponse | "">("created_at");
const sortDir = ref<"asc" | "desc">("desc");

const teamOptions = computed(() => {
  const list = teams.value ?? [];
  if (!list.length) return [];
  return list.map((t) => ({ value: String(t.id), label: t.name || String(t.id) }));
});

const teamNameMap = computed(() => {
  const map = new Map<string, string>();
  for (const t of teams.value ?? []) {
    map.set(String(t.id), t.name || String(t.id));
  }
  return map;
});

const statusLabel = (status: SearchStatus): string => {
  const found = sessionStatuses.value?.find((s) => s.value === status);
  if (found) return found.name;
  const fallback: Record<string, string> = {
    draft: "Черновик",
    enriched: "Обогащён",
    approved: "Подтверждён",
    executed: "Выполнен",
    failed: "Ошибка",
  };
  return fallback[status] ?? status;
};

const modeLabel = (m: string): string => {
  return m === "resumes" ? "Резюме" : m === "vacancies" ? "Вакансии" : m;
};

const shortId = (id: string): string => {
  if (!id || id.length < 12) return id;
  return id.slice(0, 8) + "…";
};

const sortedSessions = computed(() => {
  const list = [...sessions.value];
  const key = sortBy.value;
  if (!key) return list;
  const dir = sortDir.value === "asc" ? 1 : -1;
  return list.sort((a, b) => {
    const va = (a as Record<string, unknown>)[key];
    const vb = (b as Record<string, unknown>)[key];
    if (va == null && vb == null) return 0;
    if (va == null) return dir;
    if (vb == null) return -dir;
    if (typeof va === "string" && typeof vb === "string") {
      if (key === "created_at" || key === "updated_at") {
        return (new Date(va).getTime() - new Date(vb).getTime()) * dir;
      }
      return va.localeCompare(vb) * dir;
    }
    if (typeof va === "number" && typeof vb === "number") {
      return (va - vb) * dir;
    }
    return String(va).localeCompare(String(vb)) * dir;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));
const currentPage = computed({
  get: () => Math.floor(offset.value / limit.value) + 1,
  set: (p: number) => {
    offset.value = (p - 1) * limit.value;
  },
});

async function fetchSessions() {
  try {
    let data;
    if (mode.value === "team" && selectedTeamId.value) {
      data = await getTeamSessions(selectedTeamId.value, limit.value, offset.value);
    } else {
      data = await getUserSessions(limit.value, offset.value);
    }
    sessions.value = data.items ?? [];
    total.value = data.total ?? 0;
  } catch {
    sessions.value = [];
    total.value = 0;
  }
}

function toggleSort(key: keyof SearchSessionResponse) {
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = key;
    sortDir.value = "asc";
  }
}

function goToResults(sessionId: string) {
  router.push({ name: "SessionItems", params: { sessionId } });
}

watch([mode, selectedTeamId, offset], () => {
  if (mode.value === "team" && !selectedTeamId.value) {
    sessions.value = [];
    total.value = 0;
    return;
  }
  fetchSessions();
}, { immediate: false });

onMounted(async () => {
  await Promise.all([fetchTeams(), fetchSessionStatuses()]);
  if (mode.value === "team" && teamOptions.value.length && !selectedTeamId.value) {
    selectedTeamId.value = teamOptions.value[0].value;
  }
  fetchSessions();
});
</script>

<template>
  <div class="page-container session-list-page">
    <header class="page-header">
      <h1>Поисковые сессии</h1>
      <div class="header-actions">
        <router-link :to="{ name: 'HHSearch' }" class="btn btn-primary">
          Новый поиск
        </router-link>
      </div>
    </header>

    <section class="filters-section">
      <div class="mode-toggle">
        <label class="radio-label">
          <input v-model="mode" type="radio" value="user" />
          Мои сессии
        </label>
        <label class="radio-label">
          <input v-model="mode" type="radio" value="team" />
          Сессии команды
        </label>
      </div>
      <div v-if="mode === 'team'" class="team-select">
        <DropdownField
          v-model="selectedTeamId"
          label="Команда"
          :options="teamOptions"
          placeholder="Выберите команду"
        />
      </div>
    </section>

    <p v-if="error" class="hint warning">
      {{ error instanceof Error ? error.message : String(error) }}
    </p>

    <div v-if="loading && !sessions.length" class="loading-state">
      Загрузка сессий…
    </div>

    <div v-else-if="mode === 'team' && !selectedTeamId" class="empty-state">
      Выберите команду для просмотра сессий.
    </div>

    <div v-else-if="!sortedSessions.length" class="empty-state">
      Нет сессий.
    </div>

    <div v-else class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th class="sortable" @click="toggleSort('id')">
              ID
              <span v-if="sortBy === 'id'" class="sort-icon">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="sortable" @click="toggleSort('created_at')">
              Дата создания
              <span v-if="sortBy === 'created_at'" class="sort-icon">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="sortable" @click="toggleSort('mode')">
              Режим
              <span v-if="sortBy === 'mode'" class="sort-icon">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th class="sortable" @click="toggleSort('status')">
              Статус
              <span v-if="sortBy === 'status'" class="sort-icon">{{ sortDir === 'asc' ? '↑' : '↓' }}</span>
            </th>
            <th>Команда</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in sortedSessions" :key="s.id">
            <td class="session-id">
              <!-- {{ shortId(s.id) }} -->
              {{ s.hh_request?.textQueries?.map((q: any) => q.text).join(", ") }}
            </td>
            <td>{{ s.created_at }}</td>
            <td>{{ modeLabel(s.mode) }}</td>
            <td>{{ statusLabel(s.status) }}</td>
            <td>{{ teamNameMap.get(s.team_id) ?? s.team_id }}</td>
            <td class="actions-cell">
              <button
                type="button"
                class="btn btn-sm btn-primary"
                @click="goToResults(s.id)"
              >
                Результаты
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="pagination">
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          :disabled="currentPage <= 1"
          @click="currentPage = currentPage - 1"
        >
          Назад
        </button>
        <span class="page-num">Страница {{ currentPage }} из {{ totalPages }}</span>
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          :disabled="currentPage >= totalPages"
          @click="currentPage = currentPage + 1"
        >
          Вперёд
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.filters-section {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.mode-toggle {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.team-select {
  min-width: 200px;
}

.hint.warning {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.loading-state,
.empty-state {
  padding: 2rem;
  text-align: center;
  opacity: 0.9;
}

.table-wrap {
  overflow-x: auto;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.data-table th,
.data-table td {
  padding: 0.5rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.data-table th {
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background: rgba(255, 255, 255, 0.08);
}

.sort-icon {
  margin-left: 0.25rem;
  opacity: 0.8;
}

.session-id {
  font-family: monospace;
  font-size: 0.85rem;
}

.actions-cell {
  white-space: nowrap;
}

.data-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.pagination {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.page-num {
  font-size: 0.95rem;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
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

.btn-sm {
  padding: 6px 12px;
  font-size: 0.85rem;
}
</style>
