import { defineStore } from 'pinia'
import { ref } from 'vue'

// Chave usada no localStorage
const LS_KEY = 'astera-lang'

export interface Language {
  id:    string  // código ex: 'en', 'pt', 'ja'
  label: string  // nome legível
  flag:  string  // emoji de bandeira
}

// Lista completa dos idiomas presentes no banco (tabela language)
export const LANGUAGES: Language[] = [
  { id: 'ar', label: 'العربية',    flag: '🇸🇦' },
  { id: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { id: 'en', label: 'English',    flag: '🇬🇧' },
  { id: 'es', label: 'Español',    flag: '🇪🇸' },
  { id: 'fr', label: 'Français',   flag: '🇫🇷' },
  { id: 'it', label: 'Italiano',   flag: '🇮🇹' },
  { id: 'ja', label: '日本語',      flag: '🇯🇵' },
  { id: 'ko', label: '한국어',      flag: '🇰🇷' },
  { id: 'pl', label: 'Polski',     flag: '🇵🇱' },
  { id: 'pt', label: 'Português',  flag: '🇧🇷' },
  { id: 'ru', label: 'Русский',    flag: '🇷🇺' },
  { id: 'zh', label: '中文',        flag: '🇨🇳' },
]

export const useLanguageStore = defineStore('language', () => {
  // Inicializa com o valor salvo no localStorage, ou inglês como padrão
  const lang = ref<string>(localStorage.getItem(LS_KEY) ?? 'en')

  function setLang(newLang: string) {
    lang.value = newLang
    localStorage.setItem(LS_KEY, newLang)  // persiste imediatamente
  }

  // Retorna o objeto Language completo do idioma atual
  const currentLanguage = () =>
    LANGUAGES.find(l => l.id === lang.value) ?? LANGUAGES[2] // fallback: en

  return { lang, setLang, currentLanguage }
})
