export interface SkillLevel {
  level:       number
  description: string | null
}

export interface ArmorSkill {
  name:        string
  description: string | null
  level:       number | null
  levels:      SkillLevel[]
}

export interface ArmorMaterial {
  itemId:   number
  name:     string
  quantity: number | null
}

export interface ArmorSetBonusSkill {
  name:        string
  description: string | null
  required:    number | null
  levels:      SkillLevel[]
}

export interface ArmorSetBonus {
  name:        string
  description: string | null
  skills:      ArmorSetBonusSkill[]
}

export interface ArmorPiece {
  id:     number
  name:   string
  type:   'head' | 'chest' | 'arms' | 'waist' | 'legs' | string
  rarity: number | null

  defenseBase:       number | null
  defenseMax:        number | null
  defenseAugmentMax: number | null

  fire:    number | null
  water:   number | null
  thunder: number | null
  ice:     number | null
  dragon:  number | null

  slot1: number | null
  slot2: number | null
  slot3: number | null

  skills:    ArmorSkill[]
  materials: ArmorMaterial[]
}

export interface ArmorSet {
  id:     number
  name:   string
  rank:   'LR' | 'HR' | 'MR' | string
  bonus:  ArmorSetBonus | null
  pieces: ArmorPiece[]
}
