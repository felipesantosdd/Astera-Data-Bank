<script setup lang="ts">
import ItemIcon from '@/components/ItemIcon.vue'

interface Material {
  itemId: number
  name: string
  quantity: number
  iconName?: string | null
  iconColor?: string | null
}

defineProps<{
  materials: Material[]
  size?: 'sm' | 'md'
}>()

const emit = defineEmits<{ click: [material: Material] }>()
</script>

<template>
  <div v-if="materials.length" class="mat-chip-list" :class="size === 'sm' ? 'mat-chip-list--sm' : ''">
    <button
      v-for="m in materials"
      :key="m.itemId"
      class="mat-chip"
      @click="emit('click', m)"
    >
      <ItemIcon :name="m.iconName ?? null" :color="m.iconColor ?? null" :size="size === 'sm' ? 20 : 24" />
      <span class="mat-chip__name">{{ m.name }}</span>
      <span class="mat-chip__qty">×{{ m.quantity }}</span>
    </button>
  </div>
</template>

<style scoped>
.mat-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mat-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 5px 10px 5px 6px;
  font-size: 12px;
  cursor: pointer;
  transition: border-color .15s, background .15s;
  white-space: nowrap;
}

.mat-chip:hover { border-color: var(--gold); background: var(--gold-glow); }

.mat-chip__name { color: var(--text); }
.mat-chip__qty  { color: var(--text-muted); font-weight: 600; }

.mat-chip-list--sm .mat-chip { padding: 3px 8px 3px 4px; font-size: 11px; gap: 4px; }
</style>
