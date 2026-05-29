<script setup lang="ts">
/**
 * Exibe o ícone oficial de tipo de arma.
 * Usa os SVGs do repositório OthelloRhin/MHW_Icons_SVG baixados em public/weapons/.
 * O rank determina a variante de cor do ícone (1-12).
 */
const props = defineProps<{
  type:   string
  size?:  number
  rank?:  number   // 1-12, default 1 (para o tab)
}>()

// Converte rarity → rank file number (1-12)
const rankStr = (() => {
  const r = Math.max(1, Math.min(12, props.rank ?? 1))
  return String(r).padStart(2, '0')
})()

const src = `/weapons/${props.type}/rank_${rankStr}.svg`
</script>

<template>
  <img
    :src="src"
    :width="size ?? 32"
    :height="size ?? 32"
    :alt="type"
    class="weapon-type-icon"
    loading="lazy"
  />
</template>

<style scoped>
.weapon-type-icon {
  display: block;
  object-fit: contain;
  flex-shrink: 0;
}
</style>
