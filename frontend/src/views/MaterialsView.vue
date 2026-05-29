<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MaterialCard from '@/components/MaterialCard.vue'
import ItemSourcesModal from '@/components/ItemSourcesModal.vue'
import { useItems } from '@/composables/useItems'
import { useUI } from '@/composables/useUI'

const { data: items, isLoading, isError } = useItems()
const { t } = useUI()

// ── Modal ────────────────────────────────────────────────────────────────────
const activeItemId   = ref<number | null>(null)
const activeItemName = ref('')

function openModal(id: number, name: string) {
  activeItemId.value   = id
  activeItemName.value = name
}
function closeModal() { activeItemId.value = null }

// ── Grupos por iconName ───────────────────────────────────────────────────────
const MONSTER_PARTS = new Set([
  'Body','Bone','Carapace','Fang','Gem','Hide','Husk','Jaw','Liquid',
  'Mantle','Plate','Sac','Scale','Tail','Webbing','Wing',
])
const MINERALS = new Set(['Ore','CharmOre','Feystone','Sphere','Streamstone'])
const PLANTS   = new Set(['Bug','Herb','Honey','Mushroom','Seed'])

function iconGroup(iconName: string | null): string {
  if (!iconName) return 'other'
  if (MONSTER_PARTS.has(iconName)) return 'monster_part'
  if (MINERALS.has(iconName))      return 'mineral'
  if (PLANTS.has(iconName))        return 'plant'
  return 'other'
}

// ── Abas ─────────────────────────────────────────────────────────────────────
const activeTab = ref('all')

const tabs = computed(() => [
  { key: 'all',          label: t.value.materials.filterAll },
  { key: 'monster_part', label: t.value.materials.groupMonsterPart },
  { key: 'mineral',      label: t.value.materials.groupMineral },
  { key: 'plant',        label: t.value.materials.groupPlant },
  { key: 'other',        label: t.value.materials.groupOther },
])

// ── Busca ─────────────────────────────────────────────────────────────────────
const search = ref('')

// ── Filtro combinado ──────────────────────────────────────────────────────────
const filtered = computed(() => {
  if (!items.value) return []
  const q   = search.value.trim().toLowerCase()
  const tab = activeTab.value
  return items.value.filter(m => {
    if (q && !m.name.toLowerCase().includes(q)) return false
    if (tab !== 'all' && iconGroup(m.iconName) !== tab) return false
    return true
  })
})

const hasFilters = computed(() => search.value.trim() !== '' || activeTab.value !== 'all')

function clearFilters() {
  search.value    = ''
  activeTab.value = 'all'
  currentPage.value = 1
}

// ── Paginação ─────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 60
const currentPage    = ref(1)
const totalPages     = computed(() => Math.ceil(filtered.value.length / ITEMS_PER_PAGE))

const paginated = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  return filtered.value.slice(start, start + ITEMS_PER_PAGE)
})

// Volta pra página 1 ao trocar filtro/busca
watch([search, activeTab], () => { currentPage.value = 1 })

function goTo(page: number) {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="materials-page">

    <!-- Cabeçalho -->
    <header class="materials-page__header">
      <p class="materials-page__label">{{ t.materials.subtitle }}</p>
      <h1 class="materials-page__title">{{ t.materials.title }}</h1>
      <p v-if="items" class="materials-page__count">
        {{ filtered.length }}{{ filtered.length !== items.length ? `/${items.length}` : '' }}
        {{ t.materials.recorded }}
        <span v-if="totalPages > 1"> · {{ t.materials.page }} {{ currentPage }}/{{ totalPages }}</span>
      </p>
    </header>

    <div class="divider" />

    <!-- Barra de busca -->
    <div v-if="!isLoading && !isError" class="search-bar">
      <div class="search-bar__wrap">
        <svg class="search-bar__icon" viewBox="0 0 20 20" fill="none">
          <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.5"/>
          <path d="M13 13l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input
          v-model="search"
          class="search-bar__input"
          type="text"
          :placeholder="t.materials.searchPlaceholder"
        />
        <button v-if="search" class="search-bar__clear" @click="search = ''">×</button>
      </div>
      <button v-if="hasFilters" class="clear-btn" @click="clearFilters">
        {{ t.materials.clearFilters }}
      </button>
    </div>

    <!-- Abas de tipo -->
    <div v-if="!isLoading && !isError" class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab"
        :class="{ 'tab--active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >{{ tab.label }}</button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="materials-grid">
      <div v-for="i in 24" :key="i" class="skeleton-card" />
    </div>

    <!-- Erro -->
    <div v-else-if="isError" class="state-msg">
      <p>⚠ {{ t.listing.loadingError }}</p>
    </div>

    <!-- Grid -->
    <template v-else>
      <div v-if="filtered.length > 0" class="materials-grid">
        <MaterialCard
          v-for="item in paginated"
          :key="item.id"
          :item="item"
          @open="openModal"
        />
      </div>

      <div v-else class="state-msg">
        <p class="state-msg__title">{{ t.materials.noResults }}</p>
        <p class="state-msg__hint">{{ t.materials.noResultsHint }}</p>
        <button class="clear-btn clear-btn--center" @click="clearFilters">
          {{ t.materials.clearFilters }}
        </button>
      </div>

      <!-- Paginação -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="pagination__btn" :disabled="currentPage === 1" @click="goTo(currentPage - 1)">‹</button>

        <template v-for="p in totalPages" :key="p">
          <!-- Sempre mostra 1ª, última e vizinhos da atual; reticências no resto -->
          <template v-if="p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1">
            <button
              class="pagination__btn"
              :class="{ 'pagination__btn--active': p === currentPage }"
              @click="goTo(p)"
            >{{ p }}</button>
          </template>
          <span v-else-if="p === 2 && currentPage > 4" class="pagination__ellipsis">…</span>
          <span v-else-if="p === totalPages - 1 && currentPage < totalPages - 3" class="pagination__ellipsis">…</span>
        </template>

        <button class="pagination__btn" :disabled="currentPage === totalPages" @click="goTo(currentPage + 1)">›</button>
      </div>
    </template>

    <!-- Modal de fontes -->
    <ItemSourcesModal
      :item-id="activeItemId"
      :item-name="activeItemName"
      @close="closeModal"
    />

  </div>
</template>

<style scoped>
.materials-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

/* ── Cabeçalho ── */
.materials-page__header { margin-bottom: 20px; }

.materials-page__label {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 6px;
}

.materials-page__title {
  font-family: var(--font-heading);
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.materials-page__count {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 6px;
}

.divider {
  height: 1px;
  background: linear-gradient(to right, var(--gold), var(--border) 60%, transparent);
  margin-bottom: 20px;
}

/* ── Busca ── */
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.search-bar__wrap {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-bar__icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--text-dim);
  pointer-events: none;
}

.search-bar__input {
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
.search-bar__input:focus { border-color: var(--gold); }
.search-bar__input::placeholder { color: var(--text-dim); }

.search-bar__clear {
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
}
.search-bar__clear:hover { color: var(--text); }

.clear-btn {
  padding: 7px 13px;
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
  white-space: nowrap;
}
.clear-btn:hover { border-color: var(--gold); color: var(--gold); }
.clear-btn--center { display: block; margin: 16px auto 0; }

/* ── Abas ── */
.tabs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0;
}

.tab {
  padding: 8px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-dim);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  white-space: nowrap;
}
.tab:hover { color: var(--text-muted); }
.tab--active {
  color: var(--gold);
  border-bottom-color: var(--gold);
}

/* ── Grid ── */
.materials-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
@media (min-width: 640px)  { .materials-grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 900px)  { .materials-grid { grid-template-columns: repeat(4, 1fr); } }
@media (min-width: 1100px) { .materials-grid { grid-template-columns: repeat(5, 1fr); } }

/* ── Skeleton ── */
.skeleton-card {
  height: 62px;
  border-radius: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* ── Paginação ── */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  margin-top: 32px;
  flex-wrap: wrap;
}

.pagination__btn {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.pagination__btn:hover:not(:disabled) {
  border-color: var(--gold);
  color: var(--gold);
}
.pagination__btn--active {
  border-color: var(--gold);
  color: var(--gold);
  background: var(--gold-glow);
}
.pagination__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.pagination__ellipsis {
  color: var(--text-dim);
  padding: 0 4px;
  line-height: 36px;
}

/* ── Estado vazio / erro ── */
.state-msg {
  text-align: center;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
}
.state-msg__title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 600;
}
.state-msg__hint {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text-dim);
}

/* ── Responsivo ── */
@media (max-width: 640px) {
  .materials-page { padding: 20px 16px 60px; }

  /* Barra de filtros */
  .search-bar__wrap { max-width: 100%; }
  .filter-bar { flex-direction: column; align-items: stretch; gap: 8px; }

  /* Paginação com alvos de toque maiores */
  .pagination__btn { min-width: 44px; height: 44px; }
}
</style>
