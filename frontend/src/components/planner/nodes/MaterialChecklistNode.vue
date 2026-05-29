<script setup lang="ts">
import { computed } from 'vue'
import type { ChecklistItem, MaterialChecklistNodeData } from '@/types/planner'
import { usePlannerStore } from '@/stores/plannerStore'
import ItemIcon from '@/components/ItemIcon.vue'
import PlannerHandles from '@/components/planner/PlannerHandles.vue'

const props = defineProps<{ id: string; data: MaterialChecklistNodeData }>()

const store = usePlannerStore()

const completed = computed(() => props.data.items.filter(i => i.completed).length)
const total = computed(() => props.data.items.length)
const primaryItem = computed(() => props.data.items[0] ?? null)
const isCompleted = computed(() => total.value > 0 && completed.value === total.value)
const materialIconName = computed(() => primaryItem.value?.iconName ?? props.data.iconName ?? null)
const materialIconColor = computed(() => primaryItem.value?.iconColor ?? props.data.iconColor ?? null)

function toggleItem(item: ChecklistItem) {
  const items = props.data.items.map(i =>
    i.id === item.id ? { ...i, completed: !i.completed } : i,
  )
  store.updateNodeData(props.id, { items })
}

function remove() {
  store.removeNode(props.id)
}
</script>

<template>
  <div class="material-node" :class="{ 'material-node--done': isCompleted }">
    <PlannerHandles :node-id="id" />

    <button class="material-node__remove" title="Remover material" @click.stop="remove">x</button>

    <button
      v-if="primaryItem"
      class="material-node__content"
      @click="toggleItem(primaryItem)"
    >
      <ItemIcon :name="materialIconName" :color="materialIconColor" :size="42" />
      <span class="material-node__body">
        <span class="material-node__name">{{ primaryItem.name }}</span>
        <span class="material-node__qty">x{{ primaryItem.requiredQuantity }}</span>
      </span>
      <span v-if="isCompleted" class="material-node__done" aria-label="Concluido">✓</span>
    </button>
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

.material-node__remove {
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 2;
  width: 20px;
  height: 20px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: var(--text-muted);
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.material-node__remove:hover {
  color: #e74c3c;
  border-color: #e74c3c;
  background: #e74c3c18;
}

.material-node__content {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 22px 4px 2px;
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
</style>
