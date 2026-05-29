import { computed } from 'vue'
import { usePlannerStore } from '@/stores/plannerStore'

export function usePlannerPresence() {
  const plannerStore = usePlannerStore()

  const monsterIds = computed(() => {
    const ids = new Set<number>()
    for (const node of plannerStore.nodes) {
      if (node.data.type === 'monster') ids.add(node.data.monsterId)
    }
    return ids
  })

  const equipmentKeys = computed(() => {
    const keys = new Set<string>()
    for (const node of plannerStore.nodes) {
      if (node.data.type === 'equipment') {
        keys.add(`${node.data.equipmentType}:${node.data.equipmentId}`)
      }
    }
    return keys
  })

  const materialIds = computed(() => {
    const ids = new Set<number>()
    for (const node of plannerStore.nodes) {
      if (node.data.type === 'materialChecklist') {
        for (const item of node.data.items) {
          if (item.materialId != null) ids.add(item.materialId)
        }
      }

      if (node.data.type === 'equipment') {
        for (const item of node.data.materials) {
          if (item.materialId != null) ids.add(item.materialId)
        }
      }
    }
    return ids
  })

  const completedMaterialIds = computed(() => {
    const ids = new Set<number>()
    for (const node of plannerStore.nodes) {
      if (node.data.type === 'materialChecklist') {
        for (const item of node.data.items) {
          if (item.materialId != null && item.completed) ids.add(item.materialId)
        }
      }

      if (node.data.type === 'equipment') {
        for (const item of node.data.materials) {
          if (item.materialId != null && item.completed) ids.add(item.materialId)
        }
      }
    }
    return ids
  })

  function isMonsterInPlanner(monsterId: number | null | undefined) {
    return monsterId != null && monsterIds.value.has(monsterId)
  }

  function isEquipmentInPlanner(equipmentId: number | null | undefined, equipmentType: 'weapon' | 'armor') {
    return equipmentId != null && equipmentKeys.value.has(`${equipmentType}:${equipmentId}`)
  }

  function isMaterialInPlanner(materialId: number | null | undefined) {
    return materialId != null && materialIds.value.has(materialId)
  }

  function isMaterialCompleted(materialId: number | null | undefined) {
    return materialId != null && completedMaterialIds.value.has(materialId)
  }

  return {
    isMonsterInPlanner,
    isEquipmentInPlanner,
    isMaterialInPlanner,
    isMaterialCompleted,
  }
}
