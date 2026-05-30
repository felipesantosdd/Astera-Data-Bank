import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { PlannerNode, PlannerEdge, MonsterNodeData, EquipmentNodeData, RegionNodeData, DecorationNodeData, QuestNodeData } from '@/types/planner'

const STORAGE_KEY = 'astera-planner'
let idCounter = 0

function uniqueId(prefix: string) {
  idCounter += 1
  return `${prefix}-${Date.now()}-${idCounter}`
}

function loadFromStorage(): { nodes: PlannerNode[]; edges: PlannerEdge[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { nodes: [], edges: [] }
}

export const usePlannerStore = defineStore('planner', () => {
  const saved = loadFromStorage()

  const nodes = ref<PlannerNode[]>(saved.nodes)
  const edges = ref<PlannerEdge[]>(saved.edges)
  const isConnecting = ref(false)

  // Persist every change
  watch([nodes, edges], () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes: nodes.value, edges: edges.value }))
  }, { deep: true })

  function addMonsterNode(data: Omit<MonsterNodeData, 'type' | 'hunted'>) {
    const alreadyExists = nodes.value.some(
      n => n.type === 'monster' && (n.data as MonsterNodeData).monsterId === data.monsterId,
    )
    if (alreadyExists) return false

    const id = `monster-${data.monsterId}`
    const offset = nodes.value.length * 20
    nodes.value.push({
      id,
      type: 'monster',
      position: { x: 80 + offset, y: 80 + offset },
      data: { type: 'monster', hunted: false, ...data },
    })
    return true
  }

  function addEquipmentNode(data: Omit<EquipmentNodeData, 'type' | 'completed'>, position?: { x: number; y: number }) {
    const alreadyExists = nodes.value.some(
      n => n.type === 'equipment' && (n.data as EquipmentNodeData).equipmentId === data.equipmentId
        && (n.data as EquipmentNodeData).equipmentType === data.equipmentType,
    )
    if (alreadyExists) return false

    const id = `equipment-${data.equipmentType}-${data.equipmentId}`
    const offset = nodes.value.length * 20
    nodes.value.push({
      id,
      type: 'equipment',
      position: position ?? { x: 100 + offset, y: 100 + offset },
      data: { type: 'equipment', completed: false, ...data },
    })
    return true
  }

  function addNoteNode() {
    const id = uniqueId('note')
    nodes.value.push({
      id,
      type: 'note',
      position: { x: 120 + nodes.value.length * 20, y: 120 + nodes.value.length * 20 },
      data: { type: 'note', title: 'Nota', content: '' },
    })
  }

  function addChecklistNode(initial?: { title?: string; iconName?: string | null; iconColor?: string | null; position?: { x: number; y: number }; item?: { materialId?: number; name: string; iconName?: string | null; iconColor?: string | null; quantity?: number | null; sourceLocationName?: string | null; sourceAreas?: number[] } }) {
    const id = uniqueId('checklist')
    nodes.value.push({
      id,
      type: 'materialChecklist',
      position: initial?.position ?? { x: 160 + nodes.value.length * 20, y: 160 + nodes.value.length * 20 },
      data: {
        type: 'materialChecklist',
        title: initial?.title ?? 'Materiais',
        iconName: initial?.iconName ?? initial?.item?.iconName,
        iconColor: initial?.iconColor ?? initial?.item?.iconColor,
        items: initial?.item
          ? [{
              id: uniqueId(`item-${initial.item.materialId ?? 'custom'}`),
              materialId: initial.item.materialId,
              name: initial.item.name,
              iconName: initial.item.iconName,
              iconColor: initial.item.iconColor,
              sourceLocationName: initial.item.sourceLocationName ?? null,
              sourceAreas: initial.item.sourceAreas ?? [],
              requiredQuantity: initial.item.quantity ?? 1,
              ownedQuantity: 0,
              completed: false,
            }]
          : [],
      },
    })
    return id
  }

  function addQuestNode(data: Omit<QuestNodeData, 'type' | 'completed'>) {
    const id = `quest-${data.questId}`
    const alreadyExists = nodes.value.some(n => n.id === id)
    if (alreadyExists) return false
    const offset = nodes.value.length * 20
    nodes.value.push({
      id,
      type: 'quest',
      position: { x: 160 + offset, y: 160 + offset },
      data: { type: 'quest', completed: false, ...data },
    })
    return true
  }

  function addDecorationWithFeystones(data: Omit<DecorationNodeData, 'type' | 'obtained'>) {
    const decId = `decoration-${data.decorationId}`
    const alreadyExists = nodes.value.some(n => n.id === decId)
    if (!alreadyExists) {
      const offset = nodes.value.length * 20
      nodes.value.push({
        id: decId,
        type: 'decoration',
        position: { x: 240 + offset, y: 80 + offset },
        data: { type: 'decoration', obtained: false, ...data },
      })
    }

    const bestChance = data.chances.length
      ? [data.chances.reduce((best, c) => c.chance > best.chance ? c : best, data.chances[0])]
      : data.chances

    for (const chance of bestChance) {
      const feystoneId = `feystone-${chance.itemId}`
      const feystoneExists = nodes.value.some(n => n.id === feystoneId)
      if (!feystoneExists) {
        const offset = nodes.value.length * 20
        nodes.value.push({
          id: feystoneId,
          type: 'materialChecklist',
          position: { x: 60 + offset, y: 60 + offset },
          data: {
            type: 'materialChecklist',
            title: chance.name,
            iconName: 'Gem',
            iconColor: 'Gold',
            items: [{
              id: `feystone-item-${chance.itemId}`,
              materialId: chance.itemId,
              name: chance.name,
              iconName: 'Gem',
              iconColor: 'Gold',
              requiredQuantity: 1,
              ownedQuantity: 0,
              completed: false,
            }],
          },
        })
      }

      const edgeId = `edge-${feystoneId}-${decId}`
      const edgeExists = edges.value.some(e => e.id === edgeId)
      if (!edgeExists) {
        edges.value.push({ id: edgeId, source: feystoneId, target: decId })
      }
    }

    return true
  }

  function addRegionNode(locationName: string) {
    const id = `region-${locationName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    const alreadyExists = nodes.value.some(n => n.id === id)
    if (alreadyExists) return false
    const offset = nodes.value.length * 20
    nodes.value.push({
      id,
      type: 'region',
      position: { x: 60 + offset, y: 60 + offset },
      data: { type: 'region', locationName, done: false } satisfies RegionNodeData,
    })
    return true
  }

  function removeNode(id: string) {
    nodes.value = nodes.value.filter(n => n.id !== id)
    edges.value = edges.value.filter(e => e.source !== id && e.target !== id)
  }

  function updateNodeData(id: string, patch: Partial<Record<string, unknown>>) {
    const node = nodes.value.find(n => n.id === id)
    if (node) Object.assign(node.data, patch)
  }

  function updateNodePosition(id: string, position: { x: number; y: number }) {
    const node = nodes.value.find(n => n.id === id)
    if (node) node.position = position
  }

  function addEdge(edge: PlannerEdge) {
    const exists = edges.value.some(e => e.source === edge.source && e.target === edge.target)
    if (!exists) edges.value.push(edge)
  }

  function removeEdge(id: string) {
    edges.value = edges.value.filter(e => e.id !== id)
  }

  return {
    nodes,
    edges,
    isConnecting,
    addMonsterNode,
    addEquipmentNode,
    addNoteNode,
    addChecklistNode,
    addDecorationWithFeystones,
    addQuestNode,
    addRegionNode,
    removeNode,
    updateNodeData,
    updateNodePosition,
    addEdge,
    removeEdge,
  }
})
