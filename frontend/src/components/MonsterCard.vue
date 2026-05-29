<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Monster } from '@/types/monster'
import { useUI } from '@/composables/useUI'
import { usePlannerPresence } from '@/composables/usePlannerPresence'

const props = defineProps<{ monster: Monster }>()
const router = useRouter()
const { t } = useUI()
const { isMonsterInPlanner } = usePlannerPresence()
const isPlanned = computed(() => isMonsterInPlanner(props.monster.id))

const ecologyLabel = computed(() => {
  if (!props.monster.ecology) return null
  return (t.value.ecologies as Record<string, string>)[props.monster.ecology] ?? props.monster.ecology
})

const localIcon = `/monsters/${props.monster.id}.png`
const imgFailed = ref(false)

const initials = props.monster.name
  .split(' ')
  .map((w: string) => w[0])
  .slice(0, 2)
  .join('')

function goToDetail() {
  router.push({ name: 'monster-detail', params: { id: props.monster.id } })
}
</script>

<template>
  <button class="monster-card" :class="{ 'monster-card--planned': isPlanned }" @click="goToDetail">
    <span v-if="isPlanned" class="planner-mark">✓ Planner</span>
    <div class="monster-card__icon-wrap">
      <img
        v-if="!imgFailed"
        :src="localIcon"
        :alt="monster.name"
        class="monster-card__icon"
        @error="imgFailed = true"
      />
      <span v-else class="monster-card__initials">{{ initials }}</span>
    </div>

    <p class="monster-card__name">{{ monster.name }}</p>
    <p v-if="ecologyLabel" class="monster-card__ecology">{{ ecologyLabel }}</p>
  </button>
</template>

<style scoped>
.monster-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s, background 0.25s;
  text-align: center;
  width: 100%;
}

.monster-card--planned {
  border-color: var(--gold);
  box-shadow: inset 0 0 0 1px rgba(196, 154, 42, 0.35);
}

.planner-mark {
  position: absolute;
  top: 8px;
  right: 8px;
  border: 1px solid var(--gold);
  border-radius: 999px;
  padding: 2px 7px;
  background: var(--gold-glow);
  color: var(--gold);
  font-family: var(--font-heading);
  font-size: 9px;
  letter-spacing: 0.06em;
}

.monster-card:hover {
  border-color: var(--gold);
  background: var(--surface-2);
  box-shadow: 0 0 18px var(--gold-glow), 0 4px 12px rgba(0,0,0,0.4);
  transform: translateY(-2px);
}

.monster-card__icon-wrap {
  width: 104px;
  height: 104px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.monster-card__icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 0px transparent);
  transition: filter 0.25s;
}

.monster-card:hover .monster-card__icon {
  filter: drop-shadow(0 0 6px var(--gold-glow));
}

.monster-card__initials {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  color: var(--text-dim);
  transition: color 0.25s;
}

.monster-card:hover .monster-card__initials {
  color: var(--gold);
}

.monster-card__name {
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  line-height: 1.3;
  letter-spacing: 0.03em;
  transition: color 0.25s;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.monster-card:hover .monster-card__name {
  color: var(--text);
}

.monster-card__ecology {
  font-family: var(--font-body);
  font-size: 10px;
  color: var(--text-dim);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1.2;
  transition: color 0.25s;
}

.monster-card:hover .monster-card__ecology {
  color: var(--gold);
}
</style>
