<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useItemSources } from '@/composables/useItemSources'
import { useUI } from '@/composables/useUI'
import { usePlannerStore } from '@/stores/plannerStore'
import LocationIcon from '@/components/LocationIcon.vue'
import { usePlannerPresence } from '@/composables/usePlannerPresence'

const props = defineProps<{
  itemId:    number | null
  itemName:  string
  itemIconName?: string | null
  itemIconColor?: string | null
  plannerQuantity?: number | null
  canGoBack?: boolean
}>()

const emit = defineEmits<{
  close:    []
  navigate: [id: number, name: string]
  back:     []
}>()

const { t, lang } = useUI()
const plannerStore = usePlannerStore()
const plannerFeedback = ref(false)
const { isMaterialInPlanner } = usePlannerPresence()
const isPlanned = computed(() => isMaterialInPlanner(props.itemId))

function addMaterialToPlanner() {
  if (props.itemId == null) return
  plannerStore.addChecklistNode({
    title: props.itemName,
    item: {
      materialId: props.itemId,
      name: props.itemName,
      iconName: props.itemIconName,
      iconColor: props.itemIconColor,
      quantity: props.plannerQuantity ?? 1,
    },
  })
  if (activeSourceTab.value === 'gathering' && activeLocation.value) {
    plannerStore.addRegionNode(activeLocation.value)
  }
  plannerFeedback.value = true
  setTimeout(() => { plannerFeedback.value = false }, 1800)
}

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
const { data: sources, isLoading, isError } = useItemSources(itemIdRef)

const isOpen  = computed(() => props.itemId !== null)
const isEmpty = computed(() =>
  !!sources.value &&
  sources.value.rewards.length   === 0 &&
  sources.value.gathering.length === 0 &&
  (sources.value.quests?.length ?? 0) === 0 &&
  (sources.value.combinations?.produces?.length ?? 0) === 0 &&
  (sources.value.combinations?.usedIn?.length   ?? 0) === 0
)

const hasCombinations = computed(() =>
  (sources.value?.combinations?.produces?.length ?? 0) > 0 ||
  (sources.value?.combinations?.usedIn?.length   ?? 0) > 0
)

// ── Abas de tipo de fonte ─────────────────────────────────────────────────────
type SourceTab = 'drops' | 'gathering' | 'quests'

const availableSourceTabs = computed<SourceTab[]>(() => {
  if (!sources.value) return []
  const tabs: SourceTab[] = []
  if (sources.value.rewards.length > 0)            tabs.push('drops')
  if (sources.value.gathering.length > 0)           tabs.push('gathering')
  if ((sources.value.quests?.length ?? 0) > 0)     tabs.push('quests')
  return tabs
})

const activeSourceTab = ref<SourceTab>('drops')

watch(() => props.itemId, () => {
  activeSourceTab.value = 'drops'
  activeDropRank.value  = 'LR'
  activeQuestRank.value = 'LR'
  activeLocation.value  = ''
})
watch(availableSourceTabs, (tabs) => {
  if (tabs.length && !tabs.includes(activeSourceTab.value)) {
    activeSourceTab.value = tabs[0]
  }
}, { immediate: true })

function sourceTabLabel(tab: SourceTab): string {
  if (tab === 'drops')    return t.value.itemSources.monsterDrops
  if (tab === 'gathering') return t.value.itemSources.gathering
  return t.value.itemSources.questRewards
}

// ── Sub-tabs de rank para Drops e Missões ─────────────────────────────────────
const RANKS = ['LR', 'HR', 'MR'] as const
type Rank = typeof RANKS[number]

function rankLabel(r: Rank): string {
  if (r === 'LR') return t.value.armor.lowRank
  if (r === 'HR') return t.value.armor.highRank
  return t.value.armor.masterRank
}

const activeDropRank = ref<Rank>('LR')
const availableDropRanks = computed<Rank[]>(() =>
  RANKS.filter(r => sources.value?.rewards.some(x => x.rank === r))
)
watch(availableDropRanks, (ranks) => {
  if (ranks.length && !ranks.includes(activeDropRank.value)) activeDropRank.value = ranks[0]
}, { immediate: true })

const activeQuestRank = ref<Rank>('LR')
const availableQuestRanks = computed<Rank[]>(() =>
  RANKS.filter(r => (sources.value?.quests ?? []).some(x => x.rank === r))
)
watch(availableQuestRanks, (ranks) => {
  if (ranks.length && !ranks.includes(activeQuestRank.value)) activeQuestRank.value = ranks[0]
}, { immediate: true })

const filteredDrops  = computed(() => sources.value?.rewards.filter(x => x.rank === activeDropRank.value) ?? [])
const filteredQuests = computed(() => (sources.value?.quests ?? []).filter(x => x.rank === activeQuestRank.value))

// ── Sub-tabs de localização para Coleta ───────────────────────────────────────
const gatheringLocations = computed<string[]>(() => {
  const seen = new Set<string>()
  const locs: string[] = []
  for (const g of sources.value?.gathering ?? []) {
    if (!seen.has(g.locationName)) { seen.add(g.locationName); locs.push(g.locationName) }
  }
  return locs
})

const activeLocation = ref('')

watch(gatheringLocations, (locs) => {
  if (locs.length && !locs.includes(activeLocation.value)) activeLocation.value = locs[0]
}, { immediate: true })

const filteredGathering = computed(() =>
  sources.value?.gathering.filter(g => g.locationName === activeLocation.value) ?? []
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
            <div class="modal__header-left">
              <button v-if="canGoBack" class="modal__back" @click="emit('back')" aria-label="Voltar">‹</button>
              <div class="modal__heading">
                <p class="modal__label">{{ t.itemSources.title }}</p>
                <h2 class="modal__title">{{ itemName }}</h2>
              </div>
            </div>
            <div class="modal__header-actions">
              <button
                class="modal__planner"
                :class="{ 'modal__planner--planned': isPlanned }"
                @click="addMaterialToPlanner"
              >
                {{ plannerFeedback || isPlanned ? '✓ Planner' : '+ Planner' }}
              </button>
              <button class="modal__close" @click="emit('close')" :aria-label="t.itemSources.close">✕</button>
            </div>
          </header>

          <!-- Loading -->
          <div v-if="isLoading" class="modal__body">
            <div class="modal__state">
              <div class="modal__skel" />
              <div class="modal__skel" />
            </div>
          </div>

          <!-- Erro ao carregar -->
          <div v-else-if="isError" class="modal__body">
            <div class="modal__empty">
              <div class="modal__empty-icon">!</div>
              <p class="modal__empty-title">{{ t.itemSources.noSources }}</p>
              <p class="modal__empty-hint">{{ t.itemSources.noSourcesHint }}</p>
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

          <!-- Conteúdo principal -->
          <template v-else-if="sources">

            <!-- Combinações (sem rank, sempre acima) -->
            <div v-if="hasCombinations" class="modal__body modal__body--combinations">
              <section v-if="sources.combinations!.produces.length > 0" class="modal__section">
                <h3 class="modal__section-title">{{ t.itemSources.recipe }}</h3>
                <div class="combo-list">
                  <div v-for="(c, i) in sources.combinations!.produces" :key="i" class="combo-row">
                    <button class="combo-ing combo-ing--link" @click="c.firstId && emit('navigate', c.firstId, c.first)">{{ c.first }}</button>
                    <span v-if="c.second" class="combo-plus">+</span>
                    <button v-if="c.second" class="combo-ing combo-ing--link" @click="c.secondId && emit('navigate', c.secondId, c.second)">{{ c.second }}</button>
                    <span class="combo-arrow">→</span>
                    <span class="combo-result">{{ c.resultName }}</span>
                    <span class="combo-qty">×{{ c.quantity }}</span>
                  </div>
                </div>
              </section>
              <section v-if="sources.combinations!.usedIn.length > 0" class="modal__section">
                <h3 class="modal__section-title">{{ t.itemSources.usedIn }}</h3>
                <div class="modal__table-wrap">
                  <table class="src-table">
                    <thead><tr>
                      <th>{{ t.itemSources.colIngredient }}</th>
                      <th>{{ t.itemSources.colResult }}</th>
                      <th>{{ t.itemSources.colQty }}</th>
                    </tr></thead>
                    <tbody>
                      <tr v-for="(c, i) in sources.combinations!.usedIn" :key="i">
                        <td class="src-table__name">
                          <button class="combo-ing--link" @click="c.firstId && emit('navigate', c.firstId, c.first)">{{ c.first }}</button>
                          <span v-if="c.second"><span class="combo-sep"> + </span><button class="combo-ing--link" @click="c.secondId && emit('navigate', c.secondId, c.second!)">{{ c.second }}</button></span>
                        </td>
                        <td class="src-table__name combo-result-cell">
                          <button class="combo-ing--link" @click="c.resultId && emit('navigate', c.resultId, c.resultName)">{{ c.resultName }}</button>
                        </td>
                        <td class="src-table__stack">×{{ c.quantity }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <!-- Abas de tipo de fonte -->
            <div v-if="availableSourceTabs.length > 0" class="source-tabs">
              <button
                v-for="tab in availableSourceTabs"
                :key="tab"
                class="source-tab"
                :class="{ 'source-tab--active': activeSourceTab === tab }"
                @click="activeSourceTab = tab"
              >{{ sourceTabLabel(tab) }}</button>
            </div>

            <!-- Painel: Drops de Monstros -->
            <div v-if="activeSourceTab === 'drops' && availableSourceTabs.includes('drops')" class="modal__body">
              <!-- Sub-tabs de rank -->
              <div v-if="availableDropRanks.length > 1" class="rank-tabs rank-tabs--inner">
                <button
                  v-for="r in availableDropRanks" :key="r"
                  class="rank-tab"
                  :class="[`rank-tab--${r.toLowerCase()}`, { 'rank-tab--active': activeDropRank === r }]"
                  @click="activeDropRank = r"
                >{{ rankLabel(r) }}</button>
              </div>
              <div v-else-if="availableDropRanks.length === 1" class="rank-badge-row">
                <span class="rank-badge" :class="`rank-badge--${availableDropRanks[0].toLowerCase()}`">{{ rankLabel(availableDropRanks[0]) }}</span>
              </div>
              <div class="modal__table-wrap">
                <table class="src-table">
                  <thead><tr>
                    <th class="src-table__col-name">{{ t.itemSources.colMonster }}</th>
                    <th>{{ t.itemSources.colCondition }}</th>
                    <th class="src-table__col-pct">{{ t.itemSources.colChance }}</th>
                    <th>{{ t.itemSources.colStack }}</th>
                  </tr></thead>
                  <tbody>
                    <tr v-for="(r, i) in filteredDrops" :key="i">
                      <td class="src-table__name">{{ r.monsterName }}</td>
                      <td class="src-table__cond">{{ translateCondition(r.condition) }}</td>
                      <td class="src-table__pct">
                        <span class="pct-bar" :style="{ '--p': (r.percentage ?? 0) + '%' }"><strong>{{ r.percentage }}%</strong></span>
                      </td>
                      <td class="src-table__stack">×{{ r.stack }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Painel: Coleta em Mapas -->
            <div v-if="activeSourceTab === 'gathering' && availableSourceTabs.includes('gathering')" class="modal__body modal__body--gathering">
              <!-- Sub-tabs por localização -->
              <div class="loc-tabs">
                <button
                  v-for="loc in gatheringLocations" :key="loc"
                  class="loc-tab"
                  :class="{ 'loc-tab--active': activeLocation === loc }"
                  @click="activeLocation = loc"
                >
                  <LocationIcon :location-name="loc" :size="22" />
                  <span>{{ loc }}</span>
                </button>
              </div>
              <div class="modal__table-wrap">
                <table class="src-table">
                  <thead><tr>
                    <th>{{ t.itemSources.colArea }}</th>
                    <th>{{ t.itemSources.colRank }}</th>
                    <th class="src-table__col-pct">{{ t.itemSources.colChance }}</th>
                    <th>{{ t.itemSources.colStack }}</th>
                    <th>{{ t.itemSources.colNodes }}</th>
                  </tr></thead>
                  <tbody>
                    <tr v-for="(g, i) in filteredGathering" :key="i">
                      <td>{{ t.itemSources.areaPrefix }} {{ g.area }}</td>
                      <td>
                        <span v-if="g.rank" class="rank-badge" :class="`rank-badge--${g.rank.toLowerCase()}`">{{ rankLabel(g.rank as any) }}</span>
                        <span v-else class="rank-badge rank-badge--all">ALL</span>
                      </td>
                      <td class="src-table__pct">
                        <span class="pct-bar" :style="{ '--p': (g.percentage ?? 0) + '%' }"><strong>{{ g.percentage }}%</strong></span>
                      </td>
                      <td class="src-table__stack">×{{ g.stack }}</td>
                      <td>{{ g.nodes ?? '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Painel: Recompensas de Missão -->
            <div v-if="activeSourceTab === 'quests' && availableSourceTabs.includes('quests')" class="modal__body">
              <!-- Sub-tabs de rank -->
              <div v-if="availableQuestRanks.length > 1" class="rank-tabs rank-tabs--inner">
                <button
                  v-for="r in availableQuestRanks" :key="r"
                  class="rank-tab"
                  :class="[`rank-tab--${r.toLowerCase()}`, { 'rank-tab--active': activeQuestRank === r }]"
                  @click="activeQuestRank = r"
                >{{ rankLabel(r) }}</button>
              </div>
              <div v-else-if="availableQuestRanks.length === 1" class="rank-badge-row">
                <span class="rank-badge" :class="`rank-badge--${availableQuestRanks[0].toLowerCase()}`">{{ rankLabel(availableQuestRanks[0]) }}</span>
              </div>
              <div class="modal__table-wrap">
                <table class="src-table">
                  <thead><tr>
                    <th class="src-table__col-name">{{ t.itemSources.colQuest }}</th>
                    <th>{{ t.itemSources.colCategory }}</th>
                    <th>{{ t.itemSources.colStars }}</th>
                    <th>{{ t.itemSources.colGroup }}</th>
                    <th class="src-table__col-pct">{{ t.itemSources.colChance }}</th>
                    <th>{{ t.itemSources.colStack }}</th>
                  </tr></thead>
                  <tbody>
                    <tr v-for="(q, i) in filteredQuests" :key="i">
                      <td class="src-table__name">{{ q.questName }}</td>
                      <td><span class="quest-cat" :class="`quest-cat--${q.category}`">{{ questCategory(q.category) }}</span></td>
                      <td class="src-table__stars">{{ q.stars ? '★'.repeat(Math.min(q.stars, 5)) : '—' }}</td>
                      <td class="src-table__group">{{ groupLabel(q.rewardGroup) }}</td>
                      <td class="src-table__pct">
                        <span class="pct-bar" :style="{ '--p': (q.percentage ?? 0) + '%' }"><strong>{{ q.percentage }}%</strong></span>
                      </td>
                      <td class="src-table__stack">×{{ q.stack }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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

.modal__header-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.modal__back {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
  flex-shrink: 0;
  margin-top: 2px;
}
.modal__back:hover {
  color: var(--gold);
  border-color: var(--gold);
  background: var(--gold-glow);
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

.modal__header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.modal__planner {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text-muted);
  min-width: 84px;
  height: 32px;
  border-radius: 6px;
  padding: 0 12px;
  font-family: var(--font-heading);
  font-size: 11px;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.modal__planner:hover {
  color: var(--gold);
  border-color: var(--gold);
  background: var(--gold-glow);
}
.modal__planner--planned {
  color: #5cb85c;
  border-color: #5cb85c;
  background: rgba(92, 184, 92, 0.12);
}

/* ── Source-type tabs ─────────────────────────────────────────────── */
.source-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  padding: 0 24px;
  background: var(--surface);
}

.source-tab {
  padding: 10px 16px;
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
  white-space: nowrap;
}
.source-tab--active,
.source-tab:hover { color: var(--gold); }
.source-tab--active { border-bottom-color: var(--gold); }

/* ── Rank tabs dentro do painel ───────────────────────────────────── */
.rank-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  padding: 0 24px;
  background: var(--surface-2);
}

.rank-tabs--inner {
  margin: 0 -24px;
  padding: 0 24px;
}

.rank-tab {
  padding: 8px 14px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  color: var(--text-dim);
}

.rank-tab--lr.rank-tab--active,
.rank-tab--lr:hover { color: #8fb88f; }
.rank-tab--lr.rank-tab--active { border-bottom-color: #8fb88f; }

.rank-tab--hr.rank-tab--active,
.rank-tab--hr:hover { color: var(--gold); }
.rank-tab--hr.rank-tab--active { border-bottom-color: var(--gold); }

.rank-tab--mr.rank-tab--active,
.rank-tab--mr:hover { color: var(--el-fire); }
.rank-tab--mr.rank-tab--active { border-bottom-color: var(--el-fire); }

/* ── Rank badge (inline / single rank) ───────────────────────────── */
.rank-badge-row {
  padding: 8px 0 4px;
}
.rank-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid var(--border);
  color: var(--text-dim);
}
.rank-badge--lr { color: #8fb88f; border-color: #3a6e54; }
.rank-badge--hr { color: var(--gold); border-color: #6e5424; }
.rank-badge--mr { color: var(--el-fire); border-color: #7a3a2a; }
.rank-badge--all { color: var(--text-dim); border-color: var(--border); }

/* ── Location tabs (gathering) ────────────────────────────────────── */
.loc-tabs {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  padding: 12px 0 8px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 12px;
}

.loc-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px 5px 6px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 20px;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
  color: var(--text-muted);
}
.loc-tab--active,
.loc-tab:hover {
  color: var(--gold);
  border-color: var(--gold);
  background: var(--gold-glow);
}

/* Body especial para gathering (sem padding-top extra) */
.modal__body--gathering {
  padding-top: 0;
}

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

/* ── Combinations ─────────────────────────────────────────────────── */
.modal__body--combinations {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.combo-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.combo-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 13px;
}

.combo-ing {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 3px 10px;
  color: var(--text);
  font-weight: 500;
}

.combo-ing--link {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 3px 10px;
  color: var(--text);
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
  font-family: inherit;
}
.combo-ing--link:hover {
  color: var(--gold);
  border-color: var(--gold);
  background: var(--gold-glow);
}

.combo-plus {
  color: var(--text-dim);
  font-weight: 600;
}

.combo-arrow {
  color: var(--gold);
  font-size: 15px;
}

.combo-result {
  color: var(--gold);
  font-weight: 700;
}

.combo-qty {
  color: var(--text-dim);
  font-size: 12px;
}

.combo-sep {
  color: var(--text-dim);
}

.combo-result-cell {
  color: var(--gold) !important;
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
