import { computed, type Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'
import { useLanguageStore } from '@/stores/language'
import { dataUrl } from '@/utils/dataUrl'

export interface LocationSummary {
  id: number
  name: string
  itemCount: number
}

export interface LocationMonster {
  monsterId: number
  name: string
  icon: string | null
  ecology: string | null
  startArea: string | null
  moveArea: string | null
  restArea: string | null
}

export interface LocationItem {
  itemId: number
  itemName: string
  iconName: string | null
  iconColor: string | null
  area: number | null
  areaLabel?: string | null
  rank: string | null
  percentage: number | null
  stack: number | null
  nodes: number | null
  monsterName?: string | null
}

async function fetchLocations(lang: string): Promise<LocationSummary[]> {
  const res = await fetch(dataUrl.locations(lang))
  if (!res.ok) throw new Error(`Erro ao buscar regiões: ${res.status}`)
  return res.json()
}

async function fetchLocationItems(id: number, lang: string): Promise<LocationItem[]> {
  const res = await fetch(dataUrl.locationItems(id, lang))
  if (!res.ok) throw new Error(`Erro ao buscar itens da região #${id}: ${res.status}`)
  return res.json()
}

async function fetchLocationMonsters(id: number, lang: string): Promise<LocationMonster[]> {
  const res = await fetch(dataUrl.locationMonsters(id, lang))
  if (!res.ok) return []
  return res.json()
}

export function useLocations() {
  const { lang } = storeToRefs(useLanguageStore())
  return useQuery({
    queryKey: computed(() => ['locations', lang.value]),
    queryFn: () => fetchLocations(lang.value),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 120,
  })
}

export function useLocationMonsters(locationId: Ref<number | null>) {
  const { lang } = storeToRefs(useLanguageStore())
  return useQuery({
    queryKey: computed(() => ['location-monsters', locationId.value, lang.value]),
    queryFn: () => fetchLocationMonsters(locationId.value as number, lang.value),
    enabled: () => locationId.value != null,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 120,
  })
}

export function useLocationItems(locationId: Ref<number | null>) {
  const { lang } = storeToRefs(useLanguageStore())
  return useQuery({
    queryKey: computed(() => ['location-items', locationId.value, lang.value]),
    queryFn: () => fetchLocationItems(locationId.value as number, lang.value),
    enabled: () => locationId.value != null,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 120,
  })
}
