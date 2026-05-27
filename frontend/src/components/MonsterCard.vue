<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ElementBadge from './ElementBadge.vue'
import type { Monster } from '@/types/monster'

const props = defineProps<{ monster: Monster }>()
const router = useRouter()

// Ícone local: public/monsters/{id}.png
// Servido pelo próprio Vite — sem dependência de CDN externo
const localIcon = `/monsters/${props.monster.id}.png`
const imgFailed = ref(false)

// Fallback: iniciais do nome (para os 5 sem ícone local)
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
  <button class="monster-card" @click="goToDetail">

    <!-- Ícone do monstro -->
    <div class="monster-card__icon-wrap">
      <img
        v-if="!imgFailed"
        :src="localIcon"
        :alt="monster.name"
        class="monster-card__icon"
        @error="imgFailed = true"
      />
      <!-- Fallback com as iniciais (só para os 5 sem arquivo local) -->
      <span v-else class="monster-card__initials">{{ initials }}</span>
    </div>

    <!-- Nome -->
    <p class="monster-card__name">{{ monster.name }}</p>

    <!-- Fraquezas elementais (só as 5 principais) -->
    <div class="monster-card__elements">
      <ElementBadge element="fire"    :value="monster.weaknessFire" />
      <ElementBadge element="water"   :value="monster.weaknessWater" />
      <ElementBadge element="thunder" :value="monster.weaknessThunder" />
      <ElementBadge element="ice"     :value="monster.weaknessIce" />
      <ElementBadge element="dragon"  :value="monster.weaknessDragon" />
    </div>

  </button>
</template>

<style scoped>
.monster-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 12px 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s, background 0.25s;
  text-align: center;
  width: 100%;
}

.monster-card:hover {
  border-color: var(--gold);
  background: var(--surface-2);
  box-shadow: 0 0 18px var(--gold-glow), 0 4px 12px rgba(0,0,0,0.4);
  transform: translateY(-2px);
}

/* ── Ícone ── */
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

/* ── Nome ── */
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

/* ── Fraquezas ── */
.monster-card__elements {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  min-height: 22px;
}
</style>
