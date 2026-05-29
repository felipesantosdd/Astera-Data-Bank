<script setup lang="ts">
import { ref } from 'vue'
import type { NoteNodeData } from '@/types/planner'
import { usePlannerStore } from '@/stores/plannerStore'
import PlannerHandles from '@/components/planner/PlannerHandles.vue'

const props = defineProps<{ id: string; data: NoteNodeData }>()

const store = usePlannerStore()
const editingTitle = ref(false)
const titleDraft = ref(props.data.title)

function saveTitle() {
  store.updateNodeData(props.id, { title: titleDraft.value.trim() || 'Nota' })
  editingTitle.value = false
}

function updateContent(e: Event) {
  store.updateNodeData(props.id, { content: (e.target as HTMLTextAreaElement).value })
}

function remove() {
  store.removeNode(props.id)
}
</script>

<template>
  <div class="note-node">
    <PlannerHandles :node-id="id" />

    <!-- Cabeçalho -->
    <div class="note-node__header">
      <input
        v-if="editingTitle"
        v-model="titleDraft"
        class="note-node__title-input"
        @blur="saveTitle"
        @keyup.enter="saveTitle"
        autofocus
      />
      <span v-else class="note-node__title" @dblclick="editingTitle = true">
        {{ data.title }}
      </span>
      <button class="node-btn node-btn--danger" title="Remover nota" @click="remove">✕</button>
    </div>

    <!-- Conteúdo -->
    <textarea
      class="note-node__content"
      :value="data.content"
      placeholder="Escreva sua nota aqui..."
      @input="updateContent"
      rows="4"
    />
  </div>
</template>

<style scoped>
.note-node {
  background: #1a1800;
  border: 1px solid #3a3200;
  border-radius: 8px;
  width: 200px;
  padding: 10px;
  transition: border-color 0.2s;
}

.note-node:hover {
  border-color: var(--gold);
}

.note-node__header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.note-node__title {
  flex: 1;
  font-family: var(--font-heading);
  font-size: 12px;
  color: #e8c060;
  cursor: text;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-node__title-input {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--gold);
  border-radius: 4px;
  color: var(--text);
  font-size: 12px;
  padding: 2px 4px;
}

.note-node__content {
  width: 100%;
  background: transparent;
  border: none;
  resize: vertical;
  color: var(--text);
  font-size: 11px;
  font-family: var(--font-body);
  line-height: 1.5;
  padding: 0;
}

.note-node__content::placeholder {
  color: var(--text-dim);
}

.note-node__content:focus {
  outline: none;
}

.node-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.node-btn:hover {
  color: var(--text);
  border-color: var(--border);
}

.node-btn--danger:hover {
  color: #e74c3c;
  border-color: #e74c3c;
}

.node-handle {
  width: 10px;
  height: 10px;
  background: var(--gold);
  border: 2px solid var(--surface);
}
</style>
