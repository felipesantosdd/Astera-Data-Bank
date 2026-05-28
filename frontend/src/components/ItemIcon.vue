<script setup lang="ts">
/**
 * Renderiza um SVG do MHW tintando o caminho "base" (originalmente #FFFFFF)
 * com a cor correspondente ao icon_color do item.
 *
 * Carrega o SVG via fetch e mantém um cache em memória — cada combinação
 * (name, color) é buscada no máximo uma vez por sessão.
 */
import { ref, watchEffect } from 'vue'

const props = defineProps<{
  name:   string | null
  color:  string | null
  size?:  number
}>()

// ── Paleta MHW ────────────────────────────────────────────────────────
const COLORS: Record<string, string> = {
  Beige:      '#d4b896',
  Blue:       '#5a9fd4',
  Cyan:       '#7ecfd4',
  DarkBeige:  '#9d8868',
  DarkBlue:   '#3a6494',
  DarkGreen:  '#3d7a3d',
  DarkPurple: '#9870b8',
  DarkRed:    '#a52a2a',
  Gold:       '#d4a847',
  Gray:       '#9a9a9a',
  Green:      '#6abe6a',
  LightBeige: '#e8d4b2',
  Lime:       '#a8d63b',
  Orange:     '#f0884f',
  Pink:       '#f291b8',
  Red:        '#d9534f',
  Violet:     '#a675c0',
  White:      '#ffffff',
  Yellow:     '#f0c040',
}

// PascalCase do banco → arquivo SVG na pasta public/items/
const SPECIAL_FILES: Record<string, string> = {
  Jaw:      'monster_jaw',
  Fang:     'claw',
  Webbing:  'web',
  CharmOre: 'charm_ore',
  Vocuher:  'voucher',   // typo no MHWorldData DB
  Egg:      'question',  // sem SVG próprio, usa genérico
}

function pathFor(name: string): string {
  const file = SPECIAL_FILES[name]
    ?? name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
  return `/items/ic_items_${file}_base.svg`
}

// Cache module-level (não recarrega entre instâncias do componente)
const cache = new Map<string, string>()

async function loadColored(name: string, color: string): Promise<string> {
  const key = `${name}::${color}`
  const cached = cache.get(key)
  if (cached !== undefined) return cached

  try {
    const res = await fetch(pathFor(name))
    if (!res.ok) {
      cache.set(key, '')
      return ''
    }
    let svg = await res.text()
    // O path id="base" tem fill="#FFFFFF" — substitui pela cor
    svg = svg.replaceAll(/fill="#FFFFFF"/gi, `fill="${color}"`)
    cache.set(key, svg)
    return svg
  } catch {
    cache.set(key, '')
    return ''
  }
}

const svgHtml = ref('')
let token = 0  // evita race condition se props mudarem rápido

watchEffect(async () => {
  if (!props.name) { svgHtml.value = ''; return }
  const color = COLORS[props.color ?? 'White'] ?? '#cccccc'
  const localToken = ++token
  const result = await loadColored(props.name, color)
  if (localToken === token) svgHtml.value = result
})
</script>

<template>
  <span
    class="item-icon"
    :style="{ width: (size ?? 28) + 'px', height: (size ?? 28) + 'px' }"
  >
    <span v-if="svgHtml" v-html="svgHtml" class="item-icon__svg" />
    <span v-else class="item-icon__fallback" />
  </span>
</template>

<style scoped>
.item-icon {
  display: inline-block;
  flex-shrink: 0;
  line-height: 0;
}
.item-icon__svg {
  display: block;
  width: 100%;
  height: 100%;
}
.item-icon__svg :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
.item-icon__fallback {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--surface-2);
  border: 1px solid var(--border);
}
</style>
