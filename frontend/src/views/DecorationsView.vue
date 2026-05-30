<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PaginationControls from '@/components/PaginationControls.vue'
import SearchInput from '@/components/SearchInput.vue'
import SkillTooltip from '@/components/SkillTooltip.vue'
import { useDecorations } from '@/composables/useDecorations'
import { useStoredState } from '@/composables/useStoredState'
import { usePlannerStore } from '@/stores/plannerStore'
import { useSkillsIndex } from '@/composables/useSkillsIndex'
import { useItemSources } from '@/composables/useItemSources'
import type { DecorationSummary, DecorationChance } from '@/types/decoration'

const { data: decorations, isLoading, isError } = useDecorations()
const plannerStore = usePlannerStore()
const { getLevels } = useSkillsIndex()

// ── Feystone modal ────────────────────────────────────────────────────────────
interface FeystoneModal {
  itemId: number
  name: string
  decorations: Array<{ name: string; slot: number | null; chance: number }>
}
const feystoneModal = ref<FeystoneModal | null>(null)
const feystoneItemId = computed(() => feystoneModal.value?.itemId ?? null)
const { data: feystoneSources, isLoading: feystoneLoading, isError: feystoneError } = useItemSources(feystoneItemId)

function openFeystoneModal(chance: DecorationChance) {
  const all = decorations.value ?? []
  const related = all
    .filter(d => d.chances.some(c => c.itemId === chance.itemId))
    .map(d => {
      const c = d.chances.find(c => c.itemId === chance.itemId)!
      return { name: d.name, slot: d.slot, chance: c.chance }
    })
    .sort((a, b) => b.chance - a.chance)
  feystoneModal.value = { itemId: chance.itemId, name: chance.name, decorations: related }
}

function closeFeystoneModal() {
  feystoneModal.value = null
}

// ── Planner ───────────────────────────────────────────────────────────────────
const addedToPlanner = ref(new Set<number>())

function addToPlanner(decoration: DecorationSummary) {
  plannerStore.addDecorationWithFeystones({
    decorationId: decoration.id,
    name: decoration.name,
    slot: decoration.slot,
    rarity: decoration.rarity,
    iconColor: decoration.iconColor,
    skills: decoration.skills.map(s => ({
      id: s.id,
      name: s.name,
      level: s.level,
      levelDescription: s.levelDescription,
    })),
    chances: decoration.chances,
  })
  addedToPlanner.value = new Set([...addedToPlanner.value, decoration.id])
}

const search = useStoredState('adb:decorations:search', '')
const activeSlot = useStoredState<number | 'all'>('adb:decorations:slot', 'all')
const activeRarity = useStoredState<number | 'all'>('adb:decorations:rarity', 'all')
const activeFeystone = useStoredState<number | 'all'>('adb:decorations:feystone', 'all')
const currentPage = useStoredState('adb:decorations:page', 1)

const ITEMS_PER_PAGE = 36

const slotOptions = computed(() => {
  const slots = new Set<number>()
  for (const decoration of decorations.value ?? []) {
    if (decoration.slot) slots.add(decoration.slot)
  }
  return [...slots].sort((a, b) => a - b)
})

const rarityOptions = computed(() => {
  const rarities = new Set<number>()
  for (const decoration of decorations.value ?? []) {
    if (decoration.rarity) rarities.add(decoration.rarity)
  }
  return [...rarities].sort((a, b) => a - b)
})

const feystoneOptions = computed(() => {
  const byId = new Map<number, string>()
  for (const decoration of decorations.value ?? []) {
    for (const chance of decoration.chances) byId.set(chance.itemId, chance.name)
  }
  return [...byId.entries()].map(([id, name]) => ({ id, name }))
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()

  return (decorations.value ?? []).filter(decoration => {
    if (activeSlot.value !== 'all' && decoration.slot !== activeSlot.value) return false
    if (activeRarity.value !== 'all' && decoration.rarity !== activeRarity.value) return false
    if (
      activeFeystone.value !== 'all'
      && !decoration.chances.some(chance => chance.itemId === activeFeystone.value)
    ) return false

    if (!q) return true

    const skillText = decoration.skills
      .map(skill => `${skill.name} ${skill.description} ${skill.levelDescription}`)
      .join(' ')
      .toLowerCase()

    return decoration.name.toLowerCase().includes(q) || skillText.includes(q)
  }).sort((a, b) => b.bestChance - a.bestChance)
})

const totalPages = computed(() => Math.ceil(filtered.value.length / ITEMS_PER_PAGE))

const paginated = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE
  return filtered.value.slice(start, start + ITEMS_PER_PAGE)
})

const hasFilters = computed(() =>
  search.value.trim() !== ''
  || activeSlot.value !== 'all'
  || activeRarity.value !== 'all'
  || activeFeystone.value !== 'all',
)

function clearFilters() {
  search.value = ''
  activeSlot.value = 'all'
  activeRarity.value = 'all'
  activeFeystone.value = 'all'
  currentPage.value = 1
}

function goTo(page: number) {
  currentPage.value = Math.max(1, Math.min(page, totalPages.value))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function formatChance(chance: number) {
  return `${chance.toLocaleString(undefined, { maximumFractionDigits: 3 })}%`
}

function bestMethod(decoration: DecorationSummary) {
  if (decoration.chances.length === 0) return null
  return decoration.chances.reduce((best, chance) =>
    chance.chance > best.chance ? chance : best,
  decoration.chances[0])
}

watch([search, activeSlot, activeRarity, activeFeystone], () => { currentPage.value = 1 })
watch(totalPages, (pages) => {
  if (pages > 0 && currentPage.value > pages) currentPage.value = pages
})
</script>

<template>
  <div class="decorations-page">
    <header class="decorations-page__header">
      <p class="decorations-page__label">Joias & Feystones</p>
      <h1 class="decorations-page__title">Decorações</h1>
      <p v-if="decorations" class="decorations-page__count">
        {{ filtered.length }}{{ filtered.length !== decorations.length ? `/${decorations.length}` : '' }}
        joias catalogadas
        <span v-if="totalPages > 1"> · página {{ currentPage }}/{{ totalPages }}</span>
      </p>
    </header>

    <div class="divider" />

    <div v-if="!isLoading && !isError" class="toolbar">
      <SearchInput v-model="search" placeholder="Buscar joia ou habilidade..." />
      <button v-if="hasFilters" class="clear-btn" @click="clearFilters">Limpar filtros</button>
    </div>

    <div v-if="!isLoading && !isError" class="filters">
      <div class="filter-group">
        <span class="filter-label">Slot</span>
        <button class="filter-chip" :class="{ 'filter-chip--active': activeSlot === 'all' }" @click="activeSlot = 'all'">Todos</button>
        <button
          v-for="slot in slotOptions"
          :key="slot"
          class="filter-chip"
          :class="{ 'filter-chip--active': activeSlot === slot }"
          @click="activeSlot = slot"
        >
          Nível {{ slot }}
        </button>
      </div>

      <div class="filter-group">
        <span class="filter-label">Raridade</span>
        <button class="filter-chip" :class="{ 'filter-chip--active': activeRarity === 'all' }" @click="activeRarity = 'all'">Todas</button>
        <button
          v-for="rarity in rarityOptions"
          :key="rarity"
          class="filter-chip"
          :class="{ 'filter-chip--active': activeRarity === rarity }"
          @click="activeRarity = rarity"
        >
          R{{ rarity }}
        </button>
      </div>

      <div class="filter-group filter-group--wide">
        <span class="filter-label">Método</span>
        <button class="filter-chip" :class="{ 'filter-chip--active': activeFeystone === 'all' }" @click="activeFeystone = 'all'">Todas as pedras</button>
        <button
          v-for="stone in feystoneOptions"
          :key="stone.id"
          class="filter-chip"
          :class="{ 'filter-chip--active': activeFeystone === stone.id }"
          @click="activeFeystone = stone.id"
        >
          {{ stone.name }}
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="decorations-grid">
      <div v-for="i in 12" :key="i" class="skeleton-card" />
    </div>

    <div v-else-if="isError" class="state-msg">
      <p>Falha ao carregar decorações.</p>
    </div>

    <template v-else>
      <div v-if="filtered.length > 0" class="decorations-grid">
        <article v-for="decoration in paginated" :key="decoration.id" class="decoration-card">
          <div class="decoration-card__top">
            <div class="decoration-card__icon" :data-color="decoration.iconColor">
              <img src="/icons/armor/decoration.png" alt="" />
            </div>
            <div class="decoration-card__heading">
              <h2>{{ decoration.name }}</h2>
              <div class="decoration-card__meta">
                <span>Slot {{ decoration.slot ?? '-' }}</span>
                <span>R{{ decoration.rarity ?? '-' }}</span>
              </div>
            </div>
            <div v-if="bestMethod(decoration)" class="best-rate">
              <span>{{ formatChance(bestMethod(decoration)!.chance) }}</span>
              <small>melhor</small>
            </div>
          </div>

          <div class="skills">
            <div v-for="skill in decoration.skills" :key="`${decoration.id}-${skill.id}`" class="skill-row">
              <div>
                <SkillTooltip
                  :name="skill.name"
                  :description="skill.description"
                  :current-level="skill.level"
                  :levels="getLevels(skill.name)"
                >
                  <strong>{{ skill.name }} Lv{{ skill.level }}</strong>
                </SkillTooltip>
                <p>{{ skill.levelDescription || skill.description }}</p>
              </div>
            </div>
          </div>

          <div class="chance-list">
            <button
              v-for="chance in decoration.chances"
              :key="chance.itemId"
              class="chance-chip chance-chip--btn"
              :title="`Ver decorações da ${chance.name}`"
              @click="openFeystoneModal(chance)"
            >
              <span class="chance-chip__name">{{ chance.name }}</span>
              <strong>{{ formatChance(chance.chance) }}</strong>
            </button>
            <span v-if="decoration.chances.length === 0" class="chance-chip chance-chip--empty">
              Sem método registrado
            </span>
          </div>

          <div class="decoration-card__footer">
            <button
              class="add-planner-btn"
              :class="{ 'add-planner-btn--added': addedToPlanner.has(decoration.id) }"
              @click.stop="addToPlanner(decoration)"
            >
              {{ addedToPlanner.has(decoration.id) ? '✓ No Planner' : '+ Planner' }}
            </button>
          </div>
        </article>
      </div>

      <div v-else class="state-msg">
        <p class="state-msg__title">Nenhuma decoração encontrada</p>
        <p class="state-msg__hint">Tente ajustar busca, slot, raridade ou pedra.</p>
        <button class="clear-btn clear-btn--center" @click="clearFilters">Limpar filtros</button>
      </div>

      <PaginationControls :current-page="currentPage" :total-pages="totalPages" @go-to="goTo" />
    </template>
  </div>

  <!-- Feystone modal -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="feystoneModal" class="feystone-backdrop" @click.self="closeFeystoneModal">
        <div class="feystone-modal">
          <header class="feystone-modal__header">
            <div>
              <p class="feystone-modal__label">Fonte de joias</p>
              <h2 class="feystone-modal__title">{{ feystoneModal.name }}</h2>
            </div>
            <button class="feystone-modal__close" @click="closeFeystoneModal">×</button>
          </header>

          <div class="feystone-modal__body">

            <!-- Seção: onde obter a pedra -->
            <p class="feystone-modal__section-title">Como obter</p>
            <div v-if="feystoneLoading" class="feystone-state">Carregando fontes...</div>
            <div v-else-if="feystoneError || !feystoneSources?.rewards?.length" class="feystone-state">
              Dados de localização não disponíveis para este feystone.
            </div>
            <div v-else class="feystone-source-list">
              <div
                v-for="(row, i) in [...feystoneSources.rewards].sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))"
                :key="i"
                class="feystone-source-row"
              >
                <span class="feystone-source-loc">{{ row.monsterName }}</span>
                <span class="feystone-source-area">{{ row.condition }}</span>
                <span class="feystone-source-rank">{{ row.rank }}</span>
                <strong v-if="row.percentage != null" class="feystone-source-pct">{{ row.percentage }}%</strong>
              </div>
            </div>

            <!-- Seção: decorações disponíveis -->
            <p class="feystone-modal__section-title" style="margin-top: 18px;">Decorações disponíveis</p>
            <p class="feystone-modal__hint">Ordenadas por maior chance</p>
            <div class="feystone-dec-list">
              <div
                v-for="dec in feystoneModal.decorations"
                :key="dec.name"
                class="feystone-dec-row"
              >
                <div class="feystone-dec-icon">
                  <img src="/icons/armor/decoration.png" alt="" />
                </div>
                <span class="feystone-dec-name">{{ dec.name }}</span>
                <span v-if="dec.slot" class="feystone-dec-slot">Slot {{ dec.slot }}</span>
                <strong class="feystone-dec-chance">{{ formatChance(dec.chance) }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.decorations-page {
  max-width: 1280px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.decorations-page__header { margin-bottom: 20px; }

.decorations-page__label {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 6px;
}

.decorations-page__title {
  font-family: var(--font-heading);
  font-size: clamp(24px, 4vw, 36px);
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.decorations-page__count {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 6px;
}

.divider {
  height: 1px;
  background: linear-gradient(to right, var(--gold), var(--border) 60%, transparent);
  margin-bottom: 16px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.filters {
  display: grid;
  gap: 10px;
  margin-bottom: 22px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.filter-label {
  min-width: 72px;
  font-family: var(--font-heading);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.filter-chip,
.clear-btn {
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  color: var(--text-muted);
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.filter-chip {
  padding: 7px 11px;
}

.clear-btn {
  padding: 8px 13px;
  white-space: nowrap;
}

.filter-chip:hover,
.clear-btn:hover,
.filter-chip--active {
  border-color: var(--gold);
  color: var(--gold);
  background: var(--gold-glow);
}

.clear-btn--center { margin-top: 16px; }

.decorations-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 10px;
}

@media (min-width: 760px) {
  .decorations-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (min-width: 1180px) {
  .decorations-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

.decoration-card {
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
}

.decoration-card:hover {
  border-color: var(--border-hover);
  background: var(--surface-2);
  transform: translateY(-1px);
}

.decoration-card__top {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.decoration-card__icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: rgba(196, 154, 42, 0.08);
}

.decoration-card__icon img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.decoration-card__heading {
  min-width: 0;
}

.decoration-card__heading h2 {
  margin: 0;
  color: var(--text);
  font-size: 15px;
  line-height: 1.25;
}

.decoration-card__meta {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  color: var(--text-dim);
  font-size: 12px;
}

.best-rate {
  display: grid;
  justify-items: end;
  line-height: 1.1;
}

.best-rate span {
  color: var(--gold-light);
  font-family: var(--font-heading);
  font-size: 15px;
  font-weight: 700;
}

.best-rate small {
  color: var(--text-dim);
  font-size: 10px;
  text-transform: uppercase;
}

.skills {
  display: grid;
  gap: 6px;
  margin-top: 12px;
}

.skill-row {
  border-left: 2px solid var(--gold);
  padding-left: 9px;
}

.skill-row strong {
  color: var(--text-muted);
  font-size: 12px;
}

.skill-row p {
  margin: 2px 0 0;
  color: var(--text-dim);
  font-size: 12px;
  line-height: 1.4;
}

.chance-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 13px;
}

.chance-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  max-width: 100%;
  padding: 5px 8px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: rgba(12, 11, 9, 0.42);
  color: var(--text-muted);
  font-size: 11px;
}

.chance-chip__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chance-chip strong {
  color: var(--gold);
  white-space: nowrap;
}

.chance-chip--empty {
  color: var(--text-dim);
}

.chance-chip--btn {
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.chance-chip--btn:hover {
  border-color: var(--gold);
  background: var(--gold-glow);
}

.chance-chip--btn:hover .chance-chip__name {
  color: var(--text);
}

.decoration-card__footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.add-planner-btn {
  padding: 5px 12px;
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
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.add-planner-btn:hover {
  border-color: var(--gold);
  color: var(--gold);
  background: var(--gold-glow);
}

.add-planner-btn--added {
  border-color: rgba(92, 184, 92, 0.55);
  color: #5cb85c;
  background: rgba(92, 184, 92, 0.06);
}

/* ── Feystone modal ── */
.feystone-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.feystone-modal {
  width: min(560px, 100%);
  max-height: 80vh;
  background: var(--surface);
  border: 1px solid var(--gold);
  border-radius: 10px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.feystone-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px 14px;
  border-bottom: 1px solid var(--border);
}

.feystone-modal__label {
  font-family: var(--font-heading);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0 0 4px;
}

.feystone-modal__title {
  font-family: var(--font-heading);
  font-size: 20px;
  color: var(--text);
  margin: 0;
}

.feystone-modal__close {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: 6px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 18px;
  line-height: 1;
}

.feystone-modal__body {
  padding: 16px 22px 22px;
  overflow-y: auto;
}

.feystone-modal__section-title {
  font-family: var(--font-heading);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin: 0 0 8px;
}

.feystone-modal__hint {
  font-size: 12px;
  color: var(--text-dim);
  margin: 0 0 10px;
}

.feystone-state {
  font-size: 12px;
  color: var(--text-dim);
  padding: 10px 0 4px;
  font-style: italic;
}

.feystone-source-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 4px;
}

.feystone-source-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface-2);
  font-size: 12px;
}

.feystone-source-loc {
  flex: 1;
  color: var(--text);
}

.feystone-source-area,
.feystone-source-rank {
  color: var(--text-dim);
  font-size: 11px;
  white-space: nowrap;
}

.feystone-source-pct {
  color: var(--gold);
  white-space: nowrap;
}

.feystone-dec-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.feystone-dec-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--surface-2);
}

.feystone-dec-icon {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: rgba(196, 154, 42, 0.08);
  flex-shrink: 0;
}

.feystone-dec-icon img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.feystone-dec-name {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feystone-dec-slot {
  font-size: 11px;
  color: var(--text-dim);
  white-space: nowrap;
}

.feystone-dec-chance {
  font-family: var(--font-heading);
  font-size: 13px;
  color: var(--gold);
  white-space: nowrap;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.skeleton-card {
  height: 214px;
  border-radius: 8px;
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

.state-msg__title {
  color: var(--text);
  font-family: var(--font-heading);
  margin: 0;
}

.state-msg__hint {
  margin: 4px 0 0;
  color: var(--text-dim);
}

@media (max-width: 720px) {
  .decorations-page {
    padding: 28px 14px 64px;
  }

  .toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-label {
    width: 100%;
  }

  .decoration-card__top {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .best-rate {
    grid-column: 1 / -1;
    justify-items: start;
    grid-auto-flow: column;
    justify-content: start;
    gap: 6px;
  }
}
</style>
