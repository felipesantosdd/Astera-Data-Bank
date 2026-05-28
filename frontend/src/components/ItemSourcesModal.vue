<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useItemSources } from '@/composables/useItemSources'
import { useUI } from '@/composables/useUI'

const props = defineProps<{
  itemId:   number | null
  itemName: string
}>()

const emit = defineEmits<{ close: [] }>()

const { t, lang } = useUI()

// ── Helpers de tradução ───────────────────────────────────────────────────────
function translateCondition(cond: string): string {
  return (t.value.conditions as Record<string, string>)[cond] ?? cond
}

const QUEST_CATEGORY: Record<string, Record<string, string>> = {
  en: { assigned: 'Story', optional: 'Optional', event: 'Event', arena: 'Arena', challenge: 'Challenge', special: 'Special' },
  pt: { assigned: 'Principal', optional: 'Opcional', event: 'Evento', arena: 'Arena', challenge: 'Desafio', special: 'Especial' },
}
function questCategory(cat: string): string {
  return QUEST_CATEGORY[lang.value]?.[cat] ?? QUEST_CATEGORY.en[cat] ?? cat
}

function groupLabel(group: string): string {
  if (group === 'A') return t.value.itemSources.rewardGroupA
  if (group === 'B') return t.value.itemSources.rewardGroupB
  if (group === 'C') return t.value.itemSources.rewardGroupC
  return group
}

// ── Dados ─────────────────────────────────────────────────────────────────────
const itemIdRef = computed(() => props.itemId)
const { data: sources, isLoading } = useItemSources(itemIdRef)

const isOpen  = computed(() => props.itemId !== null)
const isEmpty = computed(() =>
  !!sources.value &&
  sources.value.rewards.length  === 0 &&
  sources.value.gathering.length === 0 &&
  (sources.value.quests?.length ?? 0) === 0
)

// ── Abas de rank ──────────────────────────────────────────────────────────────
const RANKS = ['LR', 'HR', 'MR'] as const
type Rank = typeof RANKS[number]

/** Quais ranks têm dados (pelo menos 1 item em qualquer seção) */
const availableRanks = computed<Rank[]>(() => {
  if (!sources.value) return []
  return RANKS.filter(r =>
    sources.value!.rewards.some(x => x.rank === r)        ||
    sources.value!.gathering.some(x => x.rank === r || x.rank == null) ||
    (sources.value!.quests ?? []).some(x => x.rank === r)
  )
})

const activeRank = ref<Rank>('LR')

// Reseta para o primeiro rank disponível quando abre um novo item
watch(() => props.itemId, () => {
  activeRank.value = 'LR'
})
watch(availableRanks, (ranks) => {
  if (ranks.length && !ranks.includes(activeRank.value)) {
    activeRank.value = ranks[0]
  }
}, { immediate: true })

/** Label do tab de rank */
function rankLabel(r: Rank): string {
  if (r === 'LR') return t.value.armor.lowRank
  if (r === 'HR') return t.value.armor.highRank
  return t.value.armor.masterRank
}

// ── Dados filtrados por rank ativo ────────────────────────────────────────────
const rankRewards = computed(() =>
  sources.value?.rewards.filter(x => x.rank === activeRank.value) ?? []
)

/** Gathering inclui rank null (itens disponíveis em todos os ranks) */
const rankGathering = computed(() =>
  sources.value?.gathering.filter(x => x.rank === activeRank.value || x.rank == null) ?? []
)

const rankQuests = computed(() =>
  (sources.value?.quests ?? []).filter(x => x.rank === activeRank.value)
)

const rankIsEmpty = computed(() =>
  rankRewards.value.length === 0 &&
  rankGathering.value.length === 0 &&
  rankQuests.value.length === 0
)

// ── ESC + scroll lock ─────────────────────────────────────────────────────────
function handleKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) emit('close')
}
watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKey)
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="backdrop" @click.self="emit('close')">
        <div class="modal" @click.stop>

          <!-- Header -->
          <header class="modal__header">
            <div class="modal__heading">
              <p class="modal__label">{{ t.itemSources.title }}</p>
              <h2 class="modal__title">{{ itemName }}</h2>
            </div>
            <button class="modal__close" @click="emit('close')" :aria-label="t.itemSources.close">✕</button>
          </header>

          <!-- Loading -->
          <div v-if="isLoading" class="modal__body">
            <div class="modal__state">
              <div class="modal__skel" />
              <div class="modal__skel" />
            </div>
          </div>

          <!-- Sem fontes -->
          <div v-else-if="isEmpty" class="modal__body">
            <div class="modal__empty">
              <div class="modal__empty-icon">?</div>
              <p class="modal__empty-title">{{ t.itemSources.noSources }}</p>
              <p class="modal__empty-hint">{{ t.itemSources.noSourcesHint }}</p>
            </div>
          </div>

          <!-- Abas de rank + conteúdo -->
          <template v-else-if="sources">
            <!-- Tabs de rank -->
            <div class="rank-tabs">
              <button
                v-for="r in availableRanks"
                :key="r"
                class="rank-tab"
                :class="[`rank-tab--${r.toLowerCase()}`, { 'rank-tab--active': activeRank === r }]"
                @click="activeRank = r"
              >
                {{ rankLabel(r) }}
              </button>
            </div>

            <!-- Corpo scrollável -->
            <div class="modal__body">

              <!-- Rank sem dados -->
              <div v-if="rankIsEmpty" class="modal__state" style="font-style: italic; color: var(--text-dim)">
                {{ t.itemSources.noSourcesForRank }}
              </div>

              <template v-else>
                <!-- Drops de monstros -->
                <section v-if="rankRewards.length > 0" class="modal__section">
                  <h3 class="modal__section-title">{{ t.itemSources.monsterDrops }}</h3>
                  <div class="modal__table-wrap">
                    <table class="src-table">
                      <thead>
                        <tr>
                          <th class="src-table__col-name">{{ t.itemSources.colMonster }}</th>
                          <th>{{ t.itemSources.colCondition }}</th>
                          <th class="src-table__col-pct">{{ t.itemSources.colChance }}</th>
                          <th>{{ t.itemSources.colStack }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(r, i) in rankRewards" :key="i">
                          <td class="src-table__name">{{ r.monsterName }}</td>
                          <td class="src-table__cond">{{ translateCondition(r.condition) }}</td>
                          <td class="src-table__pct">
                            <span class="pct-bar" :style="{ '--p': (r.percentage ?? 0) + '%' }">
                              <strong>{{ r.percentage }}%</strong>
                            </span>
                          </td>
                          <td class="src-table__stack">×{{ r.stack }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <!-- Coleta em mapas -->
                <section v-if="rankGathering.length > 0" class="modal__section">
                  <h3 class="modal__section-title">{{ t.itemSources.gathering }}</h3>
                  <div class="modal__table-wrap">
                    <table class="src-table">
                      <thead>
                        <tr>
                          <th class="src-table__col-name">{{ t.itemSources.colLocation }}</th>
                          <th>{{ t.itemSources.colArea }}</th>
                          <th class="src-table__col-pct">{{ t.itemSources.colChance }}</th>
                          <th>{{ t.itemSources.colStack }}</th>
                          <th>{{ t.itemSources.colNodes }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(g, i) in rankGathering" :key="i">
                          <td class="src-table__name">{{ g.locationName }}</td>
                          <td>{{ t.itemSources.areaPrefix }} {{ g.area }}</td>
                          <td class="src-table__pct">
                            <span class="pct-bar" :style="{ '--p': (g.percentage ?? 0) + '%' }">
                              <strong>{{ g.percentage }}%</strong>
                            </span>
                          </td>
                          <td class="src-table__stack">×{{ g.stack }}</td>
                          <td>{{ g.nodes }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <!-- Recompensas de missão -->
                <section v-if="rankQuests.length > 0" class="modal__section">
                  <h3 class="modal__section-title">{{ t.itemSources.questRewards }}</h3>
                  <div class="modal__table-wrap">
                    <table class="src-table">
                      <thead>
                        <tr>
                          <th class="src-table__col-name">{{ t.itemSources.colQuest }}</th>
                          <th>{{ t.itemSources.colCategory }}</th>
                          <th>{{ t.itemSources.colStars }}</th>
                          <th>{{ t.itemSources.colGroup }}</th>
                          <th class="src-table__col-pct">{{ t.itemSources.colChance }}</th>
                          <th>{{ t.itemSources.colStack }}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(q, i) in rankQuests" :key="i">
                          <td class="src-table__name">{{ q.questName }}</td>
                          <td>
                            <span class="quest-cat" :class="`quest-cat--${q.category}`">
                              {{ questCategory(q.category) }}
                            </span>
                          </td>
                          <td class="src-table__stars">
                            {{ q.stars ? '★'.repeat(Math.min(q.stars, 5)) : '—' }}
                          </td>
                          <td class="src-table__group">{{ groupLabel(q.rewardGroup) }}</td>
                          <td class="src-table__pct">
                            <span class="pct-bar" :style="{ '--p': (q.percentage ?? 0) + '%' }">
                              <strong>{{ q.percentage }}%</strong>
                            </span>
                          </td>
                          <td class="src-table__stack">×{{ q.stack }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              </template>

            </div>
          </template>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Backdrop / modal ─────────────────────────────────────────────── */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal {
  background: var(--surface);
  border: 1px solid var(--gold);
  border-radius: 12px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7), 0 0 32px var(--gold-glow);
  width: 100%;
  max-width: 800px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal, .modal-leave-active .modal {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal {
  transform: scale(0.96) translateY(8px);
  opacity: 0;
}

/* ── Header ───────────────────────────────────────────────────────── */
.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.modal__label {
  font-family: var(--font-heading);
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0 0 4px;
}
.modal__title {
  font-family: var(--font-heading);
  font-size: 22px;
  color: var(--text);
  margin: 0;
  letter-spacing: 0.03em;
}
.modal__close {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
  flex-shrink: 0;
}
.modal__close:hover {
  color: var(--gold);
  border-color: var(--gold);
  background: var(--gold-glow);
}

/* ── Rank tabs ────────────────────────────────────────────────────── */
.rank-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  padding: 0 24px;
}

.rank-tab {
  padding: 10px 18px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  color: var(--text-dim);
}

/* Cores por rank */
.rank-tab--lr { }
.rank-tab--lr.rank-tab--active,
.rank-tab--lr:hover { color: #8fb88f; }
.rank-tab--lr.rank-tab--active { border-bottom-color: #8fb88f; }

.rank-tab--hr { }
.rank-tab--hr.rank-tab--active,
.rank-tab--hr:hover { color: var(--gold); }
.rank-tab--hr.rank-tab--active { border-bottom-color: var(--gold); }

.rank-tab--mr { }
.rank-tab--mr.rank-tab--active,
.rank-tab--mr:hover { color: var(--el-fire); }
.rank-tab--mr.rank-tab--active { border-bottom-color: var(--el-fire); }

/* ── Body (scrollável) ────────────────────────────────────────────── */
.modal__body {
  padding: 16px 24px 24px;
  overflow-y: auto;
  flex: 1;
}

.modal__state {
  padding: 32px 0;
  text-align: center;
  color: var(--text-muted);
}

/* Estado sem fontes */
.modal__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 48px 24px;
  text-align: center;
}
.modal__empty-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--surface-2);
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dim);
  margin-bottom: 4px;
}
.modal__empty-title {
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-muted);
  margin: 0;
}
.modal__empty-hint {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text-dim);
  max-width: 380px;
  line-height: 1.6;
  margin: 0;
}

.modal__skel {
  height: 32px;
  border-radius: 6px;
  background: var(--surface-2);
  margin: 8px 0;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

/* ── Seções ───────────────────────────────────────────────────────── */
.modal__section { margin-top: 8px; }
.modal__section + .modal__section { margin-top: 20px; }
.modal__section-title {
  font-family: var(--font-heading);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0 0 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

/* ── Tabela ───────────────────────────────────────────────────────── */
.modal__table-wrap { overflow-x: auto; }
.src-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 420px;
}
.src-table th, .src-table td {
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
.src-table th {
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  background: var(--surface-2);
}
.src-table tbody tr:hover { background: var(--surface-2); }
.src-table__name  { color: var(--text); font-weight: 600; }
.src-table__cond  { color: var(--text-muted); }
.src-table__pct   { font-variant-numeric: tabular-nums; min-width: 110px; }
.src-table__stack { color: var(--gold); font-weight: 600; }
.src-table__col-pct { min-width: 120px; }
.src-table__stars { color: var(--gold); letter-spacing: -1px; font-size: 11px; }
.src-table__group { color: var(--text-dim); font-size: 11px; }

/* Barra de porcentagem */
.pct-bar {
  position: relative;
  display: block;
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--surface-2);
  overflow: hidden;
}
.pct-bar::before {
  content: '';
  position: absolute;
  inset: 0;
  width: var(--p, 0%);
  background: linear-gradient(to right, rgba(196,154,42,0.15), rgba(196,154,42,0.35));
  border-right: 1px solid var(--gold);
  z-index: 0;
}
.pct-bar strong {
  position: relative;
  color: var(--text);
  font-weight: 700;
  z-index: 1;
}

/* ── Quest category badge ─────────────────────────────────────────── */
.quest-cat {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 3px;
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid var(--border);
  color: var(--text-dim);
  background: var(--surface-2);
}
.quest-cat--event     { color: var(--gold);       border-color: var(--gold);    background: var(--gold-glow); }
.quest-cat--assigned  { color: #7ec8a0;            border-color: #3a6e54; }
.quest-cat--optional  { color: var(--text-muted); }
.quest-cat--arena     { color: #d4806a;            border-color: #7a3a2a; }
.quest-cat--special   { color: var(--el-dragon);   border-color: #5a3a7a; }
.quest-cat--challenge { color: #a0a0e0;            border-color: #4a4a8a; }
</style>
