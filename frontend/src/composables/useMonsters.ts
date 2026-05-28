import { useQuery } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'
import { useLanguageStore } from '@/stores/language'
import { dataUrl } from '@/utils/dataUrl'
import type { Monster } from '@/types/monster'

async function fetchMonsters(lang: string): Promise<Monster[]> {
  const res = await fetch(dataUrl.monsters(lang))
  if (!res.ok) throw new Error(`Erro ao buscar monstros: ${res.status}`)
  return res.json()
}

export function useMonsters() {
  // storeToRefs mantém a reatividade: quando lang mudar no store,
  // a queryKey muda e o TanStack Query refaz a requisição automaticamente
  const { lang } = storeToRefs(useLanguageStore())

  return useQuery({
    queryKey: ['monsters', lang],            // lang reativo = refetch ao trocar idioma
    queryFn:  () => fetchMonsters(lang.value),
    staleTime: 1000 * 60 * 10,
  })
}
