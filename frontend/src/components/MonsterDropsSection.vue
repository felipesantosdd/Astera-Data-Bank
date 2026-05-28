<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useMonsterDrops } from '@/composables/useMonsterDrops'
import { useUI } from '@/composables/useUI'
import ItemIcon from '@/components/ItemIcon.vue'
import type { MonsterDrop } from '@/types/monster'

const props = defineProps<{ monsterId: number }>()
const monsterIdRef = toRef(props, 'monsterId')

const { data: drops, isLoading, isError } = useMonsterDrops(monsterIdRef)
const { t } = useUI()

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

function hasAnyDropsInRank(rank: Rank): boolean {
  const sources = grouped.value[rank]
  return SOURCE_ORDER.some(s => (sources[s]?.length ?? 0) > 0)
}

const hasAnyDrops = computed(() => (drops.value?.length ?? 0) > 0)
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
      <div
        v-for="rank in RANK_ORDER"
        :key="rank"
        class="rank-group"
        v-show="hasAnyDropsInRank(rank)"
      >
        <h3 class="rank-group__title">
          <span class="rank-pill" :class="`rank-pill--${rank.toLowerCase()}`">{{ rankBadge(rank) }}</span>
          {{ rankLabel(rank) }}
        </h3>

        <div
          v-for="src in SOURCE_ORDER"
          :key="src"
          class="source-group"
          v-show="(grouped[rank][src]?.length ?? 0) > 0"
        >
          <h4 class="source-group__title">{{ sourceLabel(src) }}</h4>

          <ul class="drop-list">
            <li v-for="(d, i) in grouped[rank][src]" :key="i" class="drop-item">
              <ItemIcon :name="d.iconName" :color="d.iconColor" :size="32" />

              <span class="drop-item__name">{{ d.itemName }}</span>

              <span class="drop-item__qty">×{{ d.stack }}</span>

              <span class="drop-item__cond" :title="d.condition">{{ d.condition }}</span>

              <span class="drop-item__pct" :style="{ '--p': (d.percentage ?? 0) + '%' }">
                <strong>{{ d.percentage }}%</strong>
              </span>
            </li>
          </ul>
        </div>
      </div>
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

/* ── Rank group ────────────────────────────────────────────────────── */
.rank-group { margin-top: 24px; }
.rank-group__title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-heading);
  font-size: 14px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text);
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.rank-pill {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  border: 1px solid;
}
.rank-pill--lr { color: #8fb88f; border-color: #4a6e4a; background: rgba(74,110,74,0.15); }
.rank-pill--hr { color: var(--gold); border-color: var(--gold); background: var(--gold-glow); }
.rank-pill--mr { color: var(--el-fire); border-color: var(--el-fire); background: rgba(224,82,40,0.15); }

/* ── Source group ──────────────────────────────────────────────────── */
.source-group { margin: 12px 0 18px; }
.source-group__title {
  font-family: var(--font-heading);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0 0 8px;
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
  grid-template-columns: 32px 1fr auto auto 140px;
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

.drop-item__name {
  color: var(--text);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
}
</style>
