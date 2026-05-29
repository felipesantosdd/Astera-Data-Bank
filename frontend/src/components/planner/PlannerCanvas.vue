<script setup lang="ts">
import { computed, markRaw } from 'vue'
import {
  VueFlow,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type EdgeMouseEvent,
} from '@vue-flow/core'
import { usePlannerStore } from '@/stores/plannerStore'
import MonsterPlannerNode   from './nodes/MonsterPlannerNode.vue'
import MaterialChecklistNode from './nodes/MaterialChecklistNode.vue'
import NotePlannerNode       from './nodes/NotePlannerNode.vue'
import EquipmentPlannerNode  from './nodes/EquipmentPlannerNode.vue'

const store = usePlannerStore()

const nodeTypes = {
  monster:           markRaw(MonsterPlannerNode),
  materialChecklist: markRaw(MaterialChecklistNode),
  note:              markRaw(NotePlannerNode),
  equipment:         markRaw(EquipmentPlannerNode),
}

const flowNodes = computed(() =>
  store.nodes.map(n => ({
    id:       n.id,
    type:     n.type,
    position: n.position,
    data:     n.data,
  })),
)

const flowEdges = computed(() =>
  store.edges.map(e => ({
    id:        e.id,
    source:    e.source,
    target:    e.target,
    label:     e.label,
    style:     { stroke: '#e74c3c', strokeWidth: 2, cursor: 'pointer' },
    markerEnd: { type: 'arrowclosed', color: '#e74c3c' },
    class:     'planner-edge',
  })),
)

function onNodesChange(changes: NodeChange[]) {
  for (const change of changes) {
    if (change.type === 'position' && change.position) {
      store.updateNodePosition(change.id, change.position)
    }
  }
}

function onEdgesChange(changes: EdgeChange[]) {
  for (const change of changes) {
    if (change.type === 'remove') store.removeEdge(change.id)
  }
}

function onConnect(connection: Connection) {
  if (!connection.source || !connection.target) return
  store.addEdge({
    id:     `edge-${connection.source}-${connection.target}-${Date.now()}`,
    source: connection.source,
    target: connection.target,
  })
}

// Clique numa aresta → remover imediatamente
function onEdgeClick({ edge }: EdgeMouseEvent) {
  store.removeEdge(edge.id)
}
</script>

<template>
  <VueFlow
    :nodes="flowNodes"
    :edges="flowEdges"
    :node-types="nodeTypes"
    fit-view-on-init
    class="planner-canvas"
    :default-viewport="{ zoom: 1 }"
    @nodes-change="onNodesChange"
    @edges-change="onEdgesChange"
    @connect="onConnect"
    @edge-click="onEdgeClick"
  >
    <template #empty>
      <div class="planner-canvas__empty">
        <p>Quadro vazio. Adicione monstros ou equipamentos pelo botões acima ou pela tela de detalhes.</p>
      </div>
    </template>
  </VueFlow>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';

/* Linha fica mais grossa ao passar o mouse */
.planner-edge:hover .vue-flow__edge-path {
  stroke-width: 4 !important;
  stroke: #ff6b6b !important;
}
</style>

<style scoped>
.planner-canvas {
  width: 100%;
  height: 100%;
  background: var(--bg);
}

.planner-canvas :deep(.vue-flow__background) {
  background: var(--bg);
}

.planner-canvas__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  font-size: 14px;
  text-align: center;
  padding: 32px;
}
</style>
