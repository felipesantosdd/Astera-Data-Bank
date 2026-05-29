import { useQuery } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'
import { useLanguageStore } from '@/stores/language'
import { dataUrl } from '@/utils/dataUrl'
import type { ItemSummary } from '@/types/item'

export function useConsumables() {
  const { lang } = storeToRefs(useLanguageStore())

  return useQuery<ItemSummary[]>({
    queryKey: ['consumables', lang],
    queryFn: () =>
      fetch(dataUrl.consumables(lang.value)).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
    staleTime: 10 * 60 * 1000,
  })
}
