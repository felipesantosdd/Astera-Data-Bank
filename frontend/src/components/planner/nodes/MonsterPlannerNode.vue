<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { MonsterNodeData } from '@/types/planner'
import { usePlannerStore } from '@/stores/plannerStore'
import { useRouter } from 'vue-router'

const props = defineProps<{ id: string; data: MonsterNodeData }>()

const store = usePlannerStore()
const router = useRouter()

const open = ref(false)
const nodeRef = ref<HTMLElement | null>(null)
const imgFailed = ref(false)

// Ícone local — mesma convenção usada no MonsterCard e MonsterDetailView
const iconSrc = computed(() => `/monsters/${props.data.monsterId}.png`)

const initials = computed(() =>
  props.data.name.split(' ').map(w => w[0]).slice(0, 2).join(''),
)

function onIconClick(e: MouseEvent) {
  e.stopPropagation()
  open.value = !open.value
}

function toggleHunted(e: MouseEvent) {
  e.stopPropagation()
  store.updateNodeData(props.id, { hunted: !props.data.hunted })
}

function goToDetail(e: MouseEvent) {
  e.stopPropagation()
  router.push(`/monsters/${props.data.monsterId}`)
}

function remove(e: MouseEvent) {
  e.stopPropagation()
  store.removeNode(props.id)
  open.value = false
}

function onDocClick(e: MouseEvent) {
  if (nodeRef.value && !nodeRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocClick, true))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick, true))
</script>

<template>
  <div ref="nodeRef" class="monster-node" :class="{ 'monster-node--hunted': data.hunted }">
    <Handle type="target" :position="Position.Left" class="node-handle" />
    <Handle type="source" :position="Position.Right" class="node-handle" />

    <!-- Token: só o ícone -->
    <div class="monster-node__token" @click="onIconClick">
      <img
        v-if="!imgFailed"
        :src="iconSrc"
        :alt="data.name"
        class="monster-node__icon"
        @error="imgFailed = true"
      />
      <span v-else class="monster-node__initials">{{ initials }}</span>

      <!-- X de caçado sobre o ícone -->
      <div v-if="data.hunted" class="monster-node__hunted-overlay">
        <span class="monster-node__hunted-x">✕</span>
      </div>
    </div>

    <!-- Popover -->
    <Transition name="pop">
      <div v-if="open" class="monster-node__popover">
        <p class="monster-node__pop-name">{{ data.name }}</p>
        <p class="monster-node__pop-eco">{{ data.ecology }}</p>
        <div class="monster-node__pop-actions">
          <button
            class="pop-btn"
            :class="{ 'pop-btn--active': data.hunted }"
            @click="toggleHunted"
          >
            {{ data.hunted ? '↩ Desmarcar' : '✓ Caçado' }}
          </button>
          <button class="pop-btn" @click="goToDetail">↗ Detalhes</button>
          <button class="pop-btn pop-btn--danger" @click="remove">✕ Remover</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.monster-node {
  position: relative;
  display: inline-block;
}

/* ── Token (ícone clicável) ── */
.monster-node__token {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 10px;
  border: 2px solid var(--border);
  background: var(--surface-2);
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s, opacity 0.2s;
}

.monster-node__token:hover {
  border-color: var(--gold);
}

.monster-node--hunted .monster-node__token {
  opacity: 0.6;
  border-color: #c0392b80;
}

.monster-node__icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.monster-node__initials {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-muted);
}

/* ── X de caçado ── */
.monster-node__hunted-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.monster-node__hunted-x {
  font-size: 48px;
  font-weight: 900;
  color: #e74c3c;
  opacity: 0.85;
  line-height: 1;
  text-shadow: 0 0 8px #e74c3c80;
}

/* ── Popover ── */
.monster-node__popover {
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

/* seta à esquerda do popover */
.monster-node__popover::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: var(--gold);
}

.monster-node__pop-name {
  font-family: var(--font-heading);
  font-size: 13px;
  color: var(--text);
  margin: 0 0 2px;
  white-space: nowrap;
}

.monster-node__pop-eco {
  font-size: 10px;
  color: var(--text-muted);
  margin: 0 0 10px;
}

.monster-node__pop-actions {
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

/* ── Handles ── */
.node-handle {
  width: 10px;
  height: 10px;
  background: var(--gold);
  border: 2px solid var(--surface);
}

/* ── Transição do popover ── */
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
