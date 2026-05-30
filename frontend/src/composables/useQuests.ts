import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'
import { useLanguageStore } from '@/stores/language'
import type { Quest } from '@/types/quest'

async function fetchQuests(lang: string): Promise<Quest[]> {
  const res = await fetch(`/data/quests-${lang}.json`)
  if (!res.ok) throw new Error(`Erro ao buscar missões: ${res.status}`)
  return res.json()
}

export function useQuests() {
  const { lang } = storeToRefs(useLanguageStore())
  return useQuery({
    queryKey: computed(() => ['quests', lang.value]),
    queryFn: () => fetchQuests(lang.value),
    staleTime: 1000 * 60 * 60,
    gcTime:    1000 * 60 * 120,
  })
}
