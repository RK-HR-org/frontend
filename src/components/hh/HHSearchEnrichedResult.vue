<script setup lang="ts">
import type { EnrichedDataDTO, DiffDTO } from "../../types";

defineProps<{
  enrichedFilters: EnrichedDataDTO;
  diff: DiffDTO;
  sessionId?: string | null;
}>();

const hasFilters = (f: EnrichedDataDTO) =>
  (f.keywords_include?.length ?? 0) > 0 ||
  (f.keywords_exclude?.length ?? 0) > 0 ||
  f.text_search?.query ||
  (f.skills?.length ?? 0) > 0 ||
  f.experience?.hh_experience_id ||
  (f.age && (f.age.age_from != null || f.age.age_to != null)) ||
  (f.location && (f.location.area_id != null || f.location.area_name)) ||
  (f.schedule?.length ?? 0) > 0 ||
  (f.employment?.length ?? 0) > 0 ||
  (f.salary && (f.salary.salary_from != null || f.salary.salary_to != null));

const hasDiff = (d: DiffDTO) =>
  (d.added?.length ?? 0) > 0 ||
  (d.changed?.length ?? 0) > 0 ||
  (d.warnings?.length ?? 0) > 0;
</script>

<template>
  <section class="form-section">
    <h3>Результат обогащения (Cozy AI)</h3>
    <p v-if="sessionId" class="field-hint">Сессия: {{ sessionId }}</p>

    <div v-if="hasFilters(enrichedFilters)" class="enriched-filters">
      <h4 class="field-label">Извлечённые фильтры</h4>
      <dl class="filters-dl">
        <template v-if="enrichedFilters.keywords_include?.length">
          <dt>Ключевые слова (включить)</dt>
          <dd>{{ enrichedFilters.keywords_include.join(", ") }}</dd>
        </template>
        <template v-if="enrichedFilters.keywords_exclude?.length">
          <dt>Ключевые слова (исключить)</dt>
          <dd>{{ enrichedFilters.keywords_exclude.join(", ") }}</dd>
        </template>
        <template v-if="enrichedFilters.text_search?.query">
          <dt>Текстовый запрос</dt>
          <dd>
            {{ enrichedFilters.text_search.query }}
            <span
              v-if="enrichedFilters.text_search.logic"
              class="field-hint"
            >(логика: {{ enrichedFilters.text_search.logic }})</span>
          </dd>
        </template>
        <template v-if="enrichedFilters.skills?.length">
          <dt>Навыки</dt>
          <dd>{{ enrichedFilters.skills.join(", ") }}</dd>
        </template>
        <template v-if="enrichedFilters.experience?.hh_experience_id">
          <dt>Опыт</dt>
          <dd>{{ enrichedFilters.experience.hh_experience_id }}</dd>
        </template>
        <template
          v-if="
            enrichedFilters.age &&
            (enrichedFilters.age.age_from != null ||
              enrichedFilters.age.age_to != null)
          "
        >
          <dt>Возраст</dt>
          <dd>
            {{ enrichedFilters.age.age_from ?? "—" }} –
            {{ enrichedFilters.age.age_to ?? "—" }}
          </dd>
        </template>
        <template
          v-if="
            enrichedFilters.location?.area_id != null ||
            enrichedFilters.location?.area_name
          "
        >
          <dt>Регион</dt>
          <dd>
            {{ enrichedFilters.location.area_name ?? enrichedFilters.location.area_id }}
          </dd>
        </template>
        <template v-if="enrichedFilters.schedule?.length">
          <dt>График</dt>
          <dd>{{ enrichedFilters.schedule.join(", ") }}</dd>
        </template>
        <template v-if="enrichedFilters.employment?.length">
          <dt>Занятость</dt>
          <dd>{{ enrichedFilters.employment.join(", ") }}</dd>
        </template>
        <template
          v-if="
            enrichedFilters.salary &&
            (enrichedFilters.salary.salary_from != null ||
              enrichedFilters.salary.salary_to != null)
          "
        >
          <dt>Зарплата</dt>
          <dd>
            {{ enrichedFilters.salary.salary_from ?? "—" }} –
            {{ enrichedFilters.salary.salary_to ?? "—" }}
            {{ enrichedFilters.salary.currency ?? "RUR" }}
          </dd>
        </template>
      </dl>
    </div>
    <p v-else class="field-hint">Фильтры не извлечены.</p>

    <div v-if="hasDiff(diff)" class="enriched-diff">
      <h4 class="field-label">Изменения</h4>
      <div v-if="diff.added?.length" class="diff-block">
        <span class="diff-label">Добавлено:</span>
        <ul class="diff-list">
          <li v-for="item in diff.added" :key="item">{{ item }}</li>
        </ul>
      </div>
      <div v-if="diff.changed?.length" class="diff-block">
        <span class="diff-label">Изменено:</span>
        <ul class="diff-list">
          <li v-for="item in diff.changed" :key="item">{{ item }}</li>
        </ul>
      </div>
      <div v-if="diff.warnings?.length" class="diff-block warnings">
        <span class="diff-label">Предупреждения:</span>
        <ul class="diff-list">
          <li v-for="(w, i) in diff.warnings" :key="i">{{ w }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import "../ui/fields/fields.css";

.enriched-filters,
.enriched-diff {
  margin-top: 0.75rem;
}

.filters-dl {
  display: grid;
  gap: 0.35rem 1rem;
  grid-template-columns: auto 1fr;
  margin: 0;
  font-size: 0.95rem;
}

.filters-dl dt {
  opacity: 0.85;
  font-weight: 500;
}

.filters-dl dd {
  margin: 0;
}

.diff-block {
  margin-top: 0.5rem;
}

.diff-label {
  font-weight: 500;
  font-size: 0.9rem;
}

.diff-list {
  margin: 0.25rem 0 0 1rem;
  padding-left: 0.5rem;
}

.diff-block.warnings .diff-list {
  color: #e2a500;
}
</style>
