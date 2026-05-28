import { useQuery } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'
import type { Ref } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { dataUrl } from '@/utils/dataUrl'
import type { MonsterDrop } from '@/types/monster'

async function fetchDrops(monsterId: number, lang: string): Promise<MonsterDrop[]> {
  const res = await fetch(dataUrl.monsterDrops(monsterId, lang))
  if (!res.ok) throw new Error(`Erro ao buscar drops do monstro #${monsterId}: ${res.status}`)
  return res.json()
}

export function useMonsterDrops(monsterId: Ref<number>) {
  const { lang } = storeToRefs(useLanguageStore())

  return useQuery({
    queryKey: ['monster-drops', monsterId, lang],
    queryFn:  () => fetchDrops(monsterId.value, lang.value),
    staleTime: 1000 * 60 * 10,
  })
}
