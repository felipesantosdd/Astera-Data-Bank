<script setup lang="ts">
import type { RegionNodeData } from '@/types/planner'
import { usePlannerStore } from '@/stores/plannerStore'
import PlannerHandles from '@/components/planner/PlannerHandles.vue'

const props = defineProps<{ id: string; data: RegionNodeData }>()
const store = usePlannerStore()

function toggleDone(e: MouseEvent) {
  e.stopPropagation()
  store.updateNodeData(props.id, { done: !props.data.done })
}

function remove(e: MouseEvent) {
  e.stopPropagation()
  store.removeNode(props.id)
}

const LOCATION_ICON: Record<string, string> = {
  'Ancient Forest':   '/icons/locations/ancient-forest.png',
  'Wildspire Waste':  '/icons/locations/wildspire-waste.png',
  'Coral Highlands':  '/icons/locations/coral-highlands.png',
  'Rotten Vale':      '/icons/locations/rotten-vale.png',
  "Elder's Recess":   '/icons/locations/elders-recess.png',
  'Hoarfrost Reach':  '/icons/locations/hoarfrost-reach.png',
  'Guiding Lands':    '/icons/locations/guiding-lands.png',
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
  <div class="region-node" :class="{ 'region-node--done': data.done }">
    <PlannerHandles :node-id="id" />

    <!-- Botão remover -->
    <button class="region-node__remove" title="Remover" @click="remove">✕</button>

    <!-- Ícone da região -->
    <div class="region-node__icon-wrap">
      <img
        v-if="LOCATION_ICON[data.locationName]"
        :src="LOCATION_ICON[data.locationName]"
        :alt="data.locationName"
        class="region-node__icon"
      />
      <span v-else class="region-node__icon-fallback">🗺</span>
      <!-- Checkmark de done -->
      <div v-if="data.done" class="region-node__done-badge">✓</div>
    </div>

    <!-- Nome -->
    <p class="region-node__name">{{ data.locationName }}</p>

    <!-- Botão de toggle -->
    <button
      class="region-node__toggle"
      :class="{ 'region-node__toggle--done': data.done }"
      @click="toggleDone"
    >
      {{ data.done ? 'Reabrir' : 'Concluída ✓' }}
    </button>
  </div>
</template>

<style scoped>
.region-node {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px 12px;
  width: 130px;
  cursor: default;
  transition: border-color .2s, opacity .2s;
  user-select: none;
}

.region-node--done {
  border-color: #5cb85c;
  opacity: 0.65;
}

.region-node__remove {
  position: absolute;
  top: 6px;
  right: 6px;
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 11px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  transition: color .15s, background .15s;
  line-height: 1;
}
.region-node__remove:hover { color: #e06060; background: rgba(224,96,96,.12); }

.region-node__icon-wrap {
  position: relative;
  width: 64px;
  height: 64px;
  flex-shrink: 0;
}

.region-node__icon {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: 8px;
}

.region-node__icon-fallback {
  font-size: 40px;
  line-height: 64px;
  display: block;
  text-align: center;
}

.region-node__done-badge {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,.5);
  border-radius: 8px;
  font-size: 28px;
  color: #5cb85c;
  font-weight: 700;
}

.region-node__name {
  font-family: var(--font-heading);
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
  margin: 0;
  line-height: 1.3;
}

.region-node__toggle {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 10px;
  font-family: var(--font-heading);
  letter-spacing: .04em;
  padding: 4px 8px;
  cursor: pointer;
  transition: color .15s, border-color .15s, background .15s;
  width: 100%;
}

.region-node__toggle:hover {
  color: var(--text);
  border-color: var(--gold);
}

.region-node__toggle--done {
  color: #5cb85c;
  border-color: #5cb85c40;
  background: rgba(92,184,92,.1);
}
</style>
