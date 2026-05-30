<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { QuestNodeData } from '@/types/planner'
import { usePlannerStore } from '@/stores/plannerStore'
import PlannerHandles from '@/components/planner/PlannerHandles.vue'

const props = defineProps<{ id: string; data: QuestNodeData }>()
const store = usePlannerStore()
const menuOpen = ref(false)
const nodeRef = ref<HTMLElement | null>(null)

const RANK_COLOR: Record<string, string> = { LR: '#8fba5a', HR: '#e8a838', MR: '#b06adc' }
const CAT_LABEL: Record<string, string> = { assigned: 'Principal', optional: 'Opcional', special: 'Especial' }
const TYPE_LABEL: Record<string, string> = { hunt: 'Caçar', capture: 'Capturar', delivery: 'Entregar', assignment: 'Escolta' }

function toggle(e: MouseEvent) {
  e.stopPropagation()
  store.updateNodeData(props.id, { completed: !props.data.completed })
  menuOpen.value = false
}

function remove(e: MouseEvent) {
  e.stopPropagation()
  store.removeNode(props.id)
  menuOpen.value = false
}

function onCardClick(e: Event) {
  e.stopPropagation()
  menuOpen.value = !menuOpen.value
}

function onDocClick(e: MouseEvent) {
  if (nodeRef.value && !nodeRef.value.contains(e.target as Node)) menuOpen.value = false
}

onMounted(() => document.addEventListener('click', onDocClick, true))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick, true))
</script>

<template>
  <div ref="nodeRef" class="quest-node" :class="{ 'quest-node--done': data.completed }">
    <PlannerHandles :node-id="id" />

    <div
      class="quest-node__content"
      role="button"
      tabindex="0"
      @click="onCardClick"
      @keydown.enter="onCardClick"
    >
      <div class="quest-node__rank" :style="{ background: RANK_COLOR[data.rank] + '22', borderColor: RANK_COLOR[data.rank] + '66' }">
        <span :style="{ color: RANK_COLOR[data.rank] }">{{ data.rank }}</span>
        <span class="quest-node__stars">{{ '★'.repeat(data.stars ?? 0) }}</span>
      </div>
      <div class="quest-node__body">
        <span class="quest-node__name">{{ data.name }}</span>
        <span class="quest-node__meta">
          {{ CAT_LABEL[data.category] ?? data.category }} ·
          {{ TYPE_LABEL[data.questType] ?? data.questType }}
        </span>
        <span class="quest-node__obj">{{ data.objective }}</span>
      </div>
      <span v-if="data.completed" class="quest-node__check">✓</span>
    </div>

    <div class="quest-node__footer">
      <span class="quest-node__loc">{{ data.locationName }}</span>
      <span class="quest-node__zenny">{{ data.zenny.toLocaleString() }}z</span>
    </div>

    <Transition name="pop">
      <div v-if="menuOpen" class="quest-node__popover" @click.stop>
        <p class="quest-node__pop-name">{{ data.name }}</p>
        <div class="quest-node__pop-actions">
          <button class="pop-btn" :class="{ 'pop-btn--active': data.completed }" @click="toggle">
            {{ data.completed ? '↩ Desmarcar' : '✓ Concluir' }}
          </button>
          <button class="pop-btn pop-btn--danger" @click="remove">× Remover</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.quest-node {
  position: relative;
  width: 240px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-2);
  transition: border-color 0.2s;
  overflow: hidden;
}
.quest-node:hover { border-color: var(--gold); }
.quest-node--done { border-color: rgba(92, 184, 92, 0.55); }

.quest-node__content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 10px 6px;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
}

.quest-node__rank {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 6px;
  border-radius: 5px;
  border: 1px solid;
  min-width: 32px;
}

.quest-node__rank span:first-child {
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.quest-node__stars {
  font-size: 8px;
  color: var(--gold);
  letter-spacing: -1px;
}

.quest-node__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.quest-node__name {
  font-family: var(--font-heading);
  font-size: 12px;
  color: var(--text);
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.quest-node--done .quest-node__name { color: var(--text-muted); }

.quest-node__meta {
  font-size: 10px;
  color: var(--text-dim);
}

.quest-node__obj {
  font-size: 10px;
  color: var(--text-muted);
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quest-node__check {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(92,184,92,0.18);
  color: #5cb85c;
  font-size: 11px;
  font-weight: 800;
  display: grid;
  place-items: center;
}

.quest-node__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 10px 8px;
  border-top: 1px solid var(--border);
}

.quest-node__loc { font-size: 10px; color: var(--text-dim); }
.quest-node__zenny { font-size: 10px; color: var(--gold); font-family: var(--font-heading); }

/* ── Popover ── */
.quest-node__popover {
  position: absolute;
  left: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  z-index: 9999;
  background: var(--surface-2);
  border: 1px solid var(--gold);
  border-radius: 8px;
  padding: 10px 12px;
  min-width: 160px;
  box-shadow: 0 4px 20px rgba(0,0,0,.6);
  pointer-events: all;
}
.quest-node__popover::before {
  content: '';
  position: absolute;
  right: 100%; top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: var(--gold);
}
.quest-node__pop-name {
  font-family: var(--font-heading);
  font-size: 12px;
  color: var(--text);
  margin: 0 0 8px;
}
.quest-node__pop-actions { display: flex; flex-direction: column; gap: 4px; }

.pop-btn {
  background: var(--surface); border: 1px solid var(--border);
  color: var(--text-muted); border-radius: 5px; padding: 4px 10px;
  font-size: 11px; cursor: pointer; text-align: left;
  transition: color .15s, border-color .15s, background .15s; white-space: nowrap;
}
.pop-btn:hover { color: var(--text); border-color: var(--gold); background: var(--gold-glow); }
.pop-btn--active { color: var(--gold); border-color: var(--gold); }
.pop-btn--danger:hover { color: #e74c3c; border-color: #e74c3c; background: #e74c3c18; }

.pop-enter-active, .pop-leave-active { transition: opacity .12s, transform .12s; }
.pop-enter-from, .pop-leave-to { opacity: 0; transform: translateY(-50%) translateX(-6px); }
</style>
