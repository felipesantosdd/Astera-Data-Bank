<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLocations, useLocationItems, useLocationMonsters } from '@/composables/useLocations'
import type { LocationItem, LocationMonster } from '@/composables/useLocations'
import { usePlannerStore } from '@/stores/plannerStore'
import LocationIcon from '@/components/LocationIcon.vue'
import ItemIcon from '@/components/ItemIcon.vue'

const route = useRoute()
const router = useRouter()
const plannerStore = usePlannerStore()

const locationId = computed(() => Number(route.params.id))
const locationIdRef = computed(() => locationId.value || null)

const { data: locations } = useLocations()
const { data: locationItems, isLoading: itemsLoading } = useLocationItems(locationIdRef)
const { data: locationMonsters, isLoading: monstersLoading } = useLocationMonsters(locationIdRef)

const location = computed(() => locations.value?.find(l => l.id === locationId.value) ?? null)

// ── Tabs ──────────────────────────────────────────────────────────────────────
type MainTab = 'monsters' | 'items'
const activeTab = ref<MainTab>('monsters')

// ── Rank sub-tabs (only for items with rank data) ─────────────────────────────
const RANKS = ['LR', 'HR', 'MR'] as const
type Rank = typeof RANKS[number]
const activeRank = ref<Rank | null>(null)

const hasRankData = computed(() =>
  (locationItems.value ?? []).some(i => i.rank != null),
)

const availableRanks = computed<Rank[]>(() => {
  if (!hasRankData.value) return []
  const items = locationItems.value ?? []
  return RANKS.filter(r => items.some(i => i.rank === r))
})

const rankLabel: Record<Rank, string> = { LR: 'Low Rank', HR: 'High Rank', MR: 'Master Rank' }

watch(availableRanks, ranks => {
  if (ranks.length && (activeRank.value === null || !ranks.includes(activeRank.value))) {
    activeRank.value = ranks[0]
  }
}, { immediate: true })

// ── Items grouped by area ─────────────────────────────────────────────────────
const filteredItems = computed<LocationItem[]>(() => {
  const items = locationItems.value ?? []
  if (hasRankData.value && activeRank.value) {
    return items.filter(i => i.rank === activeRank.value)
  }
  return items
})

const itemsByArea = computed(() => {
  const map = new Map<number | null, LocationItem[]>()
  for (const item of filteredItems.value) {
    const key = item.area
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  }
  for (const list of map.values()) list.sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))
  return [...map.entries()].sort(([a], [b]) => (a ?? 0) - (b ?? 0))
})

// ── Navigation ────────────────────────────────────────────────────────────────
function goToMonster(monsterId: number) {
  router.push({ name: 'monster-detail', params: { id: monsterId } })
}

// ── Planner ───────────────────────────────────────────────────────────────────
const addedToPlanner = ref(false)
const monstersAddedToPlanner = ref(new Set<number>())

function addRegionToPlanner() {
  if (!location.value) return
  plannerStore.addRegionNode(location.value.name)
  addedToPlanner.value = true
}

function addMonsterWithRegion(m: LocationMonster) {
  if (!location.value) return

  // Ensure region node exists
  const regionNodeId = `region-${location.value.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
  plannerStore.addRegionNode(location.value.name)

  // Add monster node
  const added = plannerStore.addMonsterNode({
    monsterId: m.monsterId,
    name: m.name,
    icon: null,
    ecology: m.ecology ?? '',
  })

  // Link region → monster
  const monsterNodeId = `monster-${m.monsterId}`
  const edgeId = `edge-${regionNodeId}-${monsterNodeId}`
  plannerStore.addEdge({ id: edgeId, source: regionNodeId, target: monsterNodeId })

  monstersAddedToPlanner.value = new Set([...monstersAddedToPlanner.value, m.monsterId])
}
</script>

<template>
  <div class="region-detail">
    <!-- Header -->
    <div class="region-detail__header">
      <button class="back-btn" @click="router.push({ name: 'regions' })">
        ‹ Regiões
      </button>

      <div v-if="location" class="region-detail__title-row">
        <LocationIcon :location-name="location.name" :size="48" />
        <div>
          <p class="region-detail__label">Região</p>
          <h1 class="region-detail__title">{{ location.name }}</h1>
        </div>
      </div>

      <button
        v-if="location"
        class="planner-btn"
        :class="{ 'planner-btn--added': addedToPlanner }"
        @click="addRegionToPlanner"
      >
        {{ addedToPlanner ? '✓ No Planner' : '+ Planner' }}
      </button>
    </div>

    <div class="divider" />

    <!-- Main tabs -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ 'tab--active': activeTab === 'monsters' }"
        @click="activeTab = 'monsters'"
      >
        Monstros
        <span v-if="locationMonsters?.length" class="tab__count">{{ locationMonsters.length }}</span>
      </button>
      <button
        class="tab"
        :class="{ 'tab--active': activeTab === 'items' }"
        @click="activeTab = 'items'"
      >
        Coletáveis
        <span v-if="locationItems?.length" class="tab__count">{{ locationItems.length }}</span>
      </button>
    </div>

    <!-- ── Monsters tab ── -->
    <div v-if="activeTab === 'monsters'" class="tab-content">
      <div v-if="monstersLoading" class="state">Carregando monstros...</div>
      <div v-else-if="!locationMonsters?.length" class="state">
        Sem dados de monstros para esta região.
      </div>
      <div v-else class="monster-grid">
        <div
          v-for="m in locationMonsters"
          :key="m.monsterId"
          class="monster-card"
        >
          <!-- clickable area → monster detail -->
          <button class="monster-card__main" @click="goToMonster(m.monsterId)">
            <div class="monster-card__icon-wrap">
              <img
                :src="`/monsters/${m.monsterId}.png`"
                class="monster-card__icon"
                :alt="m.name"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
            </div>
            <div class="monster-card__body">
              <span class="monster-card__name">{{ m.name }}</span>
              <span class="monster-card__ecology">{{ m.ecology }}</span>
            </div>
          </button>

          <div class="monster-card__footer">
            <div v-if="m.startArea || m.moveArea || m.restArea" class="monster-card__areas">
              <div v-if="m.startArea" class="area-badge area-badge--start">
                <span class="area-badge__label">Início</span>
                <span>{{ m.startArea }}</span>
              </div>
              <div v-if="m.moveArea" class="area-badge">
                <span class="area-badge__label">Move</span>
                <span>{{ m.moveArea }}</span>
              </div>
              <div v-if="m.restArea" class="area-badge area-badge--rest">
                <span class="area-badge__label">Repouso</span>
                <span>{{ m.restArea }}</span>
              </div>
            </div>
            <button
              class="monster-planner-btn"
              :class="{ 'monster-planner-btn--added': monstersAddedToPlanner.has(m.monsterId) }"
              :title="monstersAddedToPlanner.has(m.monsterId) ? 'No Planner' : 'Adicionar ao Planner'"
              @click.stop="addMonsterWithRegion(m)"
            >
              {{ monstersAddedToPlanner.has(m.monsterId) ? '✓' : '+' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Items tab ── -->
    <div v-else class="tab-content">
      <!-- Rank sub-tabs -->
      <div v-if="availableRanks.length > 1" class="rank-tabs">
        <button
          v-for="rank in availableRanks"
          :key="rank"
          class="rank-tab"
          :class="{ 'rank-tab--active': activeRank === rank }"
          @click="activeRank = rank"
        >
          {{ rankLabel[rank] }}
        </button>
      </div>

      <div v-if="itemsLoading" class="state">Carregando itens...</div>
      <div v-else-if="!filteredItems.length" class="state">
        Sem dados de coleta disponíveis para esta região.
      </div>
      <div v-else class="areas-body">
        <div v-for="[area, items] in itemsByArea" :key="String(area)" class="area-section">
          <h3 class="area-section__title">
            {{ items[0]?.areaLabel ?? (area != null ? `Área ${area}` : 'Geral') }}
          </h3>
          <div class="items-grid">
            <div
              v-for="(item, i) in items"
              :key="`${item.itemId}-${item.area}-${i}`"
              class="item-row"
            >
              <ItemIcon :name="item.iconName" :color="item.iconColor" :size="34" />
              <div class="item-row__info">
                <span class="item-row__name">{{ item.itemName }}</span>
                <span v-if="item.monsterName" class="item-row__sub">{{ item.monsterName }}</span>
              </div>
              <span v-if="item.nodes" class="item-row__nodes">×{{ item.nodes }}</span>
              <strong v-if="item.percentage != null" class="item-row__pct">{{ item.percentage }}%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.region-detail {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}

/* ── Header ── */
.back-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-family: var(--font-heading);
  font-size: 12px;
  letter-spacing: 0.08em;
  cursor: pointer;
  padding: 0;
  margin-bottom: 20px;
  display: block;
  transition: color 0.15s;
}
.back-btn:hover { color: var(--gold); }

.region-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.region-detail__title-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.region-detail__label {
  font-family: var(--font-heading);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0 0 4px;
}

.region-detail__title {
  font-family: var(--font-heading);
  font-size: clamp(22px, 4vw, 32px);
  color: var(--text);
  margin: 0;
}

.planner-btn {
  padding: 8px 18px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
  color: var(--text-muted);
  font-family: var(--font-heading);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  white-space: nowrap;
}
.planner-btn:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-glow); }
.planner-btn--added { border-color: rgba(92,184,92,0.55); color: #5cb85c; background: rgba(92,184,92,0.06); }

.divider {
  height: 1px;
  background: linear-gradient(to right, var(--gold), var(--border) 60%, transparent);
  margin-bottom: 0;
}

/* ── Main tabs ── */
.tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  margin-bottom: 24px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 14px 22px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  color: var(--text-dim);
  font-family: var(--font-heading);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.tab:hover { color: var(--text); }
.tab--active { color: var(--gold); border-bottom-color: var(--gold); }

.tab__count {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1px 7px;
  font-size: 10px;
  color: var(--text-dim);
}

.tab--active .tab__count { border-color: var(--gold); color: var(--gold); }

/* ── Rank sub-tabs ── */
.rank-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 20px;
}

.rank-tab {
  padding: 6px 16px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text-muted);
  font-family: var(--font-heading);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.rank-tab:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-glow); }
.rank-tab--active { border-color: var(--gold); color: var(--gold); background: var(--gold-glow); }

.tab-content { min-height: 200px; }

.state {
  padding: 60px 0;
  text-align: center;
  color: var(--text-dim);
  font-style: italic;
}

/* ── Monster grid ── */
.monster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 10px;
}

.monster-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--surface);
  overflow: hidden;
  transition: border-color 0.2s, background 0.2s;
}
.monster-card:hover { border-color: var(--border-hover); background: var(--surface-2); }

.monster-card__main {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px 10px;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background 0.15s;
}
.monster-card__main:hover { background: rgba(196, 154, 42, 0.05); }

.monster-card__icon-wrap {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
}

.monster-card__icon {
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.monster-card__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.monster-card__name {
  font-family: var(--font-heading);
  font-size: 15px;
  color: var(--text);
}

.monster-card__ecology {
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.monster-card__footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px 12px;
  border-top: 1px solid var(--border);
}

.monster-card__areas {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  flex: 1;
}

.monster-planner-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-muted);
  font-size: 16px;
  cursor: pointer;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.monster-planner-btn:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-glow); }
.monster-planner-btn--added { border-color: rgba(92,184,92,0.55); color: #5cb85c; background: rgba(92,184,92,0.06); }

.area-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  font-size: 11px;
  color: var(--text-muted);
  max-width: 100%;
  overflow: hidden;
}

.area-badge__label {
  font-family: var(--font-heading);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-dim);
  white-space: nowrap;
}

.area-badge--start { border-color: rgba(196, 154, 42, 0.3); }
.area-badge--rest  { border-color: rgba(100, 150, 200, 0.25); }

/* ── Items ── */
.areas-body {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.area-section__title {
  font-family: var(--font-heading);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin: 0 0 10px;
  padding-bottom: 7px;
  border-bottom: 1px solid var(--border);
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 6px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface);
  transition: border-color 0.15s, background 0.15s;
}
.item-row:hover { border-color: var(--border-hover); background: var(--surface-2); }

.item-row__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.item-row__name {
  font-size: 13px;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-row__sub {
  font-size: 10px;
  color: var(--text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-row__nodes {
  font-size: 11px;
  color: var(--text-dim);
  white-space: nowrap;
}

.item-row__pct {
  font-family: var(--font-heading);
  font-size: 14px;
  color: var(--gold);
  white-space: nowrap;
}

@media (max-width: 640px) {
  .region-detail { padding: 24px 14px 64px; }
  .monster-grid { grid-template-columns: 1fr; }
  .items-grid { grid-template-columns: 1fr; }
  .region-detail__header { flex-direction: column; align-items: flex-start; }
}
</style>
