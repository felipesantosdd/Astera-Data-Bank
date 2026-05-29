export type PlannerNodeType = 'monster' | 'materialChecklist' | 'note' | 'equipment' | 'region'

// ── Monster node ──────────────────────────────────────────────────────────────
export interface MonsterNodeData {
  type: 'monster'
  monsterId: number
  name: string
  icon: string | null
  ecology: string
  hunted: boolean
}

// ── Equipment node ────────────────────────────────────────────────────────────
export interface EquipmentNodeData {
  type: 'equipment'
  equipmentId: number
  name: string
  equipmentType: 'weapon' | 'armor'
  subtype: string        // weapon_type ou rank da armadura
  rarity: number | null
  completed: boolean
  materials: ChecklistItem[]
}

// ── Material checklist node ───────────────────────────────────────────────────
export interface ChecklistItem {
  id: string
  materialId?: number
  name: string
  iconName?: string | null
  iconColor?: string | null
  requiredQuantity: number
  ownedQuantity: number
  completed: boolean
}

export interface MaterialChecklistNodeData {
  type: 'materialChecklist'
  title: string
  iconName?: string | null
  iconColor?: string | null
  items: ChecklistItem[]
}

// ── Note node ─────────────────────────────────────────────────────────────────
export interface NoteNodeData {
  type: 'note'
  title: string
  content: string
}

// ── Region node ───────────────────────────────────────────────────────────────
export interface RegionNodeData {
  type: 'region'
  locationName: string
  done: boolean
}

export type PlannerNodeData =
  | MonsterNodeData
  | EquipmentNodeData
  | MaterialChecklistNodeData
  | NoteNodeData
  | RegionNodeData

// ── Store types ───────────────────────────────────────────────────────────────
export interface PlannerNode {
  id: string
  type: PlannerNodeType
  position: { x: number; y: number }
  data: PlannerNodeData
}

export interface PlannerEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
  label?: string
}
