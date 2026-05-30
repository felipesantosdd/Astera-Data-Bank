import { ref, watch, type Ref } from 'vue'

export function useStoredState<T>(key: string, fallback: T): Ref<T> {
  const value = ref(fallback) as Ref<T>

  try {
    const raw = localStorage.getItem(key)
    if (raw != null) value.value = JSON.parse(raw) as T
  } catch {
    value.value = fallback
  }

  watch(value, (next) => {
    try {
      localStorage.setItem(key, JSON.stringify(next))
    } catch {
      // Storage can fail in private mode or when quota is exceeded.
    }
  }, { deep: true })

  return value
}
