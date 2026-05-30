<script setup lang="ts">
import { computed, watch } from 'vue'
import MaterialCard from '@/components/MaterialCard.vue'
import ItemSourcesModal from '@/components/ItemSourcesModal.vue'
import PaginationControls from '@/components/PaginationControls.vue'
import SearchInput from '@/components/SearchInput.vue'
import { useItems }       from '@/composables/useItems'
import { useConsumables } from '@/composables/useConsumables'
import { useUI } from '@/composables/useUI'
import { useStoredState } from '@/composables/useStoredState'

const { data: materials, isLoading: loadingMaterials, isError } = useItems()
const { data: consumables, isLoading: loadingConsumables }       = useConsumables()
const { t } = useUI()

// Aba principal: materiais de craft vs consumíveis
const mainTab = useStoredState<'materials' | 'consumables'>('adb:materials:main-tab', 'materials')

// ── Modal com pilha de navegação ─────────────────────────────────────────────
interface ModalEntry { id: number; name: string }
const modalStack = useStoredState<ModalEntry[]>('adb:materials:modal-stack', [])

const activeItemId   = computed(() => modalStack.value[modalStack.value.length - 1]?.id   ?? null)
const activeItemName = computed(() => modalStack.value[modalStack.value.length - 1]?.name ?? '')

function openModal(id: number, name: string) {
  modalStack.value = [{ id, name }]
}
function closeModal() { modalStack.value = [] }
function navigateModal(id: number, name: string) {
  modalStack.value = [...modalStack.value, { id, name }]
}
function backModal() {
  if (modalStack.value.length > 1) modalStack.value = modalStack.value.slice(0, -1)
  else modalStack.value = []
}

// ── Grupos por iconName ───────────────────────────────────────────────────────
const MONSTER_PARTS = new Set([
  'Body','Bone','Carapace','Fang','Gem','Hide','Husk','Jaw','Liquid',
  'Mantle','Plate','Sac','Scale','Tail','Webbing','Wing',
])
const MINERALS = new Set(['Ore','CharmOre','Feystone','Sphere','Streamstone'])
const BUGS     = new Set(['Bug','Herb','Honey','Mushroom','Seed'])  // insetos e itens naturais

function iconGroup(iconName: string | null): string {
  if (!iconName) return 'other'
  if (MONSTER_PARTS.has(iconName)) return 'monster_part'
  if (MINERALS.has(iconName))      return 'mineral'
  if (BUGS.has(iconName))          return 'bug'
  return 'other'
}

// ── Abas ─────────────────────────────────────────────────────────────────────
const activeTab = useStoredState('adb:materials:active-tab', 'all')

const tabs = computed(() => [
  { key: 'all',          label: t.value.materials.filterAll },
  { key: 'monster_part', label: t.value.materials.groupMonsterPart },
  { key: 'mineral',      label: t.value.materials.groupMineral },
  { key: 'bug',          label: t.value.materials.groupPlant },
  { key: 'other',        label: t.value.materials.groupOther },
])

// ── Busca ─────────────────────────────────────────────────────────────────────
const search = useStoredState('adb:materials:search', '')

// Fonte de dados ativa
const items = computed(() =>
  mainTab.value === 'consumables' ? consumables.value : materials.value,
)
const isLoading = computed(() =>
  mainTab.value === 'consumables' ? loadingConsumables.value : loadingMaterials.value,
)

// Grupos de consumíveis
const NATURAL_ICONS  = new Set(['Herb','Mushroom','Seed','Honey','Bait'])
const UTILITY_ICONS  = new Set(['Liquid','Pellets','Meat','Barrel','BarrelBomb','Trap','TrapTool','Smoke','Dung'])

function consumableGroup(iconName: string | null): string {
  if (!iconName) return 'other'
  if (NATURAL_ICONS.has(iconName))  return 'natural'
  if (UTILITY_ICONS.has(iconName))  return 'utility'
  return 'other'
}

const consumableTabs = computed(() => [
  { key: 'all',     label: t.value.materials.filterAll },
  { key: 'natural', label: 'Naturais' },
  { key: 'utility', label: 'Utilidades' },
])

// ── Filtro combinado ──────────────────────────────────────────────────────────
const filtered = computed(() => {
  if (!items.value) return []
  const q   = search.value.trim().toLowerCase()
  const tab = activeTab.value

  return items.value.filter(m => {
    if (q && !m.name.toLowerCase().includes(q)) return false
    if (tab !== 'all') {
      const group = mainTab.value === 'consumables'
        ? consumableGroup(m.iconName)
        : iconGroup(m.iconName)
      if (group !== tab) return false
    }
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
const currentPage    = useStoredState('adb:materials:page', 1)
const totalPages     = computed(() => Math.ceil(filtered.value.length / ITEMS_PER_PAGE))

const paginated = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  return filtered.value.slice(start, start + ITEMS_PER_PAGE)
})

// Volta pra página 1 ao trocar filtro/busca/aba principal
watch([search, activeTab], () => { currentPage.value = 1 })
watch(mainTab, () => { currentPage.value = 1 })
watch(totalPages, (pages) => {
  if (pages > 0 && currentPage.value > pages) currentPage.value = pages
})

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

    <!-- Abas principais: Materiais | Consumíveis -->
    <div class="main-tabs">
      <button class="main-tab" :class="{ 'main-tab--active': mainTab === 'materials' }" @click="mainTab = 'materials'">
        Materiais
      </button>
      <button class="main-tab" :class="{ 'main-tab--active': mainTab === 'consumables' }" @click="mainTab = 'consumables'">
        Consumíveis
      </button>
    </div>

    <!-- Barra de busca -->
    <div v-if="!isLoading && !isError" class="search-bar">
      <SearchInput v-model="search" :placeholder="t.materials.searchPlaceholder" />
      <button v-if="hasFilters" class="clear-btn" @click="clearFilters">
        {{ t.materials.clearFilters }}
      </button>
    </div>

    <!-- Abas de filtro dinâmicas -->
    <div v-if="!isLoading && !isError" class="tabs">
      <button
        v-for="tab in (mainTab === 'consumables' ? consumableTabs : tabs)"
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
      <PaginationControls :current-page="currentPage" :total-pages="totalPages" @go-to="goTo" />
    </template>

    <!-- Modal de fontes -->
    <ItemSourcesModal
      :item-id="activeItemId"
      :item-name="activeItemName"
      :can-go-back="modalStack.length > 1"
      @close="closeModal"
      @navigate="(id, name) => navigateModal(id, name)"
      @back="backModal"
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
  margin-bottom: 16px;
}

/* ── Abas principais (Materiais | Consumíveis) ── */
.main-tabs {
  display: flex;
  gap: 4px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px;
  width: fit-content;
  margin-bottom: 16px;
}

.main-tab {
  font-family: var(--font-heading);
  font-size: 12px;
  letter-spacing: .06em;
  padding: 7px 20px;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: color .15s, background .15s;
}

.main-tab--active { background: var(--gold-glow); color: var(--gold); }

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
