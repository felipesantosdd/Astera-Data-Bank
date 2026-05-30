<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLocations } from '@/composables/useLocations'
import LocationIcon from '@/components/LocationIcon.vue'

const router = useRouter()
const { data: locations, isLoading, isError } = useLocations()

function openRegion(id: number) {
  router.push({ name: 'region-detail', params: { id } })
}
</script>

<template>
  <div class="regions-page">
    <header class="regions-page__header">
      <p class="regions-page__label">Locais & Coleta</p>
      <h1 class="regions-page__title">Regiões</h1>
      <p v-if="locations" class="regions-page__count">{{ locations.length }} regiões catalogadas</p>
    </header>

    <div class="divider" />

    <div v-if="isLoading" class="regions-grid">
      <div v-for="i in 7" :key="i" class="skeleton-card" />
    </div>

    <div v-else-if="isError" class="state-msg">
      <p>Falha ao carregar regiões.</p>
    </div>

    <div v-else class="regions-grid">
      <button
        v-for="loc in locations"
        :key="loc.id"
        class="region-card"
        @click="openRegion(loc.id)"
      >
        <LocationIcon :location-name="loc.name" :size="60" />
        <div class="region-card__body">
          <h2 class="region-card__name">{{ loc.name }}</h2>
          <p class="region-card__count">{{ loc.itemCount }} itens coletáveis</p>
        </div>
        <span class="region-card__arrow">›</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.regions-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.regions-page__header { margin-bottom: 20px; }

.regions-page__label {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 6px;
}

.regions-page__title {
  font-family: var(--font-heading);
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.regions-page__count {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 6px;
}

.divider {
  height: 1px;
  background: linear-gradient(to right, var(--gold), var(--border) 60%, transparent);
  margin-bottom: 24px;
}

.regions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

@media (min-width: 600px) {
  .regions-grid { grid-template-columns: repeat(2, 1fr); }
}

.region-card {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 22px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
}

.region-card:hover {
  border-color: var(--gold);
  background: var(--surface-2);
  transform: translateY(-2px);
}

.region-card__body {
  flex: 1;
  min-width: 0;
}

.region-card__name {
  font-family: var(--font-heading);
  font-size: 18px;
  color: var(--text);
  margin: 0 0 4px;
}

.region-card__count {
  font-size: 13px;
  color: var(--text-dim);
  margin: 0;
}

.region-card__arrow {
  font-size: 24px;
  color: var(--text-dim);
  flex-shrink: 0;
  transition: color 0.15s;
}

.region-card:hover .region-card__arrow {
  color: var(--gold);
}

.skeleton-card {
  height: 100px;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.state-msg {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

@media (max-width: 640px) {
  .regions-page { padding: 28px 14px 64px; }
}
</style>
