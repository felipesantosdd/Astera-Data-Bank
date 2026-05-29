<script setup lang="ts">
defineProps<{
  locationName: string
  size?: number
  showLabel?: boolean
}>()

const LOCATION_ICON: Record<string, string> = {
  'Ancient Forest':   '/icons/locations/ancient-forest.png',
  'Wildspire Waste':  '/icons/locations/wildspire-waste.png',
  'Coral Highlands':  '/icons/locations/coral-highlands.png',
  'Rotten Vale':      '/icons/locations/rotten-vale.png',
  "Elder's Recess":   '/icons/locations/elders-recess.png',
  'Hoarfrost Reach':  '/icons/locations/hoarfrost-reach.png',
  'Guiding Lands':    '/icons/locations/guiding-lands.png',
  // Portuguese names
  'Floresta Ancestral':  '/icons/locations/ancient-forest.png',
  'Ermo Selvagulha':     '/icons/locations/wildspire-waste.png',
  'Planaltos Coralinos': '/icons/locations/coral-highlands.png',
  'Vale Putrefato':      '/icons/locations/rotten-vale.png',
  'Fenda do Ancião':     '/icons/locations/elders-recess.png',
  'Pico da Geada':       '/icons/locations/hoarfrost-reach.png',
  'Terras Guia':         '/icons/locations/guiding-lands.png',
}
</script>

<template>
  <span class="loc-icon-wrap">
    <img
      v-if="LOCATION_ICON[locationName]"
      :src="LOCATION_ICON[locationName]"
      :alt="locationName"
      class="loc-icon"
      :style="size ? { width: size + 'px', height: size + 'px' } : {}"
    />
    <span v-if="showLabel" class="loc-icon__label">{{ locationName }}</span>
  </span>
</template>

<style scoped>
.loc-icon-wrap {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.loc-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  flex-shrink: 0;
  border-radius: 4px;
}

.loc-icon__label {
  font-size: 13px;
  color: var(--text);
  font-family: var(--font-heading);
}
</style>
