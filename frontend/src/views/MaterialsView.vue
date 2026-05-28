<script setup lang="ts">
import { ref, computed } from 'vue'
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

// ── Grupos de tipo por iconName ───────────────────────────────────────────────
const MONSTER_PARTS = new Set([
  'Body','Bone','Carapace','Fang','Gem','Hide','Husk','Jaw','Liquid',
  'Mantle','Plate','Sac','Scale','Tail','Web','Wing',
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

// ── Filtros ──────────────────────────────────────────────────────────────────
const search      = ref('')
const selectedGroup = ref('')  // '' = todos

const groupOptions = computed(() => [
  { key: 'monster_part', label: t.value.materials.groupMonsterPart },
  { key: 'mineral',      label: t.value.materials.groupMineral },
  { key: 'plant',        label: t.value.materials.groupPlant },
  { key: 'other',        label: t.value.materials.groupOther },
])

const filtered = computed(() => {
  if (!items.value) return []
  const q   = search.value.trim().toLowerCase()
  const grp = selectedGroup.value
  return items.value.filter(m => {
    if (q   && !m.name.toLowerCase().includes(q)) return false
    if (grp && iconGroup(m.iconName) !== grp)      return false
    return true
  })
})

const hasFilters = computed(() => search.value.trim() !== '' || selectedGroup.value !== '')
function clearFilters() { search.value = ''; selectedGroup.value = '' }
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
      </p>
    </header>

    <div class="divider" />

    <!-- Filtros -->
    <div v-if="!isLoading && !isError" class="filter-bar">
      <div class="filter-bar__search">
        <svg class="filter-bar__search-icon" viewBox="0 0 20 20" fill="none">
          <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.5"/>
          <path d="M13 13l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input
          v-model="search"
          class="filter-bar__input"
          type="text"
          :placeholder="t.materials.searchPlaceholder"
        />
        <button v-if="search" class="filter-bar__clear-input" @click="search = ''">×</button>
      </div>

      <div class="filter-bar__select-wrap">
        <label class="filter-bar__select-label">{{ t.materials.filterType }}</label>
        <select v-model="selectedGroup" class="filter-bar__select">
          <option value="">{{ t.materials.filterAll }}</option>
          <option v-for="g in groupOptions" :key="g.key" :value="g.key">{{ g.label }}</option>
        </select>
      </div>

      <button v-if="hasFilters" class="filter-bar__clear-btn" @click="clearFilters">
        {{ t.materials.clearFilters }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="materials-grid">
      <div v-for="i in 24" :key="i" class="skeleton-card" />
    </div>

    <!-- Erro -->
    <div v-else-if="isError" class="materials-page__error">
      <p>⚠ {{ t.listing.loadingError }}</p>
    </div>

    <!-- Grid -->
    <template v-else>
      <div v-if="filtered.length > 0" class="materials-grid">
        <MaterialCard
          v-for="item in filtered"
          :key="item.id"
          :item="item"
          @open="openModal"
        />
      </div>

      <div v-else class="materials-page__empty">
        <p class="materials-page__empty-title">{{ t.materials.noResults }}</p>
        <p class="materials-page__empty-hint">{{ t.materials.noResultsHint }}</p>
        <button class="filter-bar__clear-btn filter-bar__clear-btn--center" @click="clearFilters">
          {{ t.materials.clearFilters }}
        </button>
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
  margin-bottom: 24px;
}

/* ── Barra de filtros (reutiliza classes da MonstersView) ── */
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

.filter-bar__input:focus    { border-color: var(--gold); }
.filter-bar__input::placeholder { color: var(--text-dim); }

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
}
.filter-bar__clear-input:hover { color: var(--text); }

.filter-bar__select-wrap {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 160px;
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
  padding: 8px 28px 8px 10px;
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
.filter-bar__clear-btn:hover { border-color: var(--gold); color: var(--gold); }
.filter-bar__clear-btn--center { margin-top: 16px; align-self: center; }

/* ── Grid de materiais ── */
.materials-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

@media (min-width: 480px)  { .materials-grid { grid-template-columns: repeat(2, 1fr); } }
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

/* ── Erro / vazio ── */
.materials-page__error {
  text-align: center;
  padding: 60px 20px;
  color: var(--el-fire);
  font-family: var(--font-heading);
}
.materials-page__empty {
  text-align: center;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.materials-page__empty-title {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-muted);
}
.materials-page__empty-hint {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text-dim);
}
</style>
