<script setup lang="ts">
defineProps<{
  slot1?: number | null
  slot2?: number | null
  slot3?: number | null
  size?: number
}>()
</script>

<template>
  <span class="slot-icons">
    <template v-for="lvl in [slot1, slot2, slot3]" :key="lvl">
      <img
        v-if="lvl && lvl > 0"
        :src="`/icons/armor/slot${Math.min(lvl, 4)}.png`"
        :alt="`[${lvl}]`"
        class="slot-icon"
        :style="size ? { width: size + 'px', height: size + 'px' } : {}"
      />
    </template>
    <span v-if="!slot1 && !slot2 && !slot3" class="slot-none">—</span>
  </span>
</template>

<style scoped>
.slot-icons {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.slot-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  flex-shrink: 0;
}

.slot-none {
  color: var(--text-dim);
  font-size: 12px;
}
</style>
