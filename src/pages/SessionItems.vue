<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSearchSessions } from "../composables/useSearchSessions";
import type { SearchItemResponse, SearchItemDetailResponse } from "../types";

const route = useRoute();
const router = useRouter();
const sessionId = computed(() => route.params.sessionId as string);

const {
  getSessionItems,
  getSessionItem,
  updateSessionItem,
  loading,
  error,
} = useSearchSessions();

const items = ref<SearchItemResponse[]>([]);
const total = ref(0);
const limit = ref(20);
const offset = ref(0);
const includeHidden = ref(false);
const detailOpen = ref(false);
const detailItem = ref<SearchItemDetailResponse | null>(null);
const detailLoading = ref(false);

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)));
const currentPage = computed({
  get: () => Math.floor(offset.value / limit.value) + 1,
  set: (p: number) => {
    offset.value = (p - 1) * limit.value;
  },
});

async function fetchItems() {
  if (!sessionId.value) return;
  try {
    const data = await getSessionItems(sessionId.value, {
      limit: limit.value,
      offset: offset.value,
      include_hidden: includeHidden.value,
    });
    items.value = data.items;
    total.value = data.total;
  } catch {
    items.value = [];
    total.value = 0;
  }
}

async function openDetail(itemId: string) {
  if (!sessionId.value) return;
  detailOpen.value = true;
  detailLoading.value = true;
  detailItem.value = null;
  try {
    detailItem.value = await getSessionItem(sessionId.value, itemId);
  } catch {
    detailItem.value = null;
  } finally {
    detailLoading.value = false;
  }
}

function closeDetail() {
  detailOpen.value = false;
  detailItem.value = null;
}

async function toggleFavorite(item: SearchItemResponse) {
  if (!sessionId.value) return;
  try {
    await updateSessionItem(sessionId.value, item.id, {
      is_favorite: item.is_favorite ? false : true,
    });
    await fetchItems();
    if (detailItem.value?.id === item.id) {
      detailItem.value = await getSessionItem(sessionId.value, item.id);
    }
  } catch {
    // error in composable
  }
}

async function toggleHidden(item: SearchItemResponse) {
  if (!sessionId.value) return;
  try {
    await updateSessionItem(sessionId.value, item.id, {
      is_hidden: item.is_hidden ? false : true,
    });
    await fetchItems();
    if (detailItem.value?.id === item.id) {
      detailItem.value = await getSessionItem(sessionId.value, item.id);
    }
  } catch {
    // error in composable
  }
}

function goBack() {
  router.push({ name: "HHSearch" }).catch(() => {});
}

/** Краткая выжимка из payload (резюме: title, area; вакансия: name, employer, area). */
function itemPayloadSummary(item: SearchItemResponse): { titleOrName: string; area: string; extra: string } {
  const p = item.payload;
  if (!p || typeof p !== "object") return { titleOrName: "—", area: "—", extra: "—" };
  const o = p as Record<string, unknown>;
  const titleOrName =
    (typeof o.title === "string" ? o.title : null) ?? (typeof o.name === "string" ? o.name : null) ?? "—";
  const areaObj = o.area as { name?: string } | undefined;
  const area = typeof areaObj?.name === "string" ? areaObj.name : "—";
  const employer = (o.employer as { name?: string } | undefined)?.name;
  const salary = o.salary as { from?: number; to?: number; currency?: string } | undefined;
  const salaryStr =
    salary != null && (salary.from != null || salary.to != null)
      ? [salary.from, salary.to].filter((x) => x != null).join(" – ") + (salary.currency ? ` ${salary.currency}` : "")
      : null;
  const extra = typeof employer === "string" ? employer : salaryStr ?? "—";
  return { titleOrName, area, extra };
}

watch([sessionId, offset, includeHidden], () => {
  fetchItems();
}, { immediate: true });

onMounted(() => {
  if (!sessionId.value) {
    router.replace({ name: "HHSearch" }).catch(() => {});
  }
});
</script>

<template>
  <div class="page-container session-items-page">
    <header class="page-header">
      <h1>Элементы сессии поиска</h1>
      <button type="button" class="btn secondary" @click="goBack">
        Назад к поиску
      </button>
    </header>

    <template v-if="sessionId">
      <p v-if="error" class="hint warning">
        {{ error instanceof Error ? error.message : String(error) }}
      </p>

      <section class="form-section">
        <div class="items-toolbar">
          <label class="checkbox-label">
            <input v-model="includeHidden" type="checkbox" />
            Показывать скрытые
          </label>
          <span class="items-meta">
            Всего: {{ total }}, страница {{ currentPage }} из {{ totalPages }}
          </span>
        </div>

        <div v-if="loading" class="loading-state">Загрузка…</div>
        <template v-else>
          <div class="items-table-wrap">
            <table class="items-table">
              <thead>
                <tr>
                  <th>HH ID</th>
                  <th>Название</th>
                  <th>Регион</th>
                  <th>Избранное</th>
                  <th>Скрыт</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in items" :key="item.id">
                  <td>
                    <button
                      type="button"
                      class="link-btn"
                      @click="openDetail(item.id)"
                    >
                      {{ item.hh_id }}
                    </button>
                  </td>
                  <td class="item-title-cell">{{ itemPayloadSummary(item).titleOrName }}</td>
                  <td>{{ itemPayloadSummary(item).area }}</td>
                  <td>{{ item.is_favorite ? "Да" : "Нет" }}</td>
                  <td>{{ item.is_hidden ? "Да" : "Нет" }}</td>
                  <td class="actions-cell">
                    <button
                      type="button"
                      class="btn small"
                      :title="item.is_favorite ? 'Убрать из избранного' : 'В избранное'"
                      @click="toggleFavorite(item)"
                    >
                      {{ item.is_favorite ? "★" : "☆" }}
                    </button>
                    <button
                      type="button"
                      class="btn small"
                      :title="item.is_hidden ? 'Показать' : 'Скрыть'"
                      @click="toggleHidden(item)"
                    >
                      {{ item.is_hidden ? "Показать" : "Скрыть" }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="items.length === 0" class="empty-state">
            Нет элементов для отображения.
          </div>

          <div v-if="totalPages > 1" class="pagination">
            <button
              type="button"
              class="btn small"
              :disabled="currentPage <= 1"
              @click="currentPage = currentPage - 1"
            >
              Назад
            </button>
            <span class="page-num">{{ currentPage }} / {{ totalPages }}</span>
            <button
              type="button"
              class="btn small"
              :disabled="currentPage >= totalPages"
              @click="currentPage = currentPage + 1"
            >
              Вперёд
            </button>
          </div>
        </template>
      </section>

      <!-- Детальный просмотр (модальное окно) -->
      <div v-if="detailOpen" class="detail-overlay" @click.self="closeDetail">
        <div class="detail-panel">
          <div class="detail-header">
            <h2>Элемент {{ detailItem?.hh_id ?? "—" }}</h2>
            <button type="button" class="btn small" @click="closeDetail">
              Закрыть
            </button>
          </div>
          <div v-if="detailLoading" class="loading-state">Загрузка…</div>
          <div v-else-if="detailItem" class="detail-body">
            <div v-if="detailItem.payload && typeof detailItem.payload === 'object'" class="detail-summary">
              <dl class="detail-dl">
                <template v-if="itemPayloadSummary(detailItem).titleOrName !== '—'">
                  <dt>Название</dt>
                  <dd>{{ itemPayloadSummary(detailItem).titleOrName }}</dd>
                </template>
                <template v-if="itemPayloadSummary(detailItem).area !== '—'">
                  <dt>Регион</dt>
                  <dd>{{ itemPayloadSummary(detailItem).area }}</dd>
                </template>
                <template v-if="itemPayloadSummary(detailItem).extra !== '—'">
                  <dt>Работодатель / Зарплата</dt>
                  <dd>{{ itemPayloadSummary(detailItem).extra }}</dd>
                </template>
              </dl>
            </div>
            <dl class="detail-dl">
              <dt>ID</dt>
              <dd>{{ detailItem.id }}</dd>
              <dt>HH ID</dt>
              <dd>{{ detailItem.hh_id }}</dd>
              <dt>Избранное</dt>
              <dd>{{ detailItem.is_favorite ? "Да" : "Нет" }}</dd>
              <dt>Скрыт</dt>
              <dd>{{ detailItem.is_hidden ? "Да" : "Нет" }}</dd>
            </dl>
            <div v-if="detailItem.payload && Object.keys(detailItem.payload).length" class="payload-block">
              <h3>Данные (payload)</h3>
              <pre class="payload-json">{{ JSON.stringify(detailItem.payload, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.session-items-page {
  max-width: 56rem;
}
.items-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
.items-meta {
  opacity: 0.9;
  font-size: 0.95rem;
}
.loading-state,
.empty-state {
  padding: 1.5rem;
  text-align: center;
  opacity: 0.9;
}
.items-table-wrap {
  overflow-x: auto;
  margin-bottom: 1rem;
}
.items-table {
  width: 100%;
  border-collapse: collapse;
}
.items-table th,
.items-table td {
  padding: 0.5rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}
.items-table th {
  font-weight: 600;
}
.item-title-cell {
  max-width: 16rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.detail-summary {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}
.link-btn {
  background: none;
  border: none;
  color: #646cff;
  cursor: pointer;
  text-decoration: underline;
  font: inherit;
  padding: 0;
}
.link-btn:hover {
  color: #8b92ff;
}
.actions-cell {
  display: flex;
  gap: 0.5rem;
}
.pagination {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.page-num {
  font-size: 0.95rem;
}
.detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.detail-panel {
  background: var(--page-bg, #1a1a2e);
  border-radius: 8px;
  max-width: 36rem;
  max-height: 90vh;
  overflow: auto;
  padding: 1.25rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.detail-header h2 {
  margin: 0;
  font-size: 1.15rem;
}
.detail-dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.35rem 1rem;
  margin: 0 0 1rem;
}
.detail-dl dt {
  font-weight: 500;
  opacity: 0.9;
}
.payload-block h3 {
  margin: 0.75rem 0 0.35rem;
  font-size: 1rem;
}
.payload-json {
  margin: 0;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  font-size: 0.8rem;
  overflow-x: auto;
  max-height: 20rem;
  overflow-y: auto;
}
</style>
