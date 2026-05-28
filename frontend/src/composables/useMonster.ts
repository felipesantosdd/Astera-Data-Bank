import { useQuery } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'
import type { Ref } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { dataUrl } from '@/utils/dataUrl'
import type { MonsterDetail } from '@/types/monster'

async function fetchMonster(id: number, lang: string): Promise<MonsterDetail> {
  const res = await fetch(dataUrl.monsterDetail(id, lang))
  if (!res.ok) throw new Error(`Erro ao buscar monstro #${id}: ${res.status}`)
  return res.json()
}

export function useMonster(id: Ref<number>) {
  const { lang } = storeToRefs(useLanguageStore())

  return useQuery({
    queryKey: ['monster', id, lang],            // refetch ao trocar id ou idioma
    queryFn:  () => fetchMonster(id.value, lang.value),
    staleTime: 1000 * 60 * 10,
  })
}
