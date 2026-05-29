export interface WeaponCraftItem {
  itemId:   number
  name:     string
  quantity: number
}

export interface Weapon {
  id:               number
  name:             string
  weaponType:       string
  rarity:           number
  category:         string | null
  previousWeaponId: number | null

  attack:      number
  affinity:    number
  defense:     number
  elderseal:   string | null

  slot1: number
  slot2: number
  slot3: number

  element1:       string | null
  element1Attack: number | null
  element2:       string | null
  element2Attack: number | null
  elementHidden:  boolean

  craftable: boolean
  isFinal:   boolean

  phial:         string | null
  phialPower:    number | null
  shelling:      string | null
  shellingLevel: number | null
  kinsectBonus:  string | null
  notes:         string | null

  craftMaterials:   WeaponCraftItem[]   // receita de criação (do zero)
  upgradeMaterials: WeaponCraftItem[]   // receita de melhoria (upgrade)
}

export const WEAPON_TYPES = [
  'great-sword', 'sword-and-shield', 'dual-blades', 'long-sword',
  'hammer', 'hunting-horn', 'lance', 'gunlance', 'switch-axe',
  'charge-blade', 'insect-glaive', 'light-bowgun', 'heavy-bowgun', 'bow',
] as const

export type WeaponType = typeof WEAPON_TYPES[number]
