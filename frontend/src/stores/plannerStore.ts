import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { PlannerNode, PlannerEdge, MonsterNodeData, EquipmentNodeData } from '@/types/planner'

const STORAGE_KEY = 'astera-planner'

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

  function addEquipmentNode(data: Omit<EquipmentNodeData, 'type' | 'completed'>) {
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
      position: { x: 100 + offset, y: 100 + offset },
      data: { type: 'equipment', completed: false, ...data },
    })
    return true
  }

  function addNoteNode() {
    const id = `note-${Date.now()}`
    nodes.value.push({
      id,
      type: 'note',
      position: { x: 120 + nodes.value.length * 20, y: 120 + nodes.value.length * 20 },
      data: { type: 'note', title: 'Nota', content: '' },
    })
  }

  function addChecklistNode() {
    const id = `checklist-${Date.now()}`
    nodes.value.push({
      id,
      type: 'materialChecklist',
      position: { x: 160 + nodes.value.length * 20, y: 160 + nodes.value.length * 20 },
      data: { type: 'materialChecklist', title: 'Materiais', items: [] },
    })
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
    addMonsterNode,
    addEquipmentNode,
    addNoteNode,
    addChecklistNode,
    removeNode,
    updateNodeData,
    updateNodePosition,
    addEdge,
    removeEdge,
  }
})
