import { useQuery } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'
import type { Ref } from 'vue'
import { useLanguageStore } from '@/stores/language'
import { dataUrl } from '@/utils/dataUrl'
import type { ItemSources } from '@/types/item'

async function fetchSources(itemId: number, lang: string): Promise<ItemSources> {
  const res = await fetch(dataUrl.itemSources(itemId, lang))
  if (!res.ok) throw new Error(`Erro ao buscar fontes do item #${itemId}: ${res.status}`)
  return res.json()
}

/**
 * Aceita um Ref<number | null> — quando o id for null, a query fica desabilitada.
 * Útil pra modal: enquanto fechado (id = null), nada é buscado.
 */
export function useItemSources(itemId: Ref<number | null>) {
  const { lang } = storeToRefs(useLanguageStore())

  return useQuery({
    queryKey: ['item-sources', itemId, lang],
    queryFn:  () => fetchSources(itemId.value as number, lang.value),
    enabled:  () => itemId.value != null,
    staleTime: 1000 * 60 * 10,
  })
}
