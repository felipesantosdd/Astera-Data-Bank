<script setup lang="ts">
import type { ItemSummary } from '@/types/item'
import ItemIcon from '@/components/ItemIcon.vue'

defineProps<{
  item: ItemSummary
}>()

defineEmits<{ open: [id: number, name: string] }>()

/** Estrelas de raridade (máx 3 para não poluir) */
function rarityDots(rarity: number | null): number {
  if (!rarity) return 0
  if (rarity <= 4) return 1
  if (rarity <= 7) return 2
  return 3
}
</script>

<template>
  <button class="material-card" @click="$emit('open', item.id, item.name)">
    <div class="material-card__icon-wrap">
      <ItemIcon :name="item.iconName" :color="item.iconColor" :size="40" />
    </div>

    <div class="material-card__body">
      <p class="material-card__name">{{ item.name }}</p>
      <span class="material-card__rarity">
        <span
          v-for="n in rarityDots(item.rarity)"
          :key="n"
          class="material-card__dot"
          :data-level="rarityDots(item.rarity)"
        />
      </span>
    </div>
  </button>
</template>

<style scoped>
.material-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
}

.material-card:hover {
  border-color: var(--gold);
  background: var(--surface-2);
  transform: translateY(-1px);
}

.material-card__icon-wrap {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.material-card__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.material-card__name {
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  line-height: 1.3;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  transition: color 0.2s;
}

.material-card:hover .material-card__name {
  color: var(--text);
}

.material-card__rarity {
  display: flex;
  gap: 3px;
}

.material-card__dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--text-dim);
}

.material-card__dot[data-level="2"] { background: var(--gold); }
.material-card__dot[data-level="3"] { background: var(--el-fire); }
</style>
