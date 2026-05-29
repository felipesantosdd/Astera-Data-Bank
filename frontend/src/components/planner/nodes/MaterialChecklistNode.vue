<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import type { MaterialChecklistNodeData, ChecklistItem } from '@/types/planner'
import { usePlannerStore } from '@/stores/plannerStore'

const props = defineProps<{ id: string; data: MaterialChecklistNodeData }>()

const store = usePlannerStore()
const newItemName = ref('')
const editingTitle = ref(false)
const titleDraft = ref(props.data.title)

const completed = computed(() => props.data.items.filter(i => i.completed).length)
const total = computed(() => props.data.items.length)

function toggleItem(item: ChecklistItem) {
  const items = props.data.items.map(i =>
    i.id === item.id ? { ...i, completed: !i.completed } : i,
  )
  store.updateNodeData(props.id, { items })
}

function addItem() {
  const name = newItemName.value.trim()
  if (!name) return
  const items: ChecklistItem[] = [
    ...props.data.items,
    { id: `item-${Date.now()}`, name, requiredQuantity: 1, ownedQuantity: 0, completed: false },
  ]
  store.updateNodeData(props.id, { items })
  newItemName.value = ''
}

function removeItem(id: string) {
  store.updateNodeData(props.id, { items: props.data.items.filter(i => i.id !== id) })
}

function saveTitle() {
  store.updateNodeData(props.id, { title: titleDraft.value.trim() || 'Materiais' })
  editingTitle.value = false
}

function remove() {
  store.removeNode(props.id)
}
</script>

<template>
  <div class="checklist-node">
    <Handle type="target" :position="Position.Left" class="node-handle" />
    <Handle type="source" :position="Position.Right" class="node-handle" />

    <!-- Cabeçalho -->
    <div class="checklist-node__header">
      <input
        v-if="editingTitle"
        v-model="titleDraft"
        class="checklist-node__title-input"
        @blur="saveTitle"
        @keyup.enter="saveTitle"
        autofocus
      />
      <span v-else class="checklist-node__title" @dblclick="editingTitle = true">
        {{ data.title }}
      </span>
      <span class="checklist-node__progress">{{ completed }}/{{ total }}</span>
      <button class="node-btn node-btn--danger" title="Remover card" @click="remove">✕</button>
    </div>

    <!-- Lista -->
    <ul class="checklist-node__list">
      <li
        v-for="item in data.items"
        :key="item.id"
        class="checklist-node__item"
        :class="{ 'checklist-node__item--done': item.completed }"
      >
        <input type="checkbox" :checked="item.completed" @change="toggleItem(item)" />
        <span class="checklist-node__item-name">{{ item.name }}</span>
        <button class="node-btn node-btn--danger node-btn--xs" @click="removeItem(item.id)">✕</button>
      </li>
    </ul>

    <!-- Adicionar item -->
    <div class="checklist-node__add">
      <input
        v-model="newItemName"
        class="checklist-node__add-input"
        placeholder="Novo material..."
        @keyup.enter="addItem"
      />
      <button class="node-btn" @click="addItem">+</button>
    </div>
  </div>
</template>

<style scoped>
.checklist-node {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  width: 220px;
  padding: 10px;
  transition: border-color 0.2s;
}

.checklist-node:hover {
  border-color: var(--gold);
}

.checklist-node__header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.checklist-node__title {
  flex: 1;
  font-family: var(--font-heading);
  font-size: 12px;
  color: var(--gold);
  cursor: text;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.checklist-node__title-input {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--gold);
  border-radius: 4px;
  color: var(--text);
  font-size: 12px;
  padding: 2px 4px;
}

.checklist-node__progress {
  font-size: 10px;
  color: var(--text-muted);
  white-space: nowrap;
}

.checklist-node__list {
  list-style: none;
  margin: 0 0 8px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 160px;
  overflow-y: auto;
}

.checklist-node__item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text);
}

.checklist-node__item--done .checklist-node__item-name {
  text-decoration: line-through;
  color: var(--text-muted);
}

.checklist-node__item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.checklist-node__add {
  display: flex;
  gap: 4px;
}

.checklist-node__add-input {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  font-size: 11px;
  padding: 3px 6px;
}

.checklist-node__add-input::placeholder {
  color: var(--text-dim);
}

.checklist-node__add-input:focus {
  outline: none;
  border-color: var(--gold);
}

/* ── Shared ── */
.node-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.node-btn:hover {
  color: var(--text);
  border-color: var(--gold);
}

.node-btn--danger:hover {
  color: #e74c3c;
  border-color: #e74c3c;
}

.node-btn--xs {
  padding: 1px 4px;
  font-size: 10px;
}

.node-handle {
  width: 10px;
  height: 10px;
  background: var(--gold);
  border: 2px solid var(--surface);
}
</style>
