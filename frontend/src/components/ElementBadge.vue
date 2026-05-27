<script setup lang="ts">
/**
 * Badge de fraqueza com ícone oficial do MHW.
 * SVGs em public/icons/ic_element_*.svg e ic_status_*.svg
 */
defineProps<{
  element: 'fire' | 'water' | 'thunder' | 'ice' | 'dragon'
           | 'poison' | 'sleep' | 'paralysis' | 'blast' | 'stun'
  value: number | null
}>()

// Mapeia elemento → arquivo SVG em /icons/
const iconFile: Record<string, string> = {
  fire:      '/icons/ic_element_fire.svg',
  water:     '/icons/ic_element_water.svg',
  thunder:   '/icons/ic_element_thunder.svg',
  ice:       '/icons/ic_element_ice.svg',
  dragon:    '/icons/ic_element_dragon.svg',
  poison:    '/icons/ic_status_poison.svg',
  sleep:     '/icons/ic_status_sleep.svg',
  paralysis: '/icons/ic_status_paralysis.svg',
  blast:     '/icons/ic_status_blast.svg',
  stun:      '/icons/ic_status_stun.svg',
}

const label: Record<string, string> = {
  fire: 'Fogo', water: 'Água', thunder: 'Trovão',
  ice: 'Gelo', dragon: 'Dragão', poison: 'Veneno',
  sleep: 'Sono', paralysis: 'Paralisia', blast: 'Explosão', stun: 'Atordoamento',
}
</script>

<template>
  <div
    v-if="value && value >= 1"
    class="el-badge"
    :class="`el-badge--${element}`"
    :title="`${label[element]}: ${value}/5`"
  >
    <img
      :src="iconFile[element]"
      :alt="element"
      class="el-badge__icon"
    />
    <span class="el-badge__value">{{ value }}</span>
  </div>
</template>

<style scoped>
.el-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 3px 6px 3px 4px;
  border-radius: 4px;
  border: 1px solid transparent;
  font-size: 12px;
  font-weight: 700;
  transition: opacity 0.2s;
}

.el-badge__icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  flex-shrink: 0;
}

.el-badge__value {
  line-height: 1;
  color: #fff;
}

/* Cor de fundo e borda por elemento */
.el-badge--fire      { background: rgba(224, 82,  40, 0.18); border-color: rgba(224, 82,  40, 0.4); }
.el-badge--water     { background: rgba( 63,169,213, 0.18); border-color: rgba( 63,169,213, 0.4); }
.el-badge--thunder   { background: rgba(240,192, 64, 0.18); border-color: rgba(240,192, 64, 0.4); }
.el-badge--ice       { background: rgba(144,216,240, 0.18); border-color: rgba(144,216,240, 0.4); }
.el-badge--dragon    { background: rgba(156, 96,200, 0.18); border-color: rgba(156, 96,200, 0.4); }
.el-badge--poison    { background: rgba(160, 96,192, 0.18); border-color: rgba(160, 96,192, 0.4); }
.el-badge--sleep     { background: rgba( 64,144,176, 0.18); border-color: rgba( 64,144,176, 0.4); }
.el-badge--paralysis { background: rgba(208,192, 32, 0.18); border-color: rgba(208,192, 32, 0.4); }
.el-badge--blast     { background: rgba(224,120, 32, 0.18); border-color: rgba(224,120, 32, 0.4); }
.el-badge--stun      { background: rgba(144, 96, 64, 0.18); border-color: rgba(144, 96, 64, 0.4); }
</style>
