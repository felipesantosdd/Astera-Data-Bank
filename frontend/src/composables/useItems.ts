import { useQuery } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'
import { useLanguageStore } from '@/stores/language'
import { dataUrl } from '@/utils/dataUrl'
import type { ItemSummary } from '@/types/item'

async function fetchItems(lang: string): Promise<ItemSummary[]> {
  const res = await fetch(dataUrl.items(lang))
  if (!res.ok) throw new Error(`Erro ao buscar materiais: ${res.status}`)
  return res.json()
}

export function useItems() {
  const { lang } = storeToRefs(useLanguageStore())

  return useQuery({
    queryKey:  ['items', lang],
    queryFn:   () => fetchItems(lang.value),
    staleTime: 1000 * 60 * 10,
  })
}
