import { useQuery } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'
import { useLanguageStore } from '@/stores/language'
import { dataUrl } from '@/utils/dataUrl'
import type { ArmorSet } from '@/types/armor'

export function useArmors() {
  const { lang } = storeToRefs(useLanguageStore())

  return useQuery<ArmorSet[]>({
    queryKey: ['armor', lang],
    queryFn: () =>
      fetch(dataUrl.armor(lang.value)).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
    staleTime: 10 * 60 * 1000,
  })
}
