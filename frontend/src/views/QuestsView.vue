<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useQuests } from '@/composables/useQuests'
import { useStoredState } from '@/composables/useStoredState'
import { usePlannerStore } from '@/stores/plannerStore'
import LocationIcon from '@/components/LocationIcon.vue'
import SearchInput from '@/components/SearchInput.vue'
import type { Quest } from '@/types/quest'

const { data: quests, isLoading, isError } = useQuests()
const plannerStore = usePlannerStore()

// ── Filters ───────────────────────────────────────────────────────────────────
const activeRank = useStoredState<'all' | 'LR' | 'HR' | 'MR'>('adb:quests:rank', 'all')
const activeCat  = useStoredState<'all' | string>('adb:quests:cat', 'all')
const activeType = useStoredState<'all' | string>('adb:quests:type', 'all')
const search     = useStoredState('adb:quests:search', '')
const currentPage = useStoredState('adb:quests:page', 1)
const ITEMS_PER_PAGE = 40

const RANK_COLOR: Record<string, string> = { LR: '#8fba5a', HR: '#e8a838', MR: '#b06adc' }
const CAT_LABEL: Record<string, string>  = { assigned: 'Principais', optional: 'Opcionais', special: 'Especiais' }
const TYPE_LABEL: Record<string, string> = { hunt: 'Caçar', capture: 'Capturar', delivery: 'Entregar', assignment: 'Escolta' }

const hasFilters = computed(() =>
  activeRank.value !== 'all' || activeCat.value !== 'all' ||
  activeType.value !== 'all' || search.value.trim() !== '',
)

function clearFilters() {
  activeRank.value = 'all'
  activeCat.value  = 'all'
  activeType.value = 'all'
  search.value     = ''
  currentPage.value = 1
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return (quests.value ?? []).filter(quest => {
    if (activeRank.value !== 'all' && quest.rank !== activeRank.value) return false
    if (activeCat.value  !== 'all' && quest.category !== activeCat.value) return false
    if (activeType.value !== 'all' && quest.questType !== activeType.value) return false
    if (!q) return true
    return quest.name.toLowerCase().includes(q) || quest.objective.toLowerCase().includes(q)
  })
})

const totalPages = computed(() => Math.ceil(filtered.value.length / ITEMS_PER_PAGE))
const paginated  = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  return filtered.value.slice(start, start + ITEMS_PER_PAGE)
})

watch([activeRank, activeCat, activeType, search], () => { currentPage.value = 1 })
watch(totalPages, pages => { if (pages > 0 && currentPage.value > pages) currentPage.value = pages })

// ── Detail modal ──────────────────────────────────────────────────────────────
const selectedQuest = ref<Quest | null>(null)

function openQuest(q: Quest) { selectedQuest.value = q }
function closeQuest() { selectedQuest.value = null }

// group rewards by group letter
const rewardsByGroup = computed(() => {
  if (!selectedQuest.value) return []
  const map = new Map<string, typeof selectedQuest.value.rewards>()
  for (const r of selectedQuest.value.rewards) {
    if (!map.has(r.group)) map.set(r.group, [])
    map.get(r.group)!.push(r)
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
})

// ── Planner ───────────────────────────────────────────────────────────────────
const addedToPlanner = ref(new Set<number>())

function addToPlanner(q: Quest) {
  plannerStore.addQuestNode({
    questId:      q.id,
    name:         q.name,
    category:     q.category,
    rank:         q.rank,
    stars:        q.stars,
    questType:    q.questType,
    objective:    q.objective,
    locationName: q.locationName,
    zenny:        q.zenny,
  })
  addedToPlanner.value = new Set([...addedToPlanner.value, q.id])
}
</script>

<template>
  <div class="quests-page">
    <header class="quests-page__header">
      <p class="quests-page__label">Missões & Objetivos</p>
      <h1 class="quests-page__title">Missões</h1>
      <p v-if="quests" class="quests-page__count">
        {{ filtered.length }}{{ filtered.length !== quests.length ? `/${quests.length}` : '' }} missões
        <span v-if="totalPages > 1"> · página {{ currentPage }}/{{ totalPages }}</span>
      </p>
    </header>

    <div class="divider" />

    <div v-if="!isLoading && !isError" class="toolbar">
      <SearchInput v-model="search" placeholder="Buscar missão ou objetivo..." />
      <button v-if="hasFilters" class="clear-btn" @click="clearFilters">Limpar filtros</button>
    </div>

    <div v-if="!isLoading && !isError" class="filters">
      <!-- Rank -->
      <div class="filter-group">
        <span class="filter-label">Rank</span>
        <button class="filter-chip" :class="{ 'filter-chip--active': activeRank === 'all' }" @click="activeRank = 'all'">Todos</button>
        <button
          v-for="rank in ['LR', 'HR', 'MR']" :key="rank"
          class="filter-chip"
          :class="{ 'filter-chip--active': activeRank === rank }"
          :style="activeRank === rank ? { borderColor: RANK_COLOR[rank], color: RANK_COLOR[rank] } : {}"
          @click="activeRank = rank as 'LR'|'HR'|'MR'"
        >{{ rank }}</button>
      </div>

      <!-- Category -->
      <div class="filter-group">
        <span class="filter-label">Tipo</span>
        <button class="filter-chip" :class="{ 'filter-chip--active': activeCat === 'all' }" @click="activeCat = 'all'">Todas</button>
        <button
          v-for="[key, label] in Object.entries(CAT_LABEL)" :key="key"
          class="filter-chip"
          :class="{ 'filter-chip--active': activeCat === key }"
          @click="activeCat = key"
        >{{ label }}</button>
      </div>

      <!-- Quest type -->
      <div class="filter-group">
        <span class="filter-label">Objetivo</span>
        <button class="filter-chip" :class="{ 'filter-chip--active': activeType === 'all' }" @click="activeType = 'all'">Todos</button>
        <button
          v-for="[key, label] in Object.entries(TYPE_LABEL)" :key="key"
          class="filter-chip"
          :class="{ 'filter-chip--active': activeType === key }"
          @click="activeType = key"
        >{{ label }}</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="quest-grid">
      <div v-for="i in 12" :key="i" class="skeleton-card" />
    </div>
    <div v-else-if="isError" class="state-msg"><p>Falha ao carregar missões.</p></div>

    <template v-else>
      <div v-if="filtered.length === 0" class="state-msg">
        <p class="state-msg__title">Nenhuma missão encontrada</p>
        <p class="state-msg__hint">Tente ajustar os filtros ou a busca.</p>
        <button class="clear-btn clear-btn--center" @click="clearFilters">Limpar filtros</button>
      </div>

      <div v-else class="quest-grid">
        <article
          v-for="quest in paginated"
          :key="quest.id"
          class="quest-card"
          @click="openQuest(quest)"
        >
          <div class="quest-card__top">
            <div class="quest-card__rank" :style="{ background: RANK_COLOR[quest.rank] + '18', borderColor: RANK_COLOR[quest.rank] + '55' }">
              <span :style="{ color: RANK_COLOR[quest.rank] }">{{ quest.rank }}</span>
              <span class="quest-card__stars">{{ '★'.repeat(quest.stars ?? 0) }}</span>
            </div>
            <div class="quest-card__info">
              <h2 class="quest-card__name">{{ quest.name }}</h2>
              <p class="quest-card__objective">{{ quest.objective }}</p>
            </div>
          </div>

          <div class="quest-card__bottom">
            <div class="quest-card__tags">
              <span class="qtag">{{ CAT_LABEL[quest.category] ?? quest.category }}</span>
              <span class="qtag">{{ TYPE_LABEL[quest.questType] ?? quest.questType }}</span>
            </div>
            <div class="quest-card__side">
              <LocationIcon v-if="quest.locationId" :location-name="quest.locationName" :size="16" />
              <span class="quest-card__zenny">{{ quest.zenny.toLocaleString() }}z</span>
              <button
                class="quest-add-btn"
                :class="{ 'quest-add-btn--added': addedToPlanner.has(quest.id) }"
                :title="addedToPlanner.has(quest.id) ? 'No Planner' : 'Adicionar ao Planner'"
                @click.stop="addToPlanner(quest)"
              >{{ addedToPlanner.has(quest.id) ? '✓' : '+' }}</button>
            </div>
          </div>
        </article>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--; window.scrollTo({top:0})">‹</button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++; window.scrollTo({top:0})">›</button>
      </div>
    </template>
  </div>

  <!-- ── Quest detail modal ── -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="selectedQuest" class="quest-modal-backdrop" @click.self="closeQuest">
        <div class="quest-modal">
          <header class="quest-modal__header">
            <div class="quest-modal__header-left">
              <div
                class="quest-modal__rank"
                :style="{ background: RANK_COLOR[selectedQuest.rank] + '18', borderColor: RANK_COLOR[selectedQuest.rank] + '55' }"
              >
                <span :style="{ color: RANK_COLOR[selectedQuest.rank] }">{{ selectedQuest.rank }}</span>
                <span class="quest-modal__stars">{{ '★'.repeat(selectedQuest.stars ?? 0) }}</span>
              </div>
              <div>
                <p class="quest-modal__label">
                  {{ CAT_LABEL[selectedQuest.category] }} · {{ TYPE_LABEL[selectedQuest.questType] ?? selectedQuest.questType }}
                </p>
                <h2 class="quest-modal__title">{{ selectedQuest.name }}</h2>
              </div>
            </div>
            <div class="quest-modal__header-right">
              <button
                class="add-planner-btn"
                :class="{ 'add-planner-btn--added': addedToPlanner.has(selectedQuest.id) }"
                @click="addToPlanner(selectedQuest)"
              >
                {{ addedToPlanner.has(selectedQuest.id) ? '✓ No Planner' : '+ Planner' }}
              </button>
              <button class="quest-modal__close" @click="closeQuest">×</button>
            </div>
          </header>

          <div class="quest-modal__body">
            <!-- Meta -->
            <div class="quest-meta">
              <span class="meta-chip">
                <LocationIcon v-if="selectedQuest.locationId" :location-name="selectedQuest.locationName" :size="14" />
                {{ selectedQuest.locationName }}
              </span>
              <span class="meta-chip">{{ selectedQuest.zenny.toLocaleString() }} Zenny</span>
            </div>

            <!-- Objective -->
            <p class="quest-modal__section-title">Objetivo</p>
            <p class="quest-modal__objective">{{ selectedQuest.objective }}</p>

            <!-- Description -->
            <p v-if="selectedQuest.description" class="quest-modal__desc">{{ selectedQuest.description }}</p>

            <!-- Monsters / targets -->
            <template v-if="selectedQuest.monsters.length">
              <p class="quest-modal__section-title">Alvos</p>
              <div class="targets-list">
                <div
                  v-for="m in selectedQuest.monsters"
                  :key="m.nameEn"
                  class="target-row"
                  :class="{ 'target-row--objective': m.isObjective }"
                >
                  <span class="target-dot" :class="{ 'target-dot--main': m.isObjective }" />
                  <span class="target-name">{{ m.nameEn }}</span>
                  <span v-if="m.quantity" class="target-qty">×{{ m.quantity }}</span>
                  <span class="target-badge" :class="m.isObjective ? 'target-badge--main' : 'target-badge--sub'">
                    {{ m.isObjective ? 'Objetivo' : 'Extra' }}
                  </span>
                </div>
              </div>
            </template>

            <!-- Rewards -->
            <template v-if="selectedQuest.rewards.length">
              <p class="quest-modal__section-title">Recompensas</p>
              <div class="rewards-groups">
                <div
                  v-for="[group, items] in rewardsByGroup"
                  :key="group"
                  class="reward-group"
                >
                  <p class="reward-group__label">Grupo {{ group }}</p>
                  <div class="reward-list">
                    <div
                      v-for="(r, i) in items"
                      :key="i"
                      class="reward-row"
                    >
                      <span class="reward-name">{{ r.itemNameEn }}</span>
                      <span v-if="r.stack > 1" class="reward-stack">×{{ r.stack }}</span>
                      <strong class="reward-pct">{{ r.percentage }}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.quests-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.quests-page__header { margin-bottom: 20px; }
.quests-page__label {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 6px;
}
.quests-page__title {
  font-family: var(--font-heading);
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 700;
  color: var(--text);
  margin: 0;
}
.quests-page__count { font-size: 13px; color: var(--text-muted); margin-top: 6px; }

.divider {
  height: 1px;
  background: linear-gradient(to right, var(--gold), var(--border) 60%, transparent);
  margin-bottom: 16px;
}

/* ── Toolbar + filters ── */
.toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }

.filters { display: grid; gap: 10px; margin-bottom: 22px; }
.filter-group { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.filter-label {
  min-width: 64px;
  font-family: var(--font-heading);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.filter-chip, .clear-btn {
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text-muted);
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color .2s, color .2s, background .2s;
}
.filter-chip { padding: 7px 11px; }
.clear-btn   { padding: 8px 13px; white-space: nowrap; }
.filter-chip:hover, .clear-btn:hover, .filter-chip--active {
  border-color: var(--gold); color: var(--gold); background: var(--gold-glow);
}
.clear-btn--center { margin-top: 16px; }

/* ── Grid ── */
.quest-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
@media (min-width: 760px)  { .quest-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1180px) { .quest-grid { grid-template-columns: repeat(3, 1fr); } }

/* ── Quest card ── */
.quest-card {
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  cursor: pointer;
  transition: border-color .2s, background .2s, transform .15s;
}
.quest-card:hover { border-color: var(--border-hover); background: var(--surface-2); transform: translateY(-1px); }

.quest-card__top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.quest-card__rank {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px 7px;
  border-radius: 6px;
  border: 1px solid;
  min-width: 36px;
}
.quest-card__rank span:first-child {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
}
.quest-card__stars { font-size: 8px; color: var(--gold); letter-spacing: -1px; }

.quest-card__info { flex: 1; min-width: 0; }
.quest-card__name {
  font-family: var(--font-heading);
  font-size: 14px;
  color: var(--text);
  margin: 0 0 4px;
  line-height: 1.25;
}
.quest-card__objective {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quest-card__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.quest-card__tags { display: flex; gap: 5px; flex-wrap: wrap; }
.qtag {
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid var(--border);
  color: var(--text-dim);
  background: var(--surface-2);
}

.quest-card__side { display: flex; align-items: center; gap: 8px; }
.quest-card__zenny { font-size: 11px; color: var(--gold); font-family: var(--font-heading); white-space: nowrap; }

.quest-add-btn {
  width: 26px; height: 26px;
  border-radius: 5px;
  border: 1px solid var(--border);
  background: var(--surface-2);
  color: var(--text-muted);
  font-size: 15px;
  cursor: pointer;
  display: grid; place-items: center;
  transition: border-color .15s, color .15s, background .15s;
  flex-shrink: 0;
}
.quest-add-btn:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-glow); }
.quest-add-btn--added { border-color: rgba(92,184,92,.55); color: #5cb85c; background: rgba(92,184,92,.06); }

/* ── Pagination ── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 28px;
}
.page-btn {
  width: 36px; height: 36px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
  display: grid; place-items: center;
  transition: border-color .15s, color .15s;
}
.page-btn:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); }
.page-btn:disabled { opacity: 0.3; cursor: default; }
.page-info { font-family: var(--font-heading); font-size: 13px; color: var(--text-muted); }

/* ── Skeleton ── */
.skeleton-card {
  height: 110px; border-radius: 8px;
  background: var(--surface); border: 1px solid var(--border);
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }

/* ── State ── */
.state-msg { text-align: center; padding: 60px 20px; color: var(--text-muted); }
.state-msg__title { color: var(--text); font-family: var(--font-heading); margin: 0; }
.state-msg__hint  { margin: 4px 0 0; color: var(--text-dim); }

/* ── Modal ── */
.quest-modal-backdrop {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,.72);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.quest-modal {
  width: min(680px, 100%);
  max-height: 85vh;
  background: var(--surface);
  border: 1px solid var(--gold);
  border-radius: 10px;
  box-shadow: 0 24px 64px rgba(0,0,0,.7);
  display: flex; flex-direction: column;
  overflow: hidden;
}

.quest-modal__header {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; padding: 18px 22px 14px;
  border-bottom: 1px solid var(--border);
}
.quest-modal__header-left  { display: flex; align-items: center; gap: 14px; min-width: 0; flex: 1; }
.quest-modal__header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.quest-modal__rank {
  flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center;
  padding: 6px 9px; border-radius: 6px; border: 1px solid; min-width: 40px;
}
.quest-modal__rank span:first-child { font-family: var(--font-heading); font-size: 13px; font-weight: 700; }
.quest-modal__stars { font-size: 9px; color: var(--gold); }

.quest-modal__label {
  font-family: var(--font-heading); font-size: 10px;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--gold); margin: 0 0 4px;
}
.quest-modal__title { font-family: var(--font-heading); font-size: 18px; color: var(--text); margin: 0; }

.add-planner-btn {
  padding: 6px 14px; border: 1px solid var(--border);
  border-radius: 6px; background: var(--surface);
  color: var(--text-muted); font-family: var(--font-heading);
  font-size: 11px; letter-spacing: .06em; text-transform: uppercase;
  cursor: pointer; white-space: nowrap;
  transition: border-color .15s, color .15s, background .15s;
}
.add-planner-btn:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-glow); }
.add-planner-btn--added { border-color: rgba(92,184,92,.55); color: #5cb85c; background: rgba(92,184,92,.06); }

.quest-modal__close {
  background: transparent; border: 1px solid var(--border);
  color: var(--text-muted); border-radius: 6px;
  width: 32px; height: 32px; cursor: pointer;
  font-size: 18px; display: grid; place-items: center;
}

.quest-modal__body { padding: 18px 22px 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; }

.quest-meta { display: flex; flex-wrap: wrap; gap: 8px; }
.meta-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 10px; border-radius: 6px;
  border: 1px solid var(--border); background: var(--surface-2);
  font-size: 12px; color: var(--text-muted);
}

.quest-modal__section-title {
  font-family: var(--font-heading); font-size: 10px;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--text-muted); margin: 0;
}

.quest-modal__objective { font-size: 14px; color: var(--text); margin: 0; font-weight: 600; }
.quest-modal__desc      { font-size: 13px; color: var(--text-muted); margin: 0; line-height: 1.6; font-style: italic; }

/* ── Targets ── */
.targets-list { display: flex; flex-direction: column; gap: 6px; }
.target-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; border-radius: 7px;
  border: 1px solid var(--border); background: var(--surface-2);
}
.target-row--objective { border-color: rgba(232,168,56,.35); background: rgba(232,168,56,.05); }

.target-dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
  background: var(--text-dim);
}
.target-dot--main { background: var(--gold); }

.target-name { flex: 1; font-size: 13px; color: var(--text); }
.target-qty  { font-size: 12px; color: var(--text-muted); }

.target-badge {
  font-size: 9px; padding: 2px 6px; border-radius: 4px;
  font-family: var(--font-heading); letter-spacing: .06em;
  text-transform: uppercase; white-space: nowrap;
}
.target-badge--main { background: rgba(232,168,56,.15); color: var(--gold); border: 1px solid rgba(232,168,56,.3); }
.target-badge--sub  { background: var(--surface); color: var(--text-dim); border: 1px solid var(--border); }

/* ── Rewards ── */
.rewards-groups { display: flex; flex-direction: column; gap: 14px; }
.reward-group__label {
  font-family: var(--font-heading); font-size: 10px;
  letter-spacing: .1em; text-transform: uppercase;
  color: var(--text-dim); margin: 0 0 6px;
}
.reward-list { display: flex; flex-direction: column; gap: 4px; }
.reward-row {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 11px; border-radius: 6px;
  border: 1px solid var(--border); background: var(--surface-2);
}
.reward-name  { flex: 1; font-size: 13px; color: var(--text); }
.reward-stack { font-size: 11px; color: var(--text-dim); }
.reward-pct   { font-family: var(--font-heading); font-size: 13px; color: var(--gold); white-space: nowrap; }

/* ── Transitions ── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .18s; }
.modal-fade-enter-from,   .modal-fade-leave-to    { opacity: 0; }

@media (max-width: 720px) {
  .quests-page { padding: 28px 14px 64px; }
  .toolbar { flex-direction: column; align-items: stretch; }
  .filter-label { width: 100%; }
}
</style>
