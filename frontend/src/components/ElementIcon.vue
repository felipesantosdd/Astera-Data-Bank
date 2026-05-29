<script setup lang="ts">
defineProps<{
  element: string
  attack?: number | null
  hidden?: boolean
  size?: number
}>()

const ELEM_ICON: Record<string, string> = {
  Fire:       '/icons/ic_element_fire.svg',
  Water:      '/icons/ic_element_water.svg',
  Thunder:    '/icons/ic_element_thunder.svg',
  Ice:        '/icons/ic_element_ice.svg',
  Dragon:     '/icons/ic_element_dragon.svg',
  Poison:     '/icons/ic_status_poison.svg',
  Blast:      '/icons/ic_status_blast.svg',
  Paralysis:  '/icons/ic_status_paralysis.svg',
  Sleep:      '/icons/ic_status_sleep.svg',
  Stun:       '/icons/ic_status_stun.svg',
}

const ELEM_COLOR: Record<string, string> = {
  Fire: 'var(--el-fire)', Water: 'var(--el-water)', Thunder: 'var(--el-thunder)',
  Ice: 'var(--el-ice)', Dragon: 'var(--el-dragon)', Poison: 'var(--el-poison)',
  Blast: 'var(--el-blast)',
}
</script>

<template>
  <span class="elem-icon-wrap" :style="{ color: ELEM_COLOR[element] ?? 'var(--text-muted)' }">
    <img
      v-if="ELEM_ICON[element]"
      :src="ELEM_ICON[element]"
      :alt="element"
      class="elem-icon"
      :style="size ? { width: size + 'px', height: size + 'px' } : {}"
    />
    <span v-if="attack" class="elem-icon__atk">{{ attack }}</span>
    <span v-if="hidden" class="elem-icon__hidden">*</span>
  </span>
</template>

<style scoped>
.elem-icon-wrap {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.elem-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  flex-shrink: 0;
}

.elem-icon__atk {
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 600;
}

.elem-icon__hidden {
  opacity: 0.6;
  font-size: 10px;
}
</style>
