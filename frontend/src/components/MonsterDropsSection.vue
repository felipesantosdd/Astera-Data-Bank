<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue'
import { useMonsterDrops } from '@/composables/useMonsterDrops'
import { useUI } from '@/composables/useUI'
import { translateCondition } from '@/i18n/dropConditions'
import ItemIcon from '@/components/ItemIcon.vue'
import type { MonsterDrop } from '@/types/monster'
import { usePlannerStore } from '@/stores/plannerStore'
import { usePlannerPresence } from '@/composables/usePlannerPresence'

const props = defineProps<{
  monsterId: number
  monsterName?: string
  monsterEcology?: string | null
}>()
const monsterIdRef = toRef(props, 'monsterId')

const { data: drops, isLoading, isError } = useMonsterDrops(monsterIdRef)
const { t, lang } = useUI()
const plannerStore = usePlannerStore()
const { isMaterialInPlanner, isMaterialCompleted } = usePlannerPresence()

// ── Estrutura de agrupamento ───────────────────────────────────────────
const RANK_ORDER = ['LR', 'HR', 'MR'] as const
type Rank = typeof RANK_ORDER[number]

const SOURCE_ORDER = [
  'carve', 'break', 'questReward', 'shiny',
  'guidingLands', 'siege', 'palico', 'mining', 'tracking', 'other',
] as const
type SourceKey = typeof SOURCE_ORDER[number]

// Constrói uma estrutura aninhada: rank → source → drops[]
const grouped = computed(() => {
  const out: Record<Rank, Partial<Record<SourceKey, MonsterDrop[]>>> = {
    LR: {}, HR: {}, MR: {},
  }
  for (const d of drops.value ?? []) {
    if (!RANK_ORDER.includes(d.rank as Rank)) continue
    const rank = d.rank as Rank
    const src = (SOURCE_ORDER.includes(d.source as SourceKey)
      ? d.source
      : 'other') as SourceKey
    if (!out[rank][src]) out[rank][src] = []
    out[rank][src]!.push(d)
  }
  return out
})

function rankLabel(rank: Rank): string {
  if (rank === 'LR') return t.value.armor.lowRank
  if (rank === 'HR') return t.value.armor.highRank
  return t.value.armor.masterRank
}

function rankBadge(rank: Rank): string {
  if (rank === 'LR') return t.value.armor.rankLR
  if (rank === 'HR') return t.value.armor.rankHR
  return t.value.armor.rankMR
}

function sourceLabel(src: SourceKey): string {
  return t.value.dropSources[src] ?? src
}

// Ranks/sources que efetivamente têm drops (não renderizamos abas vazias)
const availableRanks = computed<Rank[]>(() =>
  RANK_ORDER.filter(r => SOURCE_ORDER.some(s => (grouped.value[r][s]?.length ?? 0) > 0))
)

function sourcesInRank(rank: Rank): SourceKey[] {
  return SOURCE_ORDER.filter(s => (grouped.value[rank][s]?.length ?? 0) > 0)
}

// ── Estado das abas ────────────────────────────────────────────────────
const activeRank   = ref<Rank | null>(null)
const activeSource = ref<SourceKey | null>(null)

// Sempre que mudar de monstro/idioma e os dados chegarem, seleciona o
// primeiro rank/source disponível. Também corrige se a aba ativa virar inválida.
watch(grouped, () => {
  const ranks = availableRanks.value
  if (ranks.length === 0) {
    activeRank.value = null
    activeSource.value = null
    return
  }
  if (!activeRank.value || !ranks.includes(activeRank.value)) {
    activeRank.value = ranks[0]
  }
  const sources = sourcesInRank(activeRank.value!)
  if (!activeSource.value || !sources.includes(activeSource.value)) {
    activeSource.value = sources[0] ?? null
  }
}, { immediate: true })

function selectRank(rank: Rank) {
  activeRank.value = rank
  const sources = sourcesInRank(rank)
  // Se a sub-aba atual existe nesse rank, mantém. Senão pega a primeira.
  if (!activeSource.value || !sources.includes(activeSource.value)) {
    activeSource.value = sources[0] ?? null
  }
}

const currentDrops = computed<MonsterDrop[]>(() => {
  if (!activeRank.value || !activeSource.value) return []
  return grouped.value[activeRank.value][activeSource.value] ?? []
})

const hasAnyDrops = computed(() => (drops.value?.length ?? 0) > 0)

// ── Busca ──────────────────────────────────────────────────────────────
const searchQuery = ref('')
const isSearching = computed(() => searchQuery.value.trim().length > 0)

// Resultados da busca: todos os drops do rank atual cujo nome inclui a query.
// Mostra TODAS as formas de obter aquele item naquele rank (carve, quebra,
// quest reward, etc.), ordenados por % decrescente.
const searchResults = computed<MonsterDrop[]>(() => {
  if (!isSearching.value || !activeRank.value) return []
  const q = searchQuery.value.trim().toLowerCase()
  const matches: MonsterDrop[] = []
  for (const src of SOURCE_ORDER) {
    for (const d of grouped.value[activeRank.value][src] ?? []) {
      if (d.itemName.toLowerCase().includes(q)) matches.push(d)
    }
  }
  return matches.sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))
})

// O que de fato é exibido na lista
const displayedDrops = computed<MonsterDrop[]>(() =>
  isSearching.value ? searchResults.value : currentDrops.value
)

// Reseta a busca ao trocar de monstro (idioma mantém — útil pra comparar)
watch(monsterIdRef, () => { searchQuery.value = '' })

function clearSearch() { searchQuery.value = '' }

function isDropCompleted(drop: MonsterDrop) {
  return isMaterialCompleted(drop.itemId)
}

function addDropToPlanner(drop: MonsterDrop) {
  const monsterNodeId = `monster-${props.monsterId}`
  const hasMonsterNode = plannerStore.nodes.some(node => node.id === monsterNodeId)

  if (!hasMonsterNode && props.monsterName) {
    plannerStore.addMonsterNode({
      monsterId: props.monsterId,
      name: props.monsterName,
      icon: null,
      ecology: props.monsterEcology ?? '',
    })
  }

  const materialNodeId = plannerStore.addChecklistNode({
    title: drop.itemName,
    iconName: drop.iconName,
    iconColor: drop.iconColor,
    item: {
      materialId: drop.itemId,
      name: drop.itemName,
      iconName: drop.iconName,
      iconColor: drop.iconColor,
      quantity: drop.stack ?? 1,
    },
  })

  if (props.monsterName) {
    plannerStore.addEdge({
      id: `edge-${monsterNodeId}-${materialNodeId}-${Date.now()}`,
      source: monsterNodeId,
      target: materialNodeId,
      sourceHandle: 'source',
    })
  }
}
</script>

<template>
  <section class="card card--full drops-section">
    <h2 class="card__title">{{ t.drops.section }}</h2>

    <!-- Loading -->
    <div v-if="isLoading" class="drops-skel">
      <div v-for="i in 3" :key="i" class="drops-skel__row" />
    </div>

    <!-- Erro -->
    <div v-else-if="isError" class="state state--error">
      <p>⚠ {{ t.detail.backendHint }}</p>
    </div>

    <!-- Vazio -->
    <div v-else-if="!hasAnyDrops" class="state">
      <p class="state__hint">{{ t.drops.noDrops }}</p>
    </div>

    <!-- Conteúdo -->
    <template v-else>

      <!-- Tabs de rank (nível externo) -->
      <nav class="rank-tabs" role="tablist">
        <button
          v-for="rank in availableRanks"
          :key="rank"
          class="rank-tab"
          :class="[
            `rank-tab--${rank.toLowerCase()}`,
            { 'rank-tab--active': activeRank === rank }
          ]"
          role="tab"
          :aria-selected="activeRank === rank"
          @click="selectRank(rank)"
        >
          <span class="rank-tab__badge">{{ rankBadge(rank) }}</span>
          <span class="rank-tab__label">{{ rankLabel(rank) }}</span>
        </button>
      </nav>

      <!-- Campo de busca -->
      <div class="search">
        <span class="search__icon" aria-hidden="true">⌕</span>
        <input
          v-model="searchQuery"
          type="text"
          class="search__input"
          :placeholder="t.drops.searchPlaceholder"
        />
        <button
          v-if="isSearching"
          class="search__clear"
          @click="clearSearch"
          :aria-label="t.drops.searchClear"
        >✕</button>
      </div>

      <!-- Sub-tabs de source (escondidas durante busca) -->
      <nav
        v-if="activeRank && !isSearching"
        class="source-tabs"
        role="tablist"
      >
        <button
          v-for="src in sourcesInRank(activeRank)"
          :key="src"
          class="source-tab"
          :class="{ 'source-tab--active': activeSource === src }"
          role="tab"
          :aria-selected="activeSource === src"
          @click="activeSource = src"
        >
          {{ sourceLabel(src) }}
          <span class="source-tab__count">{{ grouped[activeRank][src]?.length }}</span>
        </button>
      </nav>

      <!-- Contador de resultados em modo busca -->
      <p v-if="isSearching && displayedDrops.length > 0" class="search-info">
        <strong>{{ displayedDrops.length }}</strong> {{ t.drops.searchResultsCount }}
      </p>

      <!-- Sem resultados de busca -->
      <div v-if="isSearching && displayedDrops.length === 0" class="state">
        <p class="state__hint">{{ t.drops.searchNoResults }}</p>
      </div>

      <!-- Lista de drops -->
      <ul v-if="displayedDrops.length > 0" class="drop-list">
        <li
          v-for="(d, i) in displayedDrops"
          :key="i"
          class="drop-item"
          :class="{ 'drop-item--completed': isDropCompleted(d) }"
        >
          <ItemIcon :name="d.iconName" :color="d.iconColor" :size="32" />

          <span class="drop-item__name">
            {{ d.itemName }}
            <span v-if="isDropCompleted(d)" class="drop-item__done">✓</span>
          </span>

          <span class="drop-item__qty">×{{ d.stack }}</span>

          <span
            class="drop-item__cond"
            :title="translateCondition(d.condition, lang)"
          >{{ translateCondition(d.condition, lang) }}</span>

          <span class="drop-item__pct" :style="{ '--p': (d.percentage ?? 0) + '%' }">
            <strong>{{ d.percentage }}%</strong>
          </span>

          <button
            class="drop-item__planner"
            :class="{
              'drop-item__planner--planned': isMaterialInPlanner(d.itemId),
              'drop-item__planner--done': isDropCompleted(d),
            }"
            @click="addDropToPlanner(d)"
          >
            {{ isDropCompleted(d) ? '✓' : isMaterialInPlanner(d.itemId) ? '✓ Planner' : '+ Planner' }}
          </button>
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
.drops-section { margin-top: 16px; }

/* ── Skeleton ──────────────────────────────────────────────────────── */
.drops-skel { display: flex; flex-direction: column; gap: 12px; }
.drops-skel__row {
  height: 80px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

/* ── States ────────────────────────────────────────────────────────── */
.state { text-align: center; padding: 40px 20px; color: var(--text-muted); }
.state--error { color: var(--el-fire); }
.state__hint  { font-size: 13px; }

/* ── Rank tabs (nível externo) ─────────────────────────────────────── */
.rank-tabs {
  display: flex;
  gap: 6px;
  margin: 16px 0 14px;
  flex-wrap: wrap;
}
.rank-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  font-family: var(--font-heading);
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.rank-tab:hover {
  color: var(--text);
  border-color: var(--text-muted);
}
.rank-tab__badge {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 700;
  border: 1px solid;
}
.rank-tab--lr .rank-tab__badge { color: #8fb88f; border-color: #4a6e4a; background: rgba(74,110,74,0.15); }
.rank-tab--hr .rank-tab__badge { color: var(--gold); border-color: var(--gold); background: var(--gold-glow); }
.rank-tab--mr .rank-tab__badge { color: var(--el-fire); border-color: var(--el-fire); background: rgba(224,82,40,0.15); }

.rank-tab--active {
  color: var(--text);
  background: var(--surface);
}
.rank-tab--lr.rank-tab--active { border-color: #4a6e4a; box-shadow: 0 0 0 1px #4a6e4a inset; }
.rank-tab--hr.rank-tab--active { border-color: var(--gold);    box-shadow: 0 0 0 1px var(--gold) inset; }
.rank-tab--mr.rank-tab--active { border-color: var(--el-fire); box-shadow: 0 0 0 1px var(--el-fire) inset; }

/* ── Campo de busca ────────────────────────────────────────────────── */
.search {
  position: relative;
  display: flex;
  align-items: center;
  margin: 0 0 14px;
}
.search__icon {
  position: absolute;
  left: 12px;
  font-size: 16px;
  color: var(--text-muted);
  pointer-events: none;
}
.search__input {
  width: 100%;
  padding: 9px 36px 9px 36px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-family: var(--font-body);
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s, background 0.15s;
}
.search__input::placeholder { color: var(--text-dim); }
.search__input:focus {
  border-color: var(--gold);
  background: var(--surface);
}
.search__clear {
  position: absolute;
  right: 8px;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 12px;
  transition: color 0.15s, background 0.15s;
}
.search__clear:hover {
  color: var(--gold);
  background: var(--gold-glow);
}

/* Contador de resultados em modo busca */
.search-info {
  margin: 4px 0 12px;
  font-size: 12px;
  color: var(--text-muted);
  font-style: italic;
}
.search-info strong {
  color: var(--gold);
  font-style: normal;
  font-weight: 700;
}

/* ── Source sub-tabs (nível interno) ───────────────────────────────── */
.source-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin: 0 0 14px;
  padding-bottom: 2px;
  border-bottom: 1px solid var(--border);
}
.source-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  margin-bottom: -1px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-muted);
  font-family: var(--font-heading);
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.source-tab:hover { color: var(--text); }
.source-tab--active {
  color: var(--gold);
  border-bottom-color: var(--gold);
}
.source-tab__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 16px;
  padding: 0 5px;
  border-radius: 8px;
  background: var(--surface-2);
  font-size: 9px;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0;
}
.source-tab--active .source-tab__count {
  background: var(--gold-glow);
  color: var(--gold);
}

/* ── Drop list (uma linha por item) ────────────────────────────────── */
.drop-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.drop-item {
  display: grid;
  grid-template-columns: 32px 1fr auto auto 140px auto;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  transition: border-color 0.15s, background 0.15s;
}
.drop-item:hover {
  border-color: var(--gold);
  background: var(--surface);
}

.drop-item--completed {
  border-color: rgba(92, 184, 92, 0.5);
}

.drop-item__name {
  color: var(--text);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.drop-item__done {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  margin-left: 6px;
  border-radius: 50%;
  background: rgba(92, 184, 92, 0.18);
  color: #5cb85c;
  font-size: 12px;
  font-weight: 800;
}
.drop-item__qty {
  font-family: var(--font-heading);
  color: var(--gold);
  font-weight: 700;
  font-size: 12px;
}
.drop-item__cond {
  color: var(--text-muted);
  font-size: 11px;
  font-style: italic;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

/* Barra visual do percentual */
.drop-item__pct {
  position: relative;
  display: block;
  padding: 4px 10px;
  border-radius: 4px;
  background: var(--surface);
  overflow: hidden;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.drop-item__pct::before {
  content: '';
  position: absolute;
  inset: 0;
  width: var(--p, 0%);
  background: linear-gradient(to right, rgba(196, 154, 42, 0.15), rgba(196, 154, 42, 0.4));
  border-right: 1px solid var(--gold);
  z-index: 0;
}
.drop-item__pct strong {
  position: relative;
  color: var(--text);
  font-weight: 700;
  z-index: 1;
}

.drop-item__planner {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 5px;
  color: var(--text-muted);
  padding: 5px 9px;
  font-family: var(--font-heading);
  font-size: 10px;
  letter-spacing: 0.04em;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.drop-item__planner:hover {
  color: var(--gold);
  border-color: var(--gold);
  background: var(--gold-glow);
}
.drop-item__planner--planned {
  color: var(--gold);
  border-color: var(--gold);
  background: var(--gold-glow);
}
.drop-item__planner--done {
  color: #5cb85c;
  border-color: rgba(92, 184, 92, 0.5);
  background: rgba(92, 184, 92, 0.12);
}

/* Mobile: empilha colunas */
@media (max-width: 640px) {
  .drop-item {
    grid-template-columns: 32px 1fr auto;
    grid-template-rows: auto auto;
    row-gap: 4px;
  }
  .drop-item__cond {
    grid-column: 2 / -1;
    grid-row: 2;
    text-align: left;
  }
  .drop-item__pct {
    grid-column: 3;
    grid-row: 1;
  }
  .drop-item__planner {
    grid-column: 2 / -1;
    grid-row: 3;
    justify-self: start;
  }
}
</style>
