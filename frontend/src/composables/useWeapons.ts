import { useQuery } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'
import { useLanguageStore } from '@/stores/language'
import { dataUrl } from '@/utils/dataUrl'
import type { Weapon } from '@/types/weapon'

export function useWeapons() {
  const { lang } = storeToRefs(useLanguageStore())

  return useQuery<Weapon[]>({
    queryKey: ['weapons', lang],
    queryFn: () =>
      fetch(dataUrl.weapons(lang.value)).then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      }),
    staleTime: 10 * 60 * 1000,
  })
}
