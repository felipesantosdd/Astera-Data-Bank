export interface Monster {
  id: number
  name: string
  icon: string | null

  // Ecologia/tipo (localizado, ex: "Flying Wyvern", "Serpe Voadora")
  ecology: string | null

  // Elementos ofensivos do monstro (derivados dos ailments de blight)
  // Ex: ["fire", "blast"] para Teostra; [] para monstros físicos
  elements: string[]

  // Fraquezas elementais (escala 0–5, null = sem dado)
  weaknessFire:      number | null
  weaknessWater:     number | null
  weaknessThunder:   number | null
  weaknessIce:       number | null
  weaknessDragon:    number | null

  // Fraquezas de status
  weaknessPoison:    number | null
  weaknessSleep:     number | null
  weaknessParalysis: number | null
  weaknessBlast:     number | null
  weaknessStun:      number | null

  // Armadilhas
  pitfallTrap: boolean
  shockTrap:   boolean
  vineTrap:    boolean
}

export interface Hitzone {
  part:    string
  cut:     number | null
  impact:  number | null
  shot:    number | null
  fire:    number | null
  water:   number | null
  thunder: number | null
  ice:     number | null
  dragon:  number | null
  ko:      number | null
}

export interface MonsterDetail {
  id:                  number
  name:                string
  icon:                string | null
  ecology:             string | null
  description:         string | null
  altStateDescription: string | null

  weaknessFire:      number | null
  weaknessWater:     number | null
  weaknessThunder:   number | null
  weaknessIce:       number | null
  weaknessDragon:    number | null
  weaknessPoison:    number | null
  weaknessSleep:     number | null
  weaknessParalysis: number | null
  weaknessBlast:     number | null
  weaknessStun:      number | null

  hasAltWeakness:       boolean | null
  altWeaknessFire:      number | null
  altWeaknessWater:     number | null
  altWeaknessThunder:   number | null
  altWeaknessIce:       number | null
  altWeaknessDragon:    number | null
  altWeaknessPoison:    number | null
  altWeaknessSleep:     number | null
  altWeaknessParalysis: number | null
  altWeaknessBlast:     number | null
  altWeaknessStun:      number | null

  pitfallTrap: boolean | null
  shockTrap:   boolean | null
  vineTrap:    boolean | null

  ailmentRoar:          string | null  // "none" | "small" | "large"
  ailmentWind:          string | null
  ailmentTremor:        string | null
  ailmentDefenseDown:   boolean | null
  ailmentFireblight:    boolean | null
  ailmentWaterblight:   boolean | null
  ailmentThunderblight: boolean | null
  ailmentIceblight:     boolean | null
  ailmentDragonblight:  boolean | null
  ailmentBlastblight:   boolean | null
  ailmentPoison:        boolean | null
  ailmentSleep:         boolean | null
  ailmentParalysis:     boolean | null
  ailmentBleed:         boolean | null
  ailmentStun:          boolean | null
  ailmentMud:           boolean | null
  ailmentEffluvia:      boolean | null

  hitzones: Hitzone[]
}

export type DropSource =
  | 'carve'
  | 'break'
  | 'questReward'
  | 'shiny'
  | 'guidingLands'
  | 'siege'
  | 'palico'
  | 'mining'
  | 'tracking'
  | 'other'

export interface MonsterDrop {
  itemId:     number
  itemName:   string
  iconName:   string | null
  iconColor:  string | null
  rank:       'LR' | 'HR' | 'MR' | string
  source:     DropSource | string
  condition:  string
  stack:      number | null
  percentage: number | null
}
