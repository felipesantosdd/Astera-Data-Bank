<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { DecorationNodeData } from '@/types/planner'
import { usePlannerStore } from '@/stores/plannerStore'
import PlannerHandles from '@/components/planner/PlannerHandles.vue'

const props = defineProps<{ id: string; data: DecorationNodeData }>()
const store = usePlannerStore()
const menuOpen = ref(false)
const nodeRef = ref<HTMLElement | null>(null)

const bestChance = computed(() =>
  props.data.chances.reduce((best, c) => c.chance > best ? c.chance : best, 0),
)

function formatChance(v: number) {
  return `${v.toLocaleString(undefined, { maximumFractionDigits: 3 })}%`
}

function toggleObtained(e: MouseEvent) {
  e.stopPropagation()
  store.updateNodeData(props.id, { obtained: !props.data.obtained })
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
  if (nodeRef.value && !nodeRef.value.contains(e.target as Node)) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocClick, true))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick, true))
</script>

<template>
  <div ref="nodeRef" class="dec-node" :class="{ 'dec-node--obtained': data.obtained }">
    <PlannerHandles :node-id="id" />

    <div
      class="dec-node__content"
      role="button"
      tabindex="0"
      @click="onCardClick"
      @keydown.enter="onCardClick"
      @keydown.space.prevent="onCardClick"
    >
      <div class="dec-node__icon" :data-color="data.iconColor">
        <img src="/icons/armor/decoration.png" alt="" />
      </div>
      <div class="dec-node__body">
        <span class="dec-node__name">{{ data.name }}</span>
        <span class="dec-node__meta">
          Slot {{ data.slot ?? '-' }} · R{{ data.rarity ?? '-' }}
          <span v-if="bestChance > 0" class="dec-node__rate">· {{ formatChance(bestChance) }}</span>
        </span>
      </div>
      <span v-if="data.obtained" class="dec-node__check">✓</span>
    </div>

    <div class="dec-node__skills">
      <span v-for="skill in data.skills" :key="String(skill.id)" class="dec-node__skill">
        {{ skill.name }} Lv{{ skill.level }}
      </span>
    </div>

    <Transition name="pop">
      <div v-if="menuOpen" class="dec-node__popover" @click.stop>
        <p class="dec-node__pop-name">{{ data.name }}</p>
        <div class="dec-node__pop-actions">
          <button
            class="pop-btn"
            :class="{ 'pop-btn--active': data.obtained }"
            @click="toggleObtained"
          >
            {{ data.obtained ? '↩ Desmarcar' : '✓ Obtida' }}
          </button>
          <button class="pop-btn pop-btn--danger" @click="remove">× Remover</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dec-node {
  position: relative;
  width: 220px;
  padding: 10px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: border-color 0.2s;
}

.dec-node:hover { border-color: var(--gold); }
.dec-node--obtained { border-color: rgba(92, 184, 92, 0.55); }

.dec-node__content {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 2px;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
}

.dec-node__icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: rgba(196, 154, 42, 0.08);
}

.dec-node__icon img {
  width: 26px;
  height: 26px;
  object-fit: contain;
}

.dec-node__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dec-node__name {
  font-family: var(--font-heading);
  font-size: 13px;
  color: var(--text);
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dec-node--obtained .dec-node__name { color: var(--text-muted); }

.dec-node__meta {
  font-size: 10px;
  color: var(--text-dim);
}

.dec-node__rate { color: var(--gold); }

.dec-node__check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(92, 184, 92, 0.18);
  color: #5cb85c;
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
}

.dec-node__skills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.dec-node__skill {
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid var(--border);
  color: var(--text-muted);
  background: rgba(196, 154, 42, 0.06);
}

.dec-node__popover {
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
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  pointer-events: all;
}

.dec-node__popover::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: var(--gold);
}

.dec-node__pop-name {
  font-family: var(--font-heading);
  font-size: 13px;
  color: var(--text);
  margin: 0 0 8px;
  white-space: nowrap;
}

.dec-node__pop-actions {
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
