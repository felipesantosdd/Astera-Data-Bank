<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { useLanguageStore, LANGUAGES } from '@/stores/language'

const store  = useLanguageStore()
const isOpen = ref(false)

// Fecha o dropdown ao clicar fora dele
const pickerRef = ref<HTMLElement | null>(null)
onClickOutside(pickerRef, () => { isOpen.value = false })

function select(id: string) {
  store.setLang(id)
  isOpen.value = false
}
</script>

<template>
  <div class="lang-picker" ref="pickerRef">

    <!-- Botão que abre/fecha -->
    <button
      class="lang-picker__trigger"
      :class="{ 'lang-picker__trigger--open': isOpen }"
      @click="isOpen = !isOpen"
      :title="`Idioma: ${store.currentLanguage().label}`"
    >
      <span class="lang-picker__flag">{{ store.currentLanguage().flag }}</span>
      <span class="lang-picker__code">{{ store.lang.toUpperCase() }}</span>
      <span class="lang-picker__arrow">{{ isOpen ? '▲' : '▼' }}</span>
    </button>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div v-if="isOpen" class="lang-picker__dropdown">
        <button
          v-for="lang in LANGUAGES"
          :key="lang.id"
          class="lang-picker__option"
          :class="{ 'lang-picker__option--active': lang.id === store.lang }"
          @click="select(lang.id)"
        >
          <span class="lang-picker__flag">{{ lang.flag }}</span>
          <span class="lang-picker__option-label">{{ lang.label }}</span>
          <span class="lang-picker__option-code">{{ lang.id.toUpperCase() }}</span>
        </button>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
.lang-picker {
  position: relative;
}

/* ── Botão trigger ── */
.lang-picker__trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  font-family: var(--font-heading);
  font-size: 11px;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}

.lang-picker__trigger:hover,
.lang-picker__trigger--open {
  color: var(--gold);
  border-color: var(--gold);
  background: var(--gold-glow);
}

.lang-picker__flag  { font-size: 14px; line-height: 1; }
.lang-picker__code  { font-weight: 600; }
.lang-picker__arrow { font-size: 8px; opacity: 0.6; }

/* ── Dropdown ── */
.lang-picker__dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 180px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px;
  z-index: 200;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  /* Scroll se precisar de mais espaço */
  max-height: 320px;
  overflow-y: auto;
}

/* ── Opções ── */
.lang-picker__option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 10px;
  border-radius: 5px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s;
}

.lang-picker__option:hover {
  background: var(--surface);
}

.lang-picker__option--active {
  background: var(--gold-glow);
}

.lang-picker__option--active .lang-picker__option-label,
.lang-picker__option--active .lang-picker__option-code {
  color: var(--gold);
}

.lang-picker__option-label {
  flex: 1;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text);
  text-align: left;
}

.lang-picker__option-code {
  font-family: var(--font-heading);
  font-size: 10px;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}

/* ── Animação de entrada/saída ── */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
