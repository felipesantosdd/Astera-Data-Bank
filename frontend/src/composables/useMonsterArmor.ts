import { useQuery } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'
import type { Ref } from 'vue'
import { useLanguageStore } from '@/stores/language'
import type { ArmorSet } from '@/types/armor'

async function fetchArmor(monsterId: number, lang: string): Promise<ArmorSet[]> {
  const res = await fetch(`/api/monsters/${monsterId}/armor?lang=${lang}`)
  if (!res.ok) throw new Error(`Erro ao buscar armadura do monstro #${monsterId}: ${res.status}`)
  return res.json()
}

export function useMonsterArmor(monsterId: Ref<number>) {
  const { lang } = storeToRefs(useLanguageStore())

  return useQuery({
    queryKey: ['monster-armor', monsterId, lang],
    queryFn:  () => fetchArmor(monsterId.value, lang.value),
    staleTime: 1000 * 60 * 10,
  })
}
