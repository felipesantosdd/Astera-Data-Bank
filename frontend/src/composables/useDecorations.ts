import { useQuery } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'
import { useLanguageStore } from '@/stores/language'
import { dataUrl } from '@/utils/dataUrl'
import type { DecorationSummary } from '@/types/decoration'

async function fetchDecorations(lang: string): Promise<DecorationSummary[]> {
  const res = await fetch(dataUrl.decorations(lang))
  if (!res.ok) throw new Error(`Erro ao buscar decoracoes: ${res.status}`)
  return res.json()
}

export function useDecorations() {
  const { lang } = storeToRefs(useLanguageStore())

  return useQuery({
    queryKey: ['decorations', lang],
    queryFn: () => fetchDecorations(lang.value),
    staleTime: 1000 * 60 * 10,
  })
}
