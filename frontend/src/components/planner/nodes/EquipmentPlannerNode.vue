<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { EquipmentNodeData, ChecklistItem } from '@/types/planner'
import { usePlannerStore } from '@/stores/plannerStore'
import { armorSlotIcon } from '@/utils/armorImageUrl'
import PlannerHandles from '@/components/planner/PlannerHandles.vue'

const props = defineProps<{ id: string; data: EquipmentNodeData }>()
const store = usePlannerStore()

// ── Menu de remoção ───────────────────────────────────────────────────────────
const menuOpen = ref(false)
const nodeRef  = ref<HTMLElement | null>(null)

function onCardClick(e: MouseEvent) {
  // Não abre menu se clicar num checkbox
  if ((e.target as HTMLElement).closest('input')) return
  e.stopPropagation()
  menuOpen.value = !menuOpen.value
}

function remove(e: MouseEvent) {
  e.stopPropagation()
  store.removeNode(props.id)
}

function onDocClick(e: MouseEvent) {
  if (nodeRef.value && !nodeRef.value.contains(e.target as Node)) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocClick, true))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick, true))

// ── Ícone ─────────────────────────────────────────────────────────────────────
const iconSrc = computed(() => {
  if (props.data.equipmentType === 'weapon') {
    const rank = Math.max(1, Math.min(12, props.data.rarity ?? 1))
    return `/weapons/${props.data.subtype}/rank_${String(rank).padStart(2, '0')}.svg`
  }
  // Armadura: usa foto da peça específica com fallback para ícone de slot
  return `/armor/pieces/${props.data.equipmentId}.png`
})

// Fallback quando a foto da peça não existir
function onIconError(e: Event) {
  const img = e.target as HTMLImageElement
  img.src = armorSlotIcon(props.data.subtype)
}

// ── Checklist ─────────────────────────────────────────────────────────────────
const completedCount = computed(() => props.data.materials.filter(m => m.completed).length)
const totalCount     = computed(() => props.data.materials.length)

function toggleMaterial(item: ChecklistItem) {
  const materials = props.data.materials.map(m =>
    m.id === item.id ? { ...m, completed: !m.completed } : m,
  )
  store.updateNodeData(props.id, { materials })
}

// ── Label do tipo ─────────────────────────────────────────────────────────────
const WEAPON_TYPE_LABELS: Record<string, string> = {
  'great-sword': 'GS', 'long-sword': 'LS', 'sword-and-shield': 'SnS',
  'dual-blades': 'DB', 'hammer': 'HAM', 'hunting-horn': 'HH',
  'lance': 'LAN', 'gunlance': 'GL', 'switch-axe': 'SA',
  'charge-blade': 'CB', 'insect-glaive': 'IG', 'light-bowgun': 'LBG',
  'heavy-bowgun': 'HBG', 'bow': 'BOW',
}

const typeLabel = computed(() =>
  props.data.equipmentType === 'weapon'
    ? (WEAPON_TYPE_LABELS[props.data.subtype] ?? props.data.subtype.toUpperCase())
    : props.data.subtype, // LR / HR / MR / head / chest etc.
)
</script>

<template>
  <div
    ref="nodeRef"
    class="eq-node"
    :class="{
      'eq-node--weapon': data.equipmentType === 'weapon',
      'eq-node--armor':  data.equipmentType === 'armor',
      'eq-node--done':   data.completed,
    }"
    @click="onCardClick"
  >
    <PlannerHandles :node-id="id" />

    <!-- Linha de cabeçalho: ícone + nome + progresso -->
    <div class="eq-node__header">
      <!-- Ícone -->
      <div class="eq-node__icon-wrap">
        <img
          :src="iconSrc"
          :alt="data.subtype"
          class="eq-node__icon"
          @error="onIconError"
        />
      </div>

      <div class="eq-node__info">
        <span class="eq-node__name">{{ data.name }}</span>
        <span class="eq-node__type">{{ typeLabel }}</span>
      </div>

      <!-- Progresso -->
      <span v-if="totalCount > 0" class="eq-node__progress">
        {{ completedCount }}/{{ totalCount }}
      </span>

      <!-- Indicador concluído -->
      <span v-if="data.completed" class="eq-node__done-mark">✓</span>
    </div>

    <!-- Barra de progresso -->
    <div v-if="totalCount > 0" class="eq-node__progress-bar">
      <div
        class="eq-node__progress-fill"
        :style="{ width: `${(completedCount / totalCount) * 100}%` }"
      />
    </div>

    <!-- Lista de materiais -->
    <ul v-if="totalCount > 0" class="eq-node__mats" @click.stop>
      <li
        v-for="item in data.materials"
        :key="item.id"
        class="eq-node__mat"
        :class="{ 'eq-node__mat--done': item.completed }"
      >
        <input
          type="checkbox"
          :checked="item.completed"
          @change="toggleMaterial(item)"
          @click.stop
        />
        <span class="eq-node__mat-name">{{ item.name }}</span>
        <span class="eq-node__mat-qty">×{{ item.requiredQuantity }}</span>
      </li>
    </ul>

    <!-- Menu de remoção -->
    <Transition name="pop">
      <div v-if="menuOpen" class="eq-node__menu" @click.stop>
        <button class="eq-menu-btn eq-menu-btn--danger" @click="remove">✕ Remover</button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.eq-node {
  background: var(--surface-2);
  border: 1.5px solid var(--border);
  border-radius: 8px;
  width: 220px;
  cursor: pointer;
  transition: border-color .2s;
  overflow: visible;
  position: relative;
}

.eq-node--weapon { border-left: 3px solid var(--gold); }
.eq-node--armor  { border-left: 3px solid #9060c0; }
.eq-node--done   { opacity: .6; }

.eq-node:hover { border-color: var(--gold); }

/* ── Header ── */
.eq-node__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px 6px;
}

.eq-node__icon-wrap {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eq-node__icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  display: block;
}

.eq-node--armor .eq-node__icon {
  color: #c090d0;
}

.eq-node__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.eq-node__name {
  font-family: var(--font-heading);
  font-size: 11px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.eq-node__type {
  font-size: 9px;
  color: var(--text-muted);
  letter-spacing: .06em;
  font-family: var(--font-heading);
}

.eq-node__progress {
  font-size: 10px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.eq-node__done-mark {
  color: #5cb85c;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

/* ── Progress bar ── */
.eq-node__progress-bar {
  height: 2px;
  background: var(--border);
  margin: 0 10px 6px;
  border-radius: 1px;
  overflow: hidden;
}

.eq-node__progress-fill {
  height: 100%;
  background: var(--gold);
  border-radius: 1px;
  transition: width .2s;
}

/* ── Checklist ── */
.eq-node__mats {
  list-style: none;
  margin: 0;
  padding: 0 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  border-top: 1px solid var(--border);
  padding-top: 6px;
  max-height: 180px;
  overflow-y: auto;
}

.eq-node__mat {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: var(--text);
}

.eq-node__mat--done .eq-node__mat-name {
  text-decoration: line-through;
  color: var(--text-dim);
}

.eq-node__mat-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.eq-node__mat-qty {
  color: var(--gold);
  font-family: var(--font-heading);
  font-size: 9px;
  flex-shrink: 0;
}

/* ── Menu ── */
.eq-node__menu {
  position: absolute;
  top: -2px;
  right: calc(100% + 8px);
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 4px 16px rgba(0,0,0,.5);
  z-index: 9999;
  pointer-events: all;
  white-space: nowrap;
}

.eq-menu-btn {
  display: block;
  width: 100%;
  background: none;
  border: none;
  border-radius: 4px;
  padding: 5px 12px;
  font-size: 11px;
  cursor: pointer;
  text-align: left;
  color: var(--text-muted);
  transition: color .12s, background .12s;
}

.eq-menu-btn:hover { color: var(--text); background: var(--surface); }
.eq-menu-btn--danger:hover { color: #e74c3c; background: #e74c3c18; }

/* ── Handles ── */
.node-handle {
  width: 10px;
  height: 10px;
  background: var(--gold);
  border: 2px solid var(--surface);
}

/* ── Transição ── */
.pop-enter-active, .pop-leave-active { transition: opacity .1s, transform .1s; }
.pop-enter-from, .pop-leave-to       { opacity: 0; transform: translateX(4px); }
</style>
