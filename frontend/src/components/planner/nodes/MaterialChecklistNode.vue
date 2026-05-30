<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { MaterialChecklistNodeData } from '@/types/planner'
import { useItemSources } from '@/composables/useItemSources'
import { usePlannerStore } from '@/stores/plannerStore'
import ItemIcon from '@/components/ItemIcon.vue'
import PlannerHandles from '@/components/planner/PlannerHandles.vue'

const props = defineProps<{ id: string; data: MaterialChecklistNodeData }>()

const store = usePlannerStore()
const menuOpen = ref(false)
const detailsOpen = ref(false)
const nodeRef = ref<HTMLElement | null>(null)

const completed = computed(() => props.data.items.filter(i => i.completed).length)
const total = computed(() => props.data.items.length)
const primaryItem = computed(() => props.data.items[0] ?? null)
const isCompleted = computed(() => total.value > 0 && completed.value === total.value)
const materialIconName = computed(() => primaryItem.value?.iconName ?? props.data.iconName ?? null)
const materialIconColor = computed(() => primaryItem.value?.iconColor ?? props.data.iconColor ?? null)
const itemId = computed(() => primaryItem.value?.materialId ?? null)
const sourceAreasText = computed(() => {
  const areas = primaryItem.value?.sourceAreas ?? []
  return areas.length ? areas.map(area => `Area ${area}`).join(', ') : 'Todas as areas'
})

const { data: sources, isLoading, isError } = useItemSources(itemId)
const RANKS = ['LR', 'HR', 'MR'] as const
type Rank = typeof RANKS[number]
const activeGatheringRank = ref<Rank>('LR')

function rankLabel(rank: Rank) {
  if (rank === 'LR') return 'Low Rank'
  if (rank === 'HR') return 'High Rank'
  return 'Master Rank'
}

const availableGatheringRanks = computed<Rank[]>(() => {
  const item = primaryItem.value
  const areas = item?.sourceAreas ?? []
  return RANKS.filter(rank => (sources.value?.gathering ?? []).some(row =>
    (!item?.sourceLocationName || row.locationName === item.sourceLocationName) &&
    (areas.length === 0 || (row.area != null && areas.includes(row.area))) &&
    row.rank === rank,
  ))
})

watch(availableGatheringRanks, (ranks) => {
  if (ranks.length && !ranks.includes(activeGatheringRank.value)) {
    activeGatheringRank.value = ranks[0]
  }
}, { immediate: true })

const filteredGathering = computed(() => {
  const item = primaryItem.value
  const rows = sources.value?.gathering ?? []
  const rankFiltered = availableGatheringRanks.value.length === 0
    ? rows
    : rows.filter(row => row.rank === activeGatheringRank.value)
  if (!item?.sourceLocationName) {
    return [...rankFiltered].sort((a, b) =>
      (a.area ?? Number.MAX_SAFE_INTEGER) - (b.area ?? Number.MAX_SAFE_INTEGER) ||
      String(a.locationName).localeCompare(String(b.locationName)),
    )
  }

  const areas = item.sourceAreas ?? []
  return rankFiltered
    .filter(row =>
      row.locationName === item.sourceLocationName &&
      (areas.length === 0 || (row.area != null && areas.includes(row.area))),
    )
    .sort((a, b) =>
      (a.area ?? Number.MAX_SAFE_INTEGER) - (b.area ?? Number.MAX_SAFE_INTEGER) ||
      String(a.rank ?? '').localeCompare(String(b.rank ?? '')),
    )
})

function onCardClick(e: MouseEvent) {
  e.stopPropagation()
  menuOpen.value = !menuOpen.value
}

function toggleItem(e?: MouseEvent) {
  e?.stopPropagation()
  const item = primaryItem.value
  if (!item) return
  const items = props.data.items.map(i =>
    i.id === item.id ? { ...i, completed: !i.completed } : i,
  )
  store.updateNodeData(props.id, { items })
  menuOpen.value = false
}

function openDetails(e: MouseEvent) {
  e.stopPropagation()
  detailsOpen.value = true
  menuOpen.value = false
}

function closeDetails() {
  detailsOpen.value = false
}

function remove(e: MouseEvent) {
  e.stopPropagation()
  store.removeNode(props.id)
  menuOpen.value = false
}

function onDocClick(e: MouseEvent) {
  if (nodeRef.value && !nodeRef.value.contains(e.target as Node)) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocClick, true))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick, true))
</script>

<template>
  <div ref="nodeRef" class="material-node" :class="{ 'material-node--done': isCompleted }">
    <PlannerHandles :node-id="id" />

    <button
      v-if="primaryItem"
      class="material-node__content"
      @click="onCardClick"
    >
      <ItemIcon :name="materialIconName" :color="materialIconColor" :size="42" />
      <span class="material-node__body">
        <span class="material-node__name">{{ primaryItem.name }}</span>
        <span class="material-node__qty">x{{ primaryItem.requiredQuantity }}</span>
      </span>
      <span v-if="isCompleted" class="material-node__done" aria-label="Concluido">✓</span>
    </button>

    <Transition name="pop">
      <div v-if="menuOpen && primaryItem" class="material-node__popover" @click.stop>
        <p class="material-node__pop-name">{{ primaryItem.name }}</p>
        <p v-if="primaryItem.sourceLocationName" class="material-node__pop-source">
          {{ primaryItem.sourceLocationName }} · {{ sourceAreasText }}
        </p>
        <div class="material-node__pop-actions">
          <button
            class="pop-btn"
            :class="{ 'pop-btn--active': isCompleted }"
            @click="toggleItem"
          >
            {{ isCompleted ? '↩ Desmarcar' : '✓ Concluir' }}
          </button>
          <button class="pop-btn" @click="openDetails">↗ Detalhes</button>
          <button class="pop-btn pop-btn--danger" @click="remove">× Remover</button>
        </div>
      </div>
    </Transition>

    <Teleport to="body">
      <div v-if="detailsOpen && primaryItem" class="material-detail-backdrop" @click.self="closeDetails">
        <div class="material-detail-modal">
          <header class="material-detail-modal__header">
            <div class="material-detail-modal__title-row">
              <ItemIcon :name="materialIconName" :color="materialIconColor" :size="38" />
              <div>
                <p class="material-detail-modal__label">Material planejado</p>
                <h2 class="material-detail-modal__title">{{ primaryItem.name }}</h2>
              </div>
            </div>
            <button class="material-detail-modal__close" @click="closeDetails">×</button>
          </header>

          <div class="material-detail-modal__body">
            <div class="material-detail-modal__summary">
              <span>Quantidade: <strong>x{{ primaryItem.requiredQuantity }}</strong></span>
              <span>Status: <strong>{{ isCompleted ? 'Concluido' : 'Pendente' }}</strong></span>
              <span v-if="primaryItem.sourceLocationName">
                Local: <strong>{{ primaryItem.sourceLocationName }}</strong>
              </span>
              <span v-if="primaryItem.sourceLocationName">
                Area: <strong>{{ sourceAreasText }}</strong>
              </span>
            </div>

            <div v-if="isLoading" class="material-detail-modal__state">Carregando fontes...</div>
            <div v-else-if="isError" class="material-detail-modal__state">Nao foi possivel carregar as fontes.</div>
            <div v-else-if="filteredGathering.length === 0" class="material-detail-modal__state">
              Nenhum ponto de coleta encontrado para esse contexto.
            </div>

            <div v-else>
              <div v-if="availableGatheringRanks.length > 1" class="material-detail-ranks">
                <button
                  v-for="rank in availableGatheringRanks"
                  :key="rank"
                  class="material-detail-rank"
                  :class="{ 'material-detail-rank--active': activeGatheringRank === rank }"
                  @click="activeGatheringRank = rank"
                >
                  {{ rankLabel(rank) }}
                </button>
              </div>

              <div class="material-detail-modal__table-wrap">
                <table class="material-detail-table">
                  <thead>
                    <tr>
                      <th>Local</th>
                      <th>Area</th>
                      <th>Rank</th>
                      <th>Chance</th>
                      <th>Qtd.</th>
                      <th>Pontos</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, index) in filteredGathering" :key="`${row.locationId}-${row.area}-${row.rank}-${index}`">
                      <td>{{ row.locationName }}</td>
                      <td>{{ row.area ?? '-' }}</td>
                      <td>{{ row.rank ?? '-' }}</td>
                      <td>{{ row.percentage != null ? `${row.percentage}%` : '-' }}</td>
                      <td>x{{ row.stack ?? 1 }}</td>
                      <td>{{ row.nodes ?? '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.material-node {
  position: relative;
  width: 210px;
  padding: 10px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: border-color 0.2s, opacity 0.2s;
}

.material-node:hover {
  border-color: var(--gold);
}

.material-node--done {
  border-color: rgba(92, 184, 92, 0.55);
}

.material-node__content {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 2px;
  border: none;
  background: transparent;
  color: var(--text);
  text-align: left;
  cursor: pointer;
}

.material-node__body {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.material-node__name {
  font-family: var(--font-heading);
  font-size: 13px;
  line-height: 1.25;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.material-node--done .material-node__name {
  color: var(--text-muted);
}

.material-node__qty {
  font-family: var(--font-heading);
  font-size: 11px;
  color: var(--gold);
}

.material-node__done {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(92, 184, 92, 0.18);
  color: #5cb85c;
  font-size: 14px;
  font-weight: 800;
  flex-shrink: 0;
}

.material-node__popover {
  position: absolute;
  left: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  z-index: 9999;
  background: var(--surface-2);
  border: 1px solid var(--gold);
  border-radius: 8px;
  padding: 10px 12px;
  min-width: 170px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  pointer-events: all;
}

.material-node__popover::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: var(--gold);
}

.material-node__pop-name {
  font-family: var(--font-heading);
  font-size: 13px;
  color: var(--text);
  margin: 0 0 2px;
  white-space: nowrap;
}

.material-node__pop-source {
  font-size: 10px;
  color: var(--text-muted);
  margin: 0 0 10px;
}

.material-node__pop-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pop-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: 5px;
  padding: 4px 10px;
  font-size: 11px;
  font-family: var(--font-body);
  cursor: pointer;
  text-align: left;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
  white-space: nowrap;
}

.pop-btn:hover {
  color: var(--text);
  border-color: var(--gold);
  background: var(--gold-glow);
}

.pop-btn--active {
  color: var(--gold);
  border-color: var(--gold);
}

.pop-btn--danger:hover {
  color: #e74c3c;
  border-color: #e74c3c;
  background: #e74c3c18;
}

.material-detail-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.material-detail-modal {
  width: min(760px, 100%);
  max-height: 85vh;
  background: var(--surface);
  border: 1px solid var(--gold);
  border-radius: 10px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.material-detail-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px 14px;
  border-bottom: 1px solid var(--border);
}

.material-detail-modal__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.material-detail-modal__label {
  font-family: var(--font-heading);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0 0 4px;
}

.material-detail-modal__title {
  font-family: var(--font-heading);
  font-size: 20px;
  color: var(--text);
  margin: 0;
}

.material-detail-modal__close {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: 6px;
  width: 32px;
  height: 32px;
  cursor: pointer;
}

.material-detail-modal__body {
  padding: 18px 22px 22px;
  overflow-y: auto;
}

.material-detail-modal__summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.material-detail-modal__summary span {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 5px 9px;
  font-size: 12px;
  color: var(--text-muted);
}

.material-detail-modal__summary strong {
  color: var(--text);
}

.material-detail-modal__state {
  padding: 28px 0;
  color: var(--text-muted);
  text-align: center;
}

.material-detail-ranks {
  display: flex;
  gap: 0;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.material-detail-rank {
  padding: 8px 14px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  color: var(--text-dim);
  font-family: var(--font-heading);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
}

.material-detail-rank:hover,
.material-detail-rank--active {
  color: var(--gold);
  border-bottom-color: var(--gold);
}

.material-detail-modal__table-wrap {
  overflow-x: auto;
}

.material-detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.material-detail-table th,
.material-detail-table td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--border);
  text-align: left;
}

.material-detail-table th {
  background: var(--surface-2);
  color: var(--text-muted);
  font-family: var(--font-heading);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.material-detail-table td {
  color: var(--text);
}

.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.12s, transform 0.12s;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(-6px);
}
</style>
