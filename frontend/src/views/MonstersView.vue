<script setup lang="ts">
import { computed, watch } from 'vue'
import MonsterCard from '@/components/MonsterCard.vue'
import PaginationControls from '@/components/PaginationControls.vue'
import SearchInput from '@/components/SearchInput.vue'
import { useMonsters } from '@/composables/useMonsters'
import { useUI } from '@/composables/useUI'
import { useStoredState } from '@/composables/useStoredState'

const { data: monsters, isLoading, isError } = useMonsters()
const { t, lang } = useUI()

// ── Filtros ──────────────────────────────────────────────────────────────────
const search          = useStoredState('adb:monsters:search', '')
const selectedElement = useStoredState('adb:monsters:element', '')   // '' = todos
const selectedEcology = useStoredState('adb:monsters:ecology', '')   // '' = todos

// Opções dinâmicas derivadas dos dados carregados
const availableElements = computed(() => {
  if (!monsters.value) return []
  const seen = new Set<string>()
  for (const m of monsters.value)
    for (const el of m.elements ?? []) seen.add(el)
  return [...seen].sort()
})

const availableEcologies = computed(() => {
  if (!monsters.value) return []
  const seen = new Set<string>()
  for (const m of monsters.value)
    if (m.ecology) seen.add(m.ecology)
  return [...seen].sort()
})

// Monsters filtrados
const filtered = computed(() => {
  if (!monsters.value) return []

  const q   = search.value.trim().toLowerCase()
  const el  = selectedElement.value
  const eco = selectedEcology.value

  return monsters.value.filter(m => {
    if (q   && !m.name.toLowerCase().includes(q)) return false
    if (el === '__none__') {
      if ((m.elements ?? []).length > 0) return false
    } else if (el && !(m.elements ?? []).includes(el)) return false
    if (eco  && m.ecology !== eco) return false
    return true
  })
})

const hasActiveFilters = computed(() =>
  search.value.trim() !== '' || selectedElement.value !== '' || selectedEcology.value !== ''
)

function clearFilters() {
  search.value          = ''
  selectedElement.value = ''
  selectedEcology.value = ''
}

// Label traduzida para um elemento
function elementLabel(key: string): string {
  if (key === '__none__') return t.value.listing.filterNone
  return (t.value.elements as Record<string, string>)[key] ?? key
}

// Label traduzida para uma ecologia
function ecologyLabel(key: string): string {
  return (t.value.ecologies as Record<string, string>)[key] ?? key
}

// ── Paginação ────────────────────────────────────────────────────────────────
const MONSTERS_PER_PAGE = 42
const currentPage = useStoredState('adb:monsters:page', 1)
const totalPages  = computed(() => Math.ceil(filtered.value.length / MONSTERS_PER_PAGE))

const paginated = computed(() => {
  const start = (currentPage.value - 1) * MONSTERS_PER_PAGE
  return filtered.value.slice(start, start + MONSTERS_PER_PAGE)
})

watch([search, selectedElement, selectedEcology], () => { currentPage.value = 1 })
watch(totalPages, (pages) => {
  if (pages > 0 && currentPage.value > pages) currentPage.value = pages
})

function goTo(page: number) {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="monsters-page">

    <!-- Cabeçalho estilo MHW -->
    <header class="monsters-page__header">
      <p class="monsters-page__label">{{ t.listing.bestiary }}</p>
      <h1 class="monsters-page__title">{{ t.listing.largeMonsters }}</h1>
      <p v-if="monsters" class="monsters-page__count">
        {{ filtered.length }}{{ filtered.length !== monsters.length ? `/${monsters.length}` : '' }}
        {{ t.listing.monstersRecorded }}
      </p>
    </header>

    <!-- Divisor dourado estilo MHW -->
    <div class="divider" />

    <!-- Barra de busca e filtros -->
    <div v-if="!isLoading && !isError" class="filter-bar">
      <!-- Busca por nome -->
      <SearchInput v-model="search" :placeholder="t.listing.searchPlaceholder" />

      <!-- Filtro por elemento -->
      <div class="filter-bar__select-wrap">
        <label class="filter-bar__select-label">{{ t.listing.filterElement }}</label>
        <select v-model="selectedElement" class="filter-bar__select">
          <option value="">{{ t.listing.filterAll }}</option>
          <option value="__none__">{{ t.listing.filterNone }}</option>
          <option
            v-for="el in availableElements"
            :key="el"
            :value="el"
          >{{ elementLabel(el) }}</option>
        </select>
      </div>

      <!-- Filtro por ecologia -->
      <div class="filter-bar__select-wrap">
        <label class="filter-bar__select-label">{{ t.listing.filterEcology }}</label>
        <select v-model="selectedEcology" class="filter-bar__select">
          <option value="">{{ t.listing.filterAll }}</option>
          <option
            v-for="eco in availableEcologies"
            :key="eco"
            :value="eco"
          >{{ ecologyLabel(eco) }}</option>
        </select>
      </div>

      <!-- Limpar filtros -->
      <button
        v-if="hasActiveFilters"
        class="filter-bar__clear-btn"
        @click="clearFilters"
      >{{ t.listing.clearFilters }}</button>
    </div>

    <!-- Loading: skeleton cards -->
    <div v-if="isLoading" class="monsters-grid">
      <div v-for="i in 18" :key="i" class="skeleton-card" />
    </div>

    <!-- Erro -->
    <div v-else-if="isError" class="monsters-page__error">
      <p>⚠ {{ t.listing.loadingError }}</p>
      <p class="monsters-page__error-hint">{{ t.listing.backendHint }}</p>
    </div>

    <!-- Grid de monstros -->
    <template v-else>
      <div v-if="filtered.length > 0" class="monsters-grid">
        <MonsterCard
          v-for="monster in paginated"
          :key="`${lang}-${monster.id}`"
          :monster="monster"
        />
      </div>

      <!-- Paginação -->
      <PaginationControls :current-page="currentPage" :total-pages="totalPages" @go-to="goTo" />

      <!-- Estado vazio -->
      <div v-if="filtered.length === 0" class="monsters-page__empty">
        <p class="monsters-page__empty-title">{{ t.listing.noResults }}</p>
        <p class="monsters-page__empty-hint">{{ t.listing.noResultsHint }}</p>
        <button class="filter-bar__clear-btn filter-bar__clear-btn--center" @click="clearFilters">
          {{ t.listing.clearFilters }}
        </button>
      </div>
    </template>

  </div>
</template>

<style scoped>
.monsters-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

@media (max-width: 640px) {
  .monsters-page { padding: 24px 16px 60px; }
}

/* ── Cabeçalho ── */
.monsters-page__header {
  margin-bottom: 20px;
}

.monsters-page__label {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 6px;
}

.monsters-page__title {
  font-family: var(--font-heading);
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.monsters-page__count {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 6px;
}

/* ── Divisor dourado ── */
.divider {
  height: 1px;
  background: linear-gradient(to right, var(--gold), var(--border) 60%, transparent);
  margin-bottom: 24px;
}

/* ── Barra de filtros ── */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 24px;
}

.filter-bar__search {
  position: relative;
  flex: 1;
  min-width: 180px;
}

.filter-bar__search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-dim);
  pointer-events: none;
}

.filter-bar__input {
  width: 100%;
  padding: 8px 32px 8px 34px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-family: var(--font-body);
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.filter-bar__input:focus {
  border-color: var(--gold);
}

.filter-bar__input::placeholder {
  color: var(--text-dim);
}

.filter-bar__clear-input {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 16px;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
  transition: color 0.2s;
}

.filter-bar__clear-input:hover { color: var(--text); }

.filter-bar__select-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
}

.filter-bar__select-label {
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.filter-bar__select {
  padding: 8px 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-family: var(--font-body);
  font-size: 13px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 28px;
}

.filter-bar__select:focus { border-color: var(--gold); }
.filter-bar__select option { background: var(--surface-2); }

.filter-bar__clear-btn {
  padding: 8px 14px;
  background: none;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
  align-self: flex-end;
}

.filter-bar__clear-btn:hover {
  border-color: var(--gold);
  color: var(--gold);
}

.filter-bar__clear-btn--center {
  margin-top: 16px;
  align-self: center;
}

/* ── Grid ── */
.monsters-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

@media (min-width: 400px)  { .monsters-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 480px)  { .monsters-grid { grid-template-columns: repeat(4, 1fr); } }
@media (min-width: 640px)  { .monsters-grid { grid-template-columns: repeat(5, 1fr); } }
@media (min-width: 900px)  { .monsters-grid { grid-template-columns: repeat(6, 1fr); } }
@media (min-width: 1100px) { .monsters-grid { grid-template-columns: repeat(7, 1fr); } }

/* ── Paginação ── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 32px;
  flex-wrap: wrap;
}

.pagination__btn {
  min-width: 40px;
  height: 40px;
  padding: 0 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 13px;
  font-family: var(--font-heading);
  cursor: pointer;
  transition: color .15s, border-color .15s, background .15s;
}

.pagination__btn:hover:not(:disabled) { color: var(--text); border-color: var(--gold); }
.pagination__btn:disabled             { opacity: .35; cursor: not-allowed; }
.pagination__btn--active              { color: var(--gold); border-color: var(--gold); background: var(--gold-glow); }

.pagination__ellipsis {
  color: var(--text-muted);
  padding: 0 4px;
  font-size: 14px;
  align-self: flex-end;
}

/* ── Filtros mobile ── */
@media (max-width: 640px) {
  .filter-bar { gap: 8px; }
  .filter-bar__search { min-width: 0; width: 100%; }
  .filter-bar__select-wrap { min-width: 0; flex: 1; }
  .filter-bar__clear-btn { width: 100%; justify-content: center; }
}

/* ── Skeleton loading ── */
.skeleton-card {
  height: 150px;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* ── Erro ── */
.monsters-page__error {
  text-align: center;
  padding: 60px 20px;
  color: var(--el-fire);
  font-family: var(--font-heading);
}

.monsters-page__error-hint {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 8px;
}

/* ── Estado vazio ── */
.monsters-page__empty {
  text-align: center;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.monsters-page__empty-title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-muted);
}

.monsters-page__empty-hint {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text-dim);
}
</style>
