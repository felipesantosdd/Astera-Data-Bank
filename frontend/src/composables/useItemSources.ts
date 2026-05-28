import { computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
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

/** Chave consistente usada tanto em useItemSources quanto em prefetch */
function buildKey(itemId: number | null, lang: string) {
  return ['item-sources', itemId, lang] as const
}

/**
 * Aceita um Ref<number | null> — quando o id for null, a query fica desabilitada.
 * Útil pra modal: enquanto fechado (id = null), nada é buscado.
 */
export function useItemSources(itemId: Ref<number | null>) {
  const { lang } = storeToRefs(useLanguageStore())

  return useQuery({
    // computed() garante que a key seja reativa com valores simples (não Refs)
    queryKey:  computed(() => buildKey(itemId.value, lang.value)),
    queryFn:   () => fetchSources(itemId.value as number, lang.value),
    enabled:   () => itemId.value != null,
    staleTime: 1000 * 60 * 30,
    gcTime:    1000 * 60 * 60,
  })
}

/**
 * Pré-carrega as fontes de um item sem abrir o modal.
 * Chame no mouseenter do card — o dado estará no cache quando o usuário clicar.
 */
export function usePrefetchItemSources() {
  const queryClient  = useQueryClient()
  const { lang } = storeToRefs(useLanguageStore())

  return (itemId: number) => {
    // Verifica se já está em cache antes de disparar o fetch
    const existing = queryClient.getQueryData(buildKey(itemId, lang.value))
    if (existing) return

    queryClient.prefetchQuery({
      queryKey:  buildKey(itemId, lang.value),
      queryFn:   () => fetchSources(itemId, lang.value),
      staleTime: 1000 * 60 * 30,
    })
  }
}
