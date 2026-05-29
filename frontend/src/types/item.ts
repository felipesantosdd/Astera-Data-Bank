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

export interface QuestReward {
  questId:      number
  questName:    string
  category:     string   // 'assigned' | 'optional' | 'event' | 'arena' | 'challenge' | 'special'
  rank:         'LR' | 'HR' | 'MR' | string
  stars:        number | null
  rewardGroup:  string   // 'A' | 'B' | 'C'
  stack:        number | null
  percentage:   number | null
}

export interface CombinationEntry {
  type:       'recipe' | 'usedIn'
  resultName: string
  resultId:   number | null
  first:      string
  firstId:    number | null
  second:     string | null
  secondId:   number | null
  quantity:   number
}

export interface ItemCombinations {
  produces: CombinationEntry[]
  usedIn:   CombinationEntry[]
}

export interface ItemSources {
  rewards:      MonsterReward[]
  gathering:    LocationItem[]
  quests:       QuestReward[]
  combinations: ItemCombinations | null
}
