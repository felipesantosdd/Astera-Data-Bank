export interface QuestMonster {
  nameEn: string
  name: string
  monsterId: number | null
  quantity: number | null
  isObjective: boolean
}

export interface QuestReward {
  group: string
  itemName: string
  stack: number
  percentage: number
}

export interface Quest {
  id: number
  category: 'assigned' | 'optional' | 'special'
  rank: 'LR' | 'HR' | 'MR'
  stars: number | null
  questType: string
  locationId: number | null
  locationName: string
  zenny: number
  name: string
  objective: string
  description: string
  monsters: QuestMonster[]
  rewards: QuestReward[]
}
