import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useLanguageStore } from '@/stores/language'
import { getUIStrings } from '@/i18n/ui'

/**
 * Devolve os textos da interface no idioma atual, de forma reativa.
 * Uso: const { t } = useUI(); ... {{ t.detail.weaknesses }}
 */
export function useUI() {
  const { lang } = storeToRefs(useLanguageStore())
  const t = computed(() => getUIStrings(lang.value))
  return { t, lang }
}
