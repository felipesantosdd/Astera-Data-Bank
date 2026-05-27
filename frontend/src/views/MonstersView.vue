<script setup lang="ts">
import MonsterCard from '@/components/MonsterCard.vue'
import { useMonsters } from '@/composables/useMonsters'
import { useUI } from '@/composables/useUI'

const { data: monsters, isLoading, isError } = useMonsters()
const { t, lang } = useUI()
</script>

<template>
  <div class="monsters-page">

    <!-- Cabeçalho estilo MHW -->
    <header class="monsters-page__header">
      <p class="monsters-page__label">{{ t.listing.bestiary }}</p>
      <h1 class="monsters-page__title">{{ t.listing.largeMonsters }}</h1>
      <p v-if="monsters" class="monsters-page__count">
        {{ monsters.length }} {{ t.listing.monstersRecorded }}
      </p>
    </header>

    <!-- Divisor dourado estilo MHW -->
    <div class="divider" />

    <!-- Loading: skeleton cards -->
    <div v-if="isLoading" class="monsters-grid">
      <div
        v-for="i in 18"
        :key="i"
        class="skeleton-card"
      />
    </div>

    <!-- Erro -->
    <div v-else-if="isError" class="monsters-page__error">
      <p>⚠ {{ t.listing.loadingError }}</p>
      <p class="monsters-page__error-hint">{{ t.listing.backendHint }}</p>
    </div>

    <!-- Grid de monstros -->
    <div v-else class="monsters-grid">
      <MonsterCard
        v-for="monster in monsters"
        :key="`${lang}-${monster.id}`"
        :monster="monster"
      />
    </div>

  </div>
</template>

<style scoped>
.monsters-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

/* ── Cabeçalho ── */
.monsters-page__header {
  margin-bottom: 20px;
}

.monsters-page__label {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 6px;
}

.monsters-page__title {
  font-family: var(--font-heading);
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.monsters-page__count {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 6px;
}

/* ── Divisor dourado ── */
.divider {
  height: 1px;
  background: linear-gradient(to right, var(--gold), var(--border) 60%, transparent);
  margin-bottom: 32px;
}

/* ── Grid ── */
.monsters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (min-width: 480px)  { .monsters-grid { grid-template-columns: repeat(4, 1fr); } }
@media (min-width: 640px)  { .monsters-grid { grid-template-columns: repeat(5, 1fr); } }
@media (min-width: 900px)  { .monsters-grid { grid-template-columns: repeat(6, 1fr); } }
@media (min-width: 1100px) { .monsters-grid { grid-template-columns: repeat(7, 1fr); } }

/* ── Skeleton loading ── */
.skeleton-card {
  height: 150px;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* ── Erro ── */
.monsters-page__error {
  text-align: center;
  padding: 60px 20px;
  color: var(--el-fire);
  font-family: var(--font-heading);
}

.monsters-page__error-hint {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 8px;
}
</style>
