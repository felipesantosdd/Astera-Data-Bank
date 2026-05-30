<script setup lang="ts">
import { computed, markRaw } from 'vue'
import {
  VueFlow,
  MarkerType,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type EdgeMouseEvent,
  type OnConnectStartParams,
  type NodeTypesObject,
} from '@vue-flow/core'
import { usePlannerStore } from '@/stores/plannerStore'
import MonsterPlannerNode    from './nodes/MonsterPlannerNode.vue'
import MaterialChecklistNode from './nodes/MaterialChecklistNode.vue'
import NotePlannerNode       from './nodes/NotePlannerNode.vue'
import EquipmentPlannerNode  from './nodes/EquipmentPlannerNode.vue'
import RegionPlannerNode     from './nodes/RegionPlannerNode.vue'
import DecorationPlannerNode from './nodes/DecorationPlannerNode.vue'
import QuestPlannerNode      from './nodes/QuestPlannerNode.vue'

const store = usePlannerStore()

const nodeTypes: NodeTypesObject = {
  monster:           markRaw(MonsterPlannerNode)    as NodeTypesObject[string],
  materialChecklist: markRaw(MaterialChecklistNode) as NodeTypesObject[string],
  note:              markRaw(NotePlannerNode)        as NodeTypesObject[string],
  equipment:         markRaw(EquipmentPlannerNode)  as NodeTypesObject[string],
  region:            markRaw(RegionPlannerNode)      as NodeTypesObject[string],
  decoration:        markRaw(DecorationPlannerNode) as NodeTypesObject[string],
  quest:             markRaw(QuestPlannerNode)       as NodeTypesObject[string],
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
  store.edges.map((e, _, edges) => {
    const targetIndex = edges
      .filter(edge => edge.target === e.target)
      .findIndex(edge => edge.id === e.id)

    return {
      id:        e.id,
      source:    e.source,
      target:    e.target,
      sourceHandle: e.sourceHandle ?? 'source',
      targetHandle: `target-${Math.max(0, targetIndex)}`,
      label:     e.label,
      style:     { stroke: '#e74c3c', strokeWidth: 2, cursor: 'pointer' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#e74c3c' },
      class:     'planner-edge',
    }
  }),
)

function onNodesChange(changes: NodeChange[]) {
  const changedIds = new Set(
    changes.flatMap(change => 'id' in change ? [change.id] : []),
  )

  for (const change of changes) {
    if (change.type === 'position' && change.position) {
      const currentNode = store.nodes.find(node => node.id === change.id)
      const delta = currentNode
        ? {
            x: change.position.x - currentNode.position.x,
            y: change.position.y - currentNode.position.y,
          }
        : { x: 0, y: 0 }

      store.updateNodePosition(change.id, change.position)

      if (delta.x === 0 && delta.y === 0) continue

      if (currentNode?.data.type === 'equipment') {
        const connectedMaterialIds = store.edges
          .filter(edge => edge.target === change.id && !changedIds.has(edge.source))
          .map(edge => edge.source)

        for (const targetId of connectedMaterialIds) {
          const targetNode = store.nodes.find(node => node.id === targetId)
          if (!targetNode || targetNode.type !== 'materialChecklist') continue
          store.updateNodePosition(targetId, {
            x: targetNode.position.x + delta.x,
            y: targetNode.position.y + delta.y,
          })
        }
      }

      // Feystone: move all linked decoration nodes (target nodes)
      if (currentNode?.id.startsWith('feystone-')) {
        const decorationIds = store.edges
          .filter(edge => edge.source === change.id && !changedIds.has(edge.target))
          .map(edge => edge.target)
          .filter(tgt => store.nodes.find(n => n.id === tgt)?.type === 'decoration')

        for (const decId of decorationIds) {
          const decNode = store.nodes.find(n => n.id === decId)
          if (!decNode) continue
          store.updateNodePosition(decId, {
            x: decNode.position.x + delta.x,
            y: decNode.position.y + delta.y,
          })
        }
      }
    }
  }
}

function onEdgesChange(changes: EdgeChange[]) {
  for (const change of changes) {
    if (change.type === 'remove') store.removeEdge(change.id)
  }
}

function onConnect(connection: Connection) {
  store.isConnecting = false
  if (!connection.source || !connection.target) return
  const incomingCount = store.edges.filter(edge => edge.target === connection.target).length
  store.addEdge({
    id:     `edge-${connection.source}-${connection.target}-${Date.now()}`,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle ?? 'source',
    targetHandle: `target-${incomingCount}`,
  })
}

function onEdgeClick({ edge }: EdgeMouseEvent) {
  store.removeEdge(edge.id)
}

function onConnectStart(params: { event?: MouseEvent | TouchEvent } & OnConnectStartParams) {
  store.isConnecting = params.handleType === 'source'
}

function onConnectEnd() {
  store.isConnecting = false
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
    :min-zoom="0.2"
    :max-zoom="3"
    @nodes-change="onNodesChange"
    @edges-change="onEdgesChange"
    @connect="onConnect"
    @connect-start="onConnectStart"
    @connect-end="onConnectEnd"
    @edge-click="onEdgeClick"
  >
    <template #empty>
      <div class="planner-canvas__empty">
        <p>Quadro vazio. Adicione monstros ou equipamentos pelos botões acima ou pela tela de detalhes.</p>
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
  background:
    radial-gradient(circle, rgba(196, 154, 42, 0.18) 1px, transparent 1.5px),
    var(--bg);
  background-size: 24px 24px;
}

.planner-canvas :deep(.vue-flow__pane) {
  background:
    radial-gradient(circle, rgba(196, 154, 42, 0.18) 1px, transparent 1.5px),
    var(--bg);
  background-size: 24px 24px;
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
