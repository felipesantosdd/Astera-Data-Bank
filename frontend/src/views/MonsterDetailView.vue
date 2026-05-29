<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMonster } from '@/composables/useMonster'
import { useUI } from '@/composables/useUI'
import { translatePart } from '@/i18n/hitzoneParts'
import ElementBadge from '@/components/ElementBadge.vue'
import MonsterArmorSection from '@/components/MonsterArmorSection.vue'
import MonsterDropsSection from '@/components/MonsterDropsSection.vue'
import type { Hitzone } from '@/types/monster'
import { usePlannerStore } from '@/stores/plannerStore'

// ── Tabs ──────────────────────────────────────────────────────────────────
type TabKey = 'combat' | 'drops' | 'equipment' | 'stats'
const TABS: TabKey[] = ['combat', 'drops', 'equipment', 'stats']
const activeTab = ref<TabKey>('combat')

const route  = useRoute()
const router = useRouter()

const id = computed(() => Number(route.params.id))
const { data: monster, isLoading, isError } = useMonster(id)
const { t, lang } = useUI()

// ── Hitzones ──────────────────────────────────────────────────────────────
type HzCol = 'cut' | 'impact' | 'shot' | 'fire' | 'water' | 'thunder' | 'ice' | 'dragon' | 'ko'
const HZ_COLS: HzCol[] = ['cut', 'impact', 'shot', 'fire', 'water', 'thunder', 'ice', 'dragon', 'ko']

const hitzones = computed<Hitzone[]>(() => monster.value?.hitzones ?? [])

// Maior valor por coluna — usado para destacar o ponto fraco
const maxByCol = computed<Record<HzCol, number>>(() => {
  const result = Object.fromEntries(HZ_COLS.map(c => [c, 0])) as Record<HzCol, number>
  for (const hz of hitzones.value) {
    for (const col of HZ_COLS) {
      const v = hz[col]
      if (typeof v === 'number' && v > result[col]) result[col] = v
    }
  }
  return result
})

function isMax(value: number | null, col: HzCol): boolean {
  return value != null && value > 0 && value === maxByCol.value[col]
}

// ── Ailments ──────────────────────────────────────────────────────────────
function intensityStars(level: string | null | undefined): string {
  if (!level || level === 'none') return ''
  if (level === 'small') return '★'
  if (level === 'large') return '★★'
  return '★★★'
}

const blightAilments = computed(() => {
  const m = monster.value
  if (!m) return []
  return [
    { key: 'fire',    label: t.value.ailments.fireblight,    active: m.ailmentFireblight },
    { key: 'water',   label: t.value.ailments.waterblight,   active: m.ailmentWaterblight },
    { key: 'thunder', label: t.value.ailments.thunderblight, active: m.ailmentThunderblight },
    { key: 'ice',     label: t.value.ailments.iceblight,     active: m.ailmentIceblight },
    { key: 'dragon',  label: t.value.ailments.dragonblight,  active: m.ailmentDragonblight },
    { key: 'blast',   label: t.value.ailments.blastblight,   active: m.ailmentBlastblight },
  ].filter(a => a.active)
})

const statusAilments = computed(() => {
  const m = monster.value
  if (!m) return []
  return [
    { key: 'poison',      label: t.value.ailments.poison,      active: m.ailmentPoison },
    { key: 'sleep',       label: t.value.ailments.sleep,       active: m.ailmentSleep },
    { key: 'paralysis',   label: t.value.ailments.paralysis,   active: m.ailmentParalysis },
    { key: 'bleed',       label: t.value.ailments.bleeding,    active: m.ailmentBleed },
    { key: 'stun',        label: t.value.ailments.stun,        active: m.ailmentStun },
    { key: 'mud',         label: t.value.ailments.muddy,       active: m.ailmentMud },
    { key: 'effluvia',    label: t.value.ailments.effluvia,    active: m.ailmentEffluvia },
    { key: 'defenseDown', label: t.value.ailments.defenseDown, active: m.ailmentDefenseDown },
  ].filter(a => a.active)
})

// ── Ícone (local, com fallback de iniciais) ───────────────────────────────
const localIcon  = computed(() => `/monsters/${id.value}.png`)
const imgFailed  = ref(false)
const initials   = computed(() =>
  (monster.value?.name ?? '')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
)

// Reseta o fallback ao mudar de monstro ou idioma (mesmo problema do MonsterCard)
watch([id, () => monster.value?.name], () => { imgFailed.value = false })

// ── Planner ───────────────────────────────────────────────────────────────────
const plannerStore = usePlannerStore()
const plannerFeedback = ref<'added' | 'exists' | null>(null)

function addToPlanner() {
  if (!monster.value) return
  const added = plannerStore.addMonsterNode({
    monsterId: monster.value.id,
    name: monster.value.name,
    icon: null,
    ecology: monster.value.ecology ?? '',
  })
  plannerFeedback.value = added ? 'added' : 'exists'
  setTimeout(() => { plannerFeedback.value = null }, 2500)
}
</script>

<template>
  <div class="detail-page">

    <button class="back-btn" @click="router.push({ name: 'monsters' })">
      ← {{ t.detail.back }}
    </button>

    <!-- Loading -->
    <div v-if="isLoading" class="state">
      <div class="state__skeleton" />
    </div>

    <!-- Erro -->
    <div v-else-if="isError || !monster" class="state state--error">
      <p>⚠ {{ t.detail.monsterNotFound }}</p>
      <p class="state__hint">{{ t.detail.backendHint }}</p>
    </div>

    <template v-else>
      <!-- ── Hero ──────────────────────────────────────────────────────── -->
      <section class="hero">
        <div class="hero__icon-wrap">
          <img
            v-if="!imgFailed"
            :src="localIcon"
            :alt="monster.name"
            class="hero__icon"
            @error="imgFailed = true"
          />
          <span v-else class="hero__initials">{{ initials }}</span>
        </div>

        <div class="hero__info">
          <p class="hero__label">{{ t.detail.bestiary }}</p>
          <h1 class="hero__title">{{ monster.name }}</h1>
          <p v-if="monster.ecology" class="hero__ecology">{{ monster.ecology }}</p>
          <p v-if="monster.description" class="hero__description">{{ monster.description }}</p>

          <!-- Planner CTA -->
          <div class="hero__planner">
            <button class="planner-add-btn" @click="addToPlanner">
              ＋ Adicionar ao planejamento
            </button>
            <Transition name="fade">
              <span
                v-if="plannerFeedback"
                class="planner-add-feedback"
                :class="{ 'planner-add-feedback--exists': plannerFeedback === 'exists' }"
              >
                {{ plannerFeedback === 'added' ? '✓ Monstro adicionado ao planejamento' : '⚠ Já está no planejamento' }}
              </span>
            </Transition>
          </div>
        </div>
      </section>

      <div class="divider" />

      <!-- ── Tabs nav ──────────────────────────────────────────────────── -->
      <nav class="tabs">
        <button
          v-for="tab in TABS"
          :key="tab"
          class="tab"
          :class="{ 'tab--active': activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ t.tabs[tab] }}
        </button>
      </nav>

      <!-- ── Tab: Combate ──────────────────────────────────────────────── -->
      <template v-if="activeTab === 'combat'">

      <!-- ── Info grid ─────────────────────────────────────────────────── -->
      <div class="info-grid">

        <!-- Fraquezas -->
        <section class="card">
          <h2 class="card__title">{{ t.detail.weaknesses }}</h2>

          <h3 class="card__subtitle">{{ t.detail.elemental }}</h3>
          <div class="badges">
            <ElementBadge element="fire"    :value="monster.weaknessFire" />
            <ElementBadge element="water"   :value="monster.weaknessWater" />
            <ElementBadge element="thunder" :value="monster.weaknessThunder" />
            <ElementBadge element="ice"     :value="monster.weaknessIce" />
            <ElementBadge element="dragon"  :value="monster.weaknessDragon" />
          </div>

          <h3 class="card__subtitle">{{ t.detail.status }}</h3>
          <div class="badges">
            <ElementBadge element="poison"    :value="monster.weaknessPoison" />
            <ElementBadge element="sleep"     :value="monster.weaknessSleep" />
            <ElementBadge element="paralysis" :value="monster.weaknessParalysis" />
            <ElementBadge element="blast"     :value="monster.weaknessBlast" />
            <ElementBadge element="stun"      :value="monster.weaknessStun" />
          </div>

          <template v-if="monster.hasAltWeakness">
            <div class="alt-banner">
              <span class="alt-banner__text">{{ t.detail.altState }}</span>
            </div>

            <p v-if="monster.altStateDescription" class="alt-description">
              {{ monster.altStateDescription }}
            </p>

            <h3 class="card__subtitle">{{ t.detail.elemental }}</h3>
            <div class="badges">
              <ElementBadge element="fire"    :value="monster.altWeaknessFire" />
              <ElementBadge element="water"   :value="monster.altWeaknessWater" />
              <ElementBadge element="thunder" :value="monster.altWeaknessThunder" />
              <ElementBadge element="ice"     :value="monster.altWeaknessIce" />
              <ElementBadge element="dragon"  :value="monster.altWeaknessDragon" />
            </div>

            <h3 class="card__subtitle">{{ t.detail.status }}</h3>
            <div class="badges">
              <ElementBadge element="poison"    :value="monster.altWeaknessPoison" />
              <ElementBadge element="sleep"     :value="monster.altWeaknessSleep" />
              <ElementBadge element="paralysis" :value="monster.altWeaknessParalysis" />
              <ElementBadge element="blast"     :value="monster.altWeaknessBlast" />
              <ElementBadge element="stun"      :value="monster.altWeaknessStun" />
            </div>
          </template>
        </section>

        <!-- Ailments + Traps -->
        <section class="card">
          <h2 class="card__title">{{ t.detail.inflictsOnHunter }}</h2>

          <ul class="ailment-list">
            <li v-if="intensityStars(monster.ailmentRoar)" class="ailment-item">
              <span class="ailment-item__name">{{ t.ailments.roar }}</span>
              <span class="ailment-item__stars">{{ intensityStars(monster.ailmentRoar) }}</span>
            </li>
            <li v-if="intensityStars(monster.ailmentWind)" class="ailment-item">
              <span class="ailment-item__name">{{ t.ailments.wind }}</span>
              <span class="ailment-item__stars">{{ intensityStars(monster.ailmentWind) }}</span>
            </li>
            <li v-if="intensityStars(monster.ailmentTremor)" class="ailment-item">
              <span class="ailment-item__name">{{ t.ailments.tremor }}</span>
              <span class="ailment-item__stars">{{ intensityStars(monster.ailmentTremor) }}</span>
            </li>

            <li v-for="a in blightAilments" :key="a.key" class="ailment-item ailment-item--blight">
              <span class="ailment-item__name">{{ a.label }}</span>
              <span class="ailment-item__check">✓</span>
            </li>
            <li v-for="a in statusAilments" :key="a.key" class="ailment-item">
              <span class="ailment-item__name">{{ a.label }}</span>
              <span class="ailment-item__check">✓</span>
            </li>
          </ul>

          <h3 class="card__subtitle">{{ t.detail.trapEffectiveness }}</h3>
          <div class="traps">
            <span class="trap" :class="{ 'trap--off': !monster.pitfallTrap }">
              {{ t.traps.pitfall }} {{ monster.pitfallTrap ? '✓' : '✗' }}
            </span>
            <span class="trap" :class="{ 'trap--off': !monster.shockTrap }">
              {{ t.traps.shock }} {{ monster.shockTrap ? '✓' : '✗' }}
            </span>
            <span class="trap" :class="{ 'trap--off': !monster.vineTrap }">
              {{ t.traps.vine }} {{ monster.vineTrap ? '✓' : '✗' }}
            </span>
          </div>
        </section>

      </div>

      <!-- ── Hitzones ──────────────────────────────────────────────────── -->
      <section class="card card--full">
        <h2 class="card__title">{{ t.detail.hitzones }}</h2>
        <p class="card__hint">{{ t.detail.hitzonesHint }}</p>

        <div v-if="hitzones.length === 0" class="state">
          <p class="state__hint">{{ t.detail.noHitzones }}</p>
        </div>

        <div v-else class="table-wrap">
          <table class="hz-table">
            <thead>
              <tr>
                <th class="hz-table__part">{{ t.columns.part }}</th>
                <th>{{ t.columns.cut }}</th>
                <th>{{ t.columns.impact }}</th>
                <th>{{ t.columns.shot }}</th>
                <th>{{ t.columns.fire }}</th>
                <th>{{ t.columns.water }}</th>
                <th>{{ t.columns.thunder }}</th>
                <th>{{ t.columns.ice }}</th>
                <th>{{ t.columns.dragon }}</th>
                <th>{{ t.columns.ko }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(hz, i) in hitzones" :key="i">
                <td class="hz-table__part">{{ translatePart(hz.part, lang) }}</td>
                <td
                  v-for="col in HZ_COLS"
                  :key="col"
                  :class="{ 'hz-table__max': isMax(hz[col], col) }"
                >
                  {{ hz[col] ?? '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      </template>
      <!-- ↑ fim da aba Combate -->

      <!-- ── Tab: Drops ────────────────────────────────────────────────── -->
      <MonsterDropsSection
        v-else-if="activeTab === 'drops'"
        :monster-id="id"
      />

      <!-- ── Tab: Equipamentos ─────────────────────────────────────────── -->
      <MonsterArmorSection
        v-else-if="activeTab === 'equipment'"
        :monster-id="id"
      />

      <!-- ── Tab: Stats (placeholder) ──────────────────────────────────── -->
      <section v-else-if="activeTab === 'stats'" class="card card--full">
        <h2 class="card__title">{{ t.tabs.stats }}</h2>
        <div class="state">
          <p class="state__hint">{{ t.drops.statsPlaceholder }}</p>
        </div>
      </section>

    </template>
  </div>
</template>

<style scoped>
.detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

@media (max-width: 640px) {
  .detail-page { padding: 20px 16px 60px; }
}

/* ── Botão de voltar ─────────────────────────────────────────────────── */
.back-btn {
  font-family: var(--font-heading);
  font-size: 12px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--gold);
  background: none;
  border: none;
  padding: 0;
  margin-bottom: 32px;
  transition: color 0.2s, letter-spacing 0.2s;
}
.back-btn:hover {
  color: var(--text);
  letter-spacing: 0.18em;
}

/* ── Estados (loading / erro / vazio) ────────────────────────────────── */
.state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}
.state--error { color: var(--el-fire); font-family: var(--font-heading); }
.state__hint  { font-size: 13px; color: var(--text-muted); margin-top: 8px; }
.state__skeleton {
  height: 180px;
  border-radius: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

/* ── Hero ────────────────────────────────────────────────────────────── */
.hero {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  margin-bottom: 24px;
}
.hero__icon-wrap {
  width: 180px;
  height: 180px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 0 24px var(--gold-glow);
}
.hero__icon {
  width: 90%;
  height: 90%;
  object-fit: contain;
  filter: drop-shadow(0 0 8px var(--gold-glow));
}
.hero__initials {
  font-family: var(--font-heading);
  font-size: 56px;
  font-weight: 700;
  color: var(--text-dim);
}
.hero__info { flex: 1; min-width: 0; }
.hero__label {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 6px;
}
.hero__title {
  font-family: var(--font-heading);
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 700;
  color: var(--text);
  margin: 0 0 4px;
}
.hero__ecology {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0 0 16px;
  font-style: italic;
}
.hero__description {
  font-size: 15px;
  line-height: 1.7;
  color: var(--text);
  margin: 0;
  max-width: 70ch;
}

/* ── Planner CTA ─────────────────────────────────────────────────────── */
.hero__planner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.planner-add-btn {
  background: transparent;
  border: 1px solid var(--gold);
  color: var(--gold);
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 13px;
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.planner-add-btn:hover {
  background: var(--gold-glow);
  color: var(--gold-light);
}

.planner-add-feedback {
  font-size: 12px;
  color: #5cb85c;
}

.planner-add-feedback--exists {
  color: var(--text-muted);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── Divisor dourado ─────────────────────────────────────────────────── */
.divider {
  height: 1px;
  background: linear-gradient(to right, var(--gold), var(--border) 60%, transparent);
  margin: 32px 0;
}

/* ── Tabs ────────────────────────────────────────────────────────────── */
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border);
}
.tab {
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  padding: 12px 22px;
  margin-bottom: -1px;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
  cursor: pointer;
}
.tab:hover { color: var(--text); background: var(--surface); }
.tab--active {
  color: var(--gold);
  border-bottom-color: var(--gold);
}
.tab--active:hover { background: var(--gold-glow); }

/* ── Info grid ───────────────────────────────────────────────────────── */
.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
@media (min-width: 768px) {
  .info-grid { grid-template-columns: 1fr 1fr; }
}

/* ── Cards ───────────────────────────────────────────────────────────── */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px 22px;
}
.card--full { margin-top: 16px; }
.card__title {
  font-family: var(--font-heading);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0 0 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
}
.card__subtitle {
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin: 16px 0 8px;
}
.card__hint {
  font-size: 12px;
  color: var(--text-muted);
  margin: -8px 0 16px;
}

/* ── Badges (fraquezas) ──────────────────────────────────────────────── */
.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* ── Alt state ───────────────────────────────────────────────────────── */
.alt-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0 8px;
}
.alt-banner::before, .alt-banner::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--el-fire) 50%, transparent);
}
.alt-banner__text {
  font-family: var(--font-heading);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--el-fire);
}
.alt-description {
  font-size: 13px;
  color: var(--text-muted);
  font-style: italic;
  margin: 0 0 12px;
}

/* ── Ailments ────────────────────────────────────────────────────────── */
.ailment-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ailment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--surface-2);
  border-radius: 6px;
  border-left: 2px solid var(--border);
  font-size: 13px;
}
.ailment-item--blight { border-left-color: var(--el-fire); }
.ailment-item__name { color: var(--text); }
.ailment-item__stars {
  color: var(--gold);
  letter-spacing: 2px;
  font-size: 12px;
}
.ailment-item__check {
  color: var(--gold);
  font-weight: 700;
}

/* ── Traps ───────────────────────────────────────────────────────────── */
.traps {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.trap {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(196, 154, 42, 0.12);
  color: var(--gold);
  border: 1px solid rgba(196, 154, 42, 0.3);
}
.trap--off {
  background: transparent;
  color: var(--text-dim);
  border-color: var(--border);
  text-decoration: line-through;
}

/* ── Tabela de hitzones ──────────────────────────────────────────────── */
.table-wrap { overflow-x: auto; }
.hz-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 640px;
}
.hz-table th, .hz-table td {
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid var(--border);
}
.hz-table th {
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  background: var(--surface-2);
}
.hz-table td {
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.hz-table__part {
  text-align: left !important;
  color: var(--text) !important;
  font-weight: 600;
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
}
.hz-table__max {
  color: var(--gold) !important;
  font-weight: 700;
  background: var(--gold-glow);
}
.hz-table tbody tr:hover { background: var(--surface-2); }

/* ── Responsivo ── */
@media (max-width: 640px) {
  .hero             { gap: 16px; }
  .hero__icon-wrap  { width: 96px; height: 96px; flex-shrink: 0; }
  .hero__initials   { font-size: 32px; }
  .hero__title      { font-size: 22px; }
  .hero__description { font-size: 13px; }

  /* Tabs scroll horizontal */
  .tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 1px;
    gap: 0;
  }
  .tabs::-webkit-scrollbar { display: none; }
  .tab { padding: 10px 14px; font-size: 11px; letter-spacing: 0.1em; white-space: nowrap; flex-shrink: 0; }

  /* Cards */
  .card { padding: 14px 14px; }
  .divider { margin: 20px 0; }

  /* Planner CTA */
  .hero__planner { flex-direction: column; align-items: flex-start; gap: 6px; }
  .planner-add-btn { width: 100%; justify-content: center; }
}
</style>
