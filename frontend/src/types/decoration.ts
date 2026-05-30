export interface DecorationSkill {
  id: number | null
  name: string
  level: number | null
  description: string
  levelDescription: string
}

export interface DecorationChance {
  itemId: number
  name: string
  chance: number
}

export interface DecorationSummary {
  id: number
  name: string
  slot: number | null
  rarity: number | null
  iconColor: string | null
  skills: DecorationSkill[]
  chances: DecorationChance[]
  bestChance: number
}
