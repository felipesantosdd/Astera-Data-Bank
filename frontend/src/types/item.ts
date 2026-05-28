export interface ItemSummary {
  id:          number
  name:        string
  rarity:      number | null
  iconName:    string | null
  iconColor:   string | null
  category:    string
  subcategory: string | null
}

export interface MonsterReward {
  monsterId:   number
  monsterName: string
  rank:        'LR' | 'HR' | 'MR' | string
  condition:   string
  stack:       number | null
  percentage:  number | null
}

export interface LocationItem {
  locationId:   number
  locationName: string
  area:         number | null
  rank:         'LR' | 'HR' | 'MR' | string
  stack:        number | null
  percentage:   number | null
  nodes:        number | null
}

export interface ItemSources {
  rewards:   MonsterReward[]
  gathering: LocationItem[]
}
