<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useWeapons } from '@/composables/useWeapons'
import { useArmors }  from '@/composables/useArmors'
import { useUI }      from '@/composables/useUI'
import { WEAPON_TYPES, type Weapon, type WeaponType } from '@/types/weapon'
import ArmorSetCard from '@/components/equipment/ArmorSetCard.vue'
import type { ArmorSet } from '@/types/armor'
import WeaponTypeIcon    from '@/components/equipment/WeaponTypeIcon.vue'
import WeaponTree        from '@/components/equipment/WeaponTree.vue'
import EquipmentDetailModal from '@/components/equipment/EquipmentDetailModal.vue'
import PaginationControls from '@/components/PaginationControls.vue'
import SearchInput from '@/components/SearchInput.vue'
import ElementIcon from '@/components/ElementIcon.vue'

const { t } = useUI()

// ── Main tab ──────────────────────────────────────────────────────────────────
type MainTab = 'weapons' | 'armor'
const mainTab = ref<MainTab>('armor')

// ── Data ─────────────────────────────────────────────────────────────────────
const { data: weapons, isLoading: loadingWeapons } = useWeapons()
const { data: armorSets, isLoading: loadingArmor }  = useArmors()

// ── Weapon type tab ───────────────────────────────────────────────────────────
const activeType = ref<WeaponType>('great-sword')

const WEAPON_SHORT: Record<string, string> = {
  'great-sword': 'GS', 'long-sword': 'LS', 'sword-and-shield': 'SnS',
  'dual-blades': 'DB', 'hammer': 'HAM', 'hunting-horn': 'HH',
  'lance': 'LAN', 'gunlance': 'GL', 'switch-axe': 'SA',
  'charge-blade': 'CB', 'insect-glaive': 'IG', 'light-bowgun': 'LBG',
  'heavy-bowgun': 'HBG', 'bow': 'BOW',
}

// Label traduzido do tipo de arma (usa i18n, fallback EN)
function weaponLabel(type: string): string {
  return (t.value.weaponTypes as Record<string, string>)[type] ?? type
}

const ELEMENT_COLORS: Record<string, string> = {
  Fire:     'var(--el-fire)',     Water:    'var(--el-water)',
  Thunder:  'var(--el-thunder)',  Ice:      'var(--el-ice)',
  Dragon:   'var(--el-dragon)',   Poison:   'var(--el-poison)',
  Blast:    'var(--el-blast)',
}

// ── Armas agrupadas por tipo ──────────────────────────────────────────────────
const weaponsByType = computed(() => {
  const map = new Map<string, Weapon[]>()
  for (const w of weapons.value ?? []) {
    if (!map.has(w.weaponType)) map.set(w.weaponType, [])
    map.get(w.weaponType)!.push(w)
  }
  return map
})

const weaponsOfActiveType = computed(() =>
  weaponsByType.value.get(activeType.value) ?? [],
)

const rootWeapons = computed(() =>
  weaponsOfActiveType.value.filter(w => w.previousWeaponId === null),
)

// ── Busca ─────────────────────────────────────────────────────────────────────
const searchWeapon = ref('')

function treeContains(rootId: number, q: string): boolean {
  const stack = [rootId]
  const all = weaponsOfActiveType.value
  while (stack.length) {
    const id = stack.pop()!
    const w = all.find(x => x.id === id)
    if (!w) continue
    if (w.name.toLowerCase().includes(q)) return true
    all.filter(x => x.previousWeaponId === id).forEach(c => stack.push(c.id))
  }
  return false
}

const filteredRoots = computed(() => {
  const q = searchWeapon.value.toLowerCase().trim()
  if (!q) return rootWeapons.value
  return rootWeapons.value.filter(r => treeContains(r.id, q))
})

// ── Acordeão — qual linha está aberta ────────────────────────────────────────
const openLineId = ref<number | null>(null)

function toggleLine(id: number) {
  openLineId.value = openLineId.value === id ? null : id
}

// Ao trocar de tipo, fecha o acordeão aberto e reseta página
function switchType(type: WeaponType) {
  activeType.value = type
  openLineId.value = null
  searchWeapon.value = ''
  weaponPage.value = 1
}

// ── Paginação das linhas de arma ──────────────────────────────────────────────
const WEAPONS_PER_PAGE = 20
const weaponPage  = ref(1)
const weaponTotalPages = computed(() => Math.ceil(filteredRoots.value.length / WEAPONS_PER_PAGE))

const paginatedRoots = computed(() => {
  const start = (weaponPage.value - 1) * WEAPONS_PER_PAGE
  return filteredRoots.value.slice(start, start + WEAPONS_PER_PAGE)
})

// Reseta página ao filtrar
watch(filteredRoots, () => { weaponPage.value = 1 })

function goToWeaponPage(p: number) {
  weaponPage.value = Math.max(1, Math.min(p, weaponTotalPages.value))
  openLineId.value = null
}

// ── Helpers de rarity ─────────────────────────────────────────────────────────
function rarityColor(r: number): string {
  if (r <= 4) return '#6abf6a'
  if (r <= 8) return '#e0a040'
  return '#c060c0'
}

// Rarity máxima da linha (para o badge)
function maxRarity(rootId: number): number {
  const all = weaponsOfActiveType.value
  let max = 0
  const stack = [rootId]
  while (stack.length) {
    const id = stack.pop()!
    const w = all.find(x => x.id === id)
    if (!w) continue
    if (w.rarity > max) max = w.rarity
    all.filter(x => x.previousWeaponId === id).forEach(c => stack.push(c.id))
  }
  return max
}

// Elemento principal da linha
function lineElement(rootId: number): { name: string; hidden: boolean } | null {
  const all = weaponsOfActiveType.value
  const collected: Weapon[] = []
  const stack = [rootId]
  while (stack.length) {
    const id = stack.pop()!
    const w = all.find(x => x.id === id)
    if (w) { collected.push(w); all.filter(x => x.previousWeaponId === id).forEach(c => stack.push(c.id)) }
  }
  const top = collected.sort((a, b) => b.rarity - a.rarity)[0]
  return top?.element1 ? { name: top.element1, hidden: top.elementHidden } : null
}

// ── Filtros armadura ──────────────────────────────────────────────────────────
const searchArmor    = ref('')
const armorRankTab   = ref<'LR' | 'HR' | 'MR'>('LR')
const armorElemFilter = ref('')
const RANKS = ['LR', 'HR', 'MR'] as const
const ELEM_KEYS = ['fire', 'water', 'thunder', 'ice', 'dragon'] as const
const ELEM_LABELS: Record<string, string> = {
  fire: 'Fogo', water: 'Água', thunder: 'Trovão', ice: 'Gelo', dragon: 'Dragão',
}

function setResistance(set: import('@/types/armor').ArmorSet, elem: string): number {
  const key = elem as 'fire' | 'water' | 'thunder' | 'ice' | 'dragon'
  return set.pieces.reduce((sum, p) => sum + (p[key] ?? 0), 0)
}

const filteredArmor = computed(() => {
  const q = searchArmor.value.toLowerCase()
  let list = (armorSets.value ?? []).filter(s => {
    if (s.rank !== armorRankTab.value) return false
    return !q || s.name.toLowerCase().includes(q)
  })
  if (armorElemFilter.value) {
    const elem = armorElemFilter.value
    list = [...list].sort((a, b) => setResistance(b, elem) - setResistance(a, elem))
  }
  return list
})

// ── Paginação de armaduras ────────────────────────────────────────────────────
const ARMOR_PER_PAGE = 9
const armorPage = ref(1)
const armorTotalPages = computed(() => Math.ceil(filteredArmor.value.length / ARMOR_PER_PAGE))

const paginatedArmor = computed(() => {
  const start = (armorPage.value - 1) * ARMOR_PER_PAGE
  return filteredArmor.value.slice(start, start + ARMOR_PER_PAGE)
})

watch(filteredArmor, () => { armorPage.value = 1 })

function goToArmorPage(p: number) {
  armorPage.value = Math.max(1, Math.min(p, armorTotalPages.value))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ── Modais ────────────────────────────────────────────────────────────────────
const armorModal  = ref<ArmorSet | null>(null)
const weaponModal = ref<import('@/types/weapon').Weapon | null>(null)
</script>

<template>
  <div class="eq-page">

    <!-- ── Header ── -->
    <header class="eq-header">
      <div>
        <p class="eq-header__label">FORJA</p>
        <h1 class="eq-header__title">Armas &amp; Armaduras</h1>
      </div>
      <div class="eq-main-tabs">
        <button class="eq-main-tab" :class="{ 'eq-main-tab--active': mainTab === 'armor' }" @click="mainTab = 'armor'">
          Armaduras
        </button>
        <button class="eq-main-tab" :class="{ 'eq-main-tab--active': mainTab === 'weapons' }" @click="mainTab = 'weapons'">
          Armas
        </button>
      </div>
    </header>

    <!-- ══════════════════════════ ARMAS ═══════════════════════════════════ -->
    <template v-if="mainTab === 'weapons'">

      <!-- Tabs de tipo com SVG icons oficiais -->
      <div class="type-tabs-scroll">
        <div class="type-tabs">
          <button
            v-for="t in WEAPON_TYPES"
            :key="t"
            class="type-tab"
            :class="{ 'type-tab--active': activeType === t }"
            @click="switchType(t)"
          >
            <WeaponTypeIcon :type="t" :size="28" :rank="activeType === t ? 6 : 4" />
            <span class="type-tab__label">{{ WEAPON_SHORT[t] }}</span>
          </button>
        </div>
      </div>

      <!-- Sub-header -->
      <div class="type-header">
        <div class="type-header__left">
          <WeaponTypeIcon :type="activeType" :size="32" :rank="8" />
          <h2 class="type-header__name">{{ weaponLabel(activeType) }}</h2>
          <span class="type-header__count">{{ filteredRoots.length }} linhas</span>
        </div>
        <SearchInput v-model="searchWeapon" placeholder="Buscar arma..." />
      </div>

      <!-- Loading -->
      <div v-if="loadingWeapons" class="skeleton-list">
        <div v-for="i in 8" :key="i" class="skeleton-row" />
      </div>

      <div v-else-if="filteredRoots.length === 0" class="eq-empty">Nenhuma linha encontrada.</div>

      <!-- Acordeão de linhas de arma -->
      <div v-else class="accordion">
        <div
          v-for="root in paginatedRoots"
          :key="root.id"
          class="accordion-item"
          :class="[
            { 'accordion-item--open': openLineId === root.id },
            maxRarity(root.id) <= 4 ? 'accordion-item--lr' :
            maxRarity(root.id) <= 8 ? 'accordion-item--hr' : 'accordion-item--mr',
          ]"
        >
          <!-- Cabeçalho clicável -->
          <button class="accordion-header" @click="toggleLine(root.id)">
            <WeaponTypeIcon
              :type="activeType"
              :size="24"
              :rank="maxRarity(root.id)"
            />

            <span class="acc-name">{{ root.name }}</span>

            <ElementIcon
              v-if="lineElement(root.id)"
              :element="lineElement(root.id)!.name"
              :hidden="lineElement(root.id)!.hidden"
              :size="14"
            />

            <span class="acc-spacer" />

            <span class="acc-rarity" :style="{ color: rarityColor(maxRarity(root.id)) }">
              R{{ maxRarity(root.id) }}
            </span>

            <span class="acc-chevron" :class="{ 'acc-chevron--open': openLineId === root.id }">›</span>
          </button>

          <!-- Corpo — árvore de upgrades -->
          <Transition name="accordion">
            <div v-if="openLineId === root.id" class="accordion-body">
              <WeaponTree
                :root="root"
                :all="weaponsOfActiveType"
                @open-modal="w => { weaponModal = w }"
              />
            </div>
          </Transition>
        </div>
      </div>

      <!-- Paginação de linhas de arma -->
      <PaginationControls :current-page="weaponPage" :total-pages="weaponTotalPages" @go-to="goToWeaponPage" />

      <!-- Modal de detalhe da arma -->
      <EquipmentDetailModal
        v-if="weaponModal"
        :weapon="weaponModal"
        :armor="null"
        @close="weaponModal = null"
      />

    </template>

    <!-- ══════════════════════════ ARMADURAS ════════════════════════════════ -->
    <template v-else>

      <!-- Tabs LR / HR / MR -->
      <div class="armor-rank-tabs">
        <button
          v-for="r in RANKS"
          :key="r"
          class="armor-rank-tab"
          :class="[`armor-rank-tab--${r.toLowerCase()}`, { 'armor-rank-tab--active': armorRankTab === r }]"
          @click="armorRankTab = r; searchArmor = ''; armorElemFilter = ''; armorPage = 1"
        >{{ r }}</button>
      </div>

      <div class="armor-toolbar">
        <SearchInput v-model="searchArmor" :placeholder="`Buscar set ${armorRankTab}...`" />
        <select
          v-model="armorElemFilter"
          class="armor-elem-select"
          @change="armorPage = 1"
        >
          <option value="">Todos elementos</option>
          <option v-for="e in ELEM_KEYS" :key="e" :value="e">↑ {{ ELEM_LABELS[e] }}</option>
        </select>
        <span class="armor-count">{{ filteredArmor.length }} sets</span>
      </div>

      <!-- Skeletons -->
      <div v-if="loadingArmor" class="armor-grid-skeleton">
        <div v-for="i in 12" :key="i" class="armor-card-skeleton" />
      </div>
      <div v-else-if="filteredArmor.length === 0" class="eq-empty">Nenhum set encontrado.</div>

      <!-- Grid de cards com foto -->
      <div v-else class="armor-grid">
        <button
          v-for="set in paginatedArmor"
          :key="set.id"
          class="armor-card"
          :class="`armor-card--${set.rank.toLowerCase()}`"
          @click="armorModal = set"
        >
          <!-- Foto do set com fallback em grade de peças -->
          <ArmorSetCard :set="set" />

          <!-- Info -->
          <div class="armor-card__body">
            <!-- Nome + Raridade -->
            <div class="armor-card__header">
              <p class="armor-card__name">{{ set.name }}</p>
              <span class="armor-card__rarity" :class="`armor-card__rarity--r${Math.min(set.pieces[0]?.rarity ?? 1, 12)}`">
                R{{ set.pieces[0]?.rarity ?? '?' }}
              </span>
            </div>

            <!-- Grid: Defesa (esq) | Decoração + Slots (dir) -->
            <div class="armor-card__row">
              <!-- Célula esquerda: defesa -->
              <div class="armor-card__def-cell">
                <img src="/icons/armor/defense.png" class="acard-icon" alt="def" />
                <span class="armor-card__def-val">{{ set.pieces.reduce((s, p) => s + (p.defenseBase ?? 0), 0) }}</span>
                <span v-if="set.bonus" class="armor-card__bonus">★</span>
              </div>
              <!-- Célula direita: slots -->
              <div class="armor-card__slots-cell">
                <img src="/icons/armor/decoration.png" class="acard-icon" alt="deco" />
                <span class="armor-card__slots">
                  <template v-for="lvl in [4,3,2,1]" :key="lvl">
                    <template v-if="set.pieces.flatMap(p=>[p.slot1,p.slot2,p.slot3]).filter(s=>s===lvl).length > 0">
                      <img :src="`/icons/armor/slot${lvl}.png`" class="slot-icon" :alt="`lv${lvl}`" />
                      <span class="slot-count">×{{ set.pieces.flatMap(p=>[p.slot1,p.slot2,p.slot3]).filter(s=>s===lvl).length }}</span>
                    </template>
                  </template>
                  <span v-if="set.pieces.flatMap(p=>[p.slot1,p.slot2,p.slot3]).every(s=>!s)" class="slot-none">—</span>
                </span>
              </div>
            </div>

            <!-- Grid de 5 colunas: elementos -->
            <div class="armor-card__elems">
              <div v-for="[icon, key] in [['fire','fire'],['water','water'],['thunder','thunder'],['ice','ice'],['dragon','dragon']]"
                   :key="key" class="armor-card__elem-cell">
                <img :src="`/icons/armor/${icon}.png`" class="acard-icon acard-icon--elem" :alt="key" />
                <span class="elem-val"
                  :class="{
                    'elem-val--pos': set.pieces.reduce((s,p)=>s+(p[key as 'fire']??0),0) > 0,
                    'elem-val--neg': set.pieces.reduce((s,p)=>s+(p[key as 'fire']??0),0) < 0
                  }">
                  {{ set.pieces.reduce((s, p) => s + (p[key as 'fire'] ?? 0), 0) }}
                </span>
              </div>
            </div>

          </div>
        </button>
      </div>

      <!-- Paginação de armaduras -->
      <PaginationControls :current-page="armorPage" :total-pages="armorTotalPages" @go-to="goToArmorPage" />

      <EquipmentDetailModal
        v-if="armorModal"
        :weapon="null"
        :armor="armorModal"
        @close="armorModal = null"
      />
    </template>

  </div>
</template>

<style scoped>
.eq-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 64px;
}

/* ── Header ── */
.eq-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.eq-header__label {
  font-family: var(--font-heading);
  font-size: 11px;
  letter-spacing: .15em;
  color: var(--text-muted);
  margin: 0 0 4px;
}

.eq-header__title {
  font-family: var(--font-heading);
  font-size: 28px;
  color: var(--gold);
  margin: 0;
}

.eq-main-tabs {
  display: flex;
  gap: 4px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px;
}

.eq-main-tab {
  font-family: var(--font-heading);
  font-size: 12px;
  letter-spacing: .06em;
  padding: 6px 22px;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: color .15s, background .15s;
}

.eq-main-tab--active { background: var(--gold-glow); color: var(--gold); }

/* ── Weapon type tabs ── */
.type-tabs-scroll {
  overflow-x: auto;
  scrollbar-width: none;
  margin-bottom: 0;
}
.type-tabs-scroll::-webkit-scrollbar { display: none; }

.type-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  min-width: max-content;
}

.type-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 14px 8px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  margin-bottom: -1px;
  transition: border-color .15s;
}

.type-tab--active { border-bottom-color: var(--gold); }
.type-tab__label {
  font-family: var(--font-heading);
  font-size: 9px;
  letter-spacing: .1em;
  color: var(--text-muted);
}
.type-tab--active .type-tab__label { color: var(--gold); }

/* ── Type header ── */
.type-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 0 12px;
  gap: 16px;
  flex-wrap: wrap;
}

.type-header__left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.type-header__name {
  font-family: var(--font-heading);
  font-size: 18px;
  color: var(--text);
  margin: 0;
}

.type-header__count {
  font-size: 11px;
  color: var(--text-muted);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px 8px;
}

/* ── Search ── */
.eq-search {
  position: relative;
  min-width: 200px;
}

.eq-search__icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-size: 16px;
  pointer-events: none;
}

.eq-search__input {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-size: 13px;
  padding: 7px 12px 7px 32px;
  transition: border-color .2s;
}

.eq-search__input:focus { outline: none; border-color: var(--gold); }

/* ── Acordeão ── */
.accordion {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.accordion-item {
  border-bottom: 1px solid var(--border);
  border-left: 3px solid transparent;
  transition: border-left-color .15s;
}

.accordion-item:last-child { border-bottom: none; }

/* Faixa colorida por rank */
.accordion-item--lr { border-left-color: #6abf6a40; }
.accordion-item--hr { border-left-color: #e0a04040; }
.accordion-item--mr { border-left-color: #c060c040; }

.accordion-item--lr.accordion-item--open { border-left-color: #6abf6a; }
.accordion-item--hr.accordion-item--open { border-left-color: #e0a040; }
.accordion-item--mr.accordion-item--open { border-left-color: #c060c0; }

.accordion-item--lr:hover { border-left-color: #6abf6a99; }
.accordion-item--hr:hover { border-left-color: #e0a04099; }
.accordion-item--mr:hover { border-left-color: #c060c099; }

/* Cabeçalho */
.accordion-header {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 16px;
  background: var(--surface);
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background .15s;
}

.accordion-item--open > .accordion-header,
.accordion-header:hover {
  background: var(--surface-2);
}

.acc-name {
  font-family: var(--font-heading);
  font-size: 13px;
  color: var(--text);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.acc-element   { font-size: 12px; flex-shrink: 0; }
.acc-hidden    { opacity: .6; font-size: 10px; }
.acc-spacer    { flex: 1; }
.acc-rarity    { font-family: var(--font-heading); font-size: 11px; font-weight: 700; flex-shrink: 0; }

.acc-chevron {
  color: var(--text-dim);
  font-size: 18px;
  transition: transform .2s;
  flex-shrink: 0;
}

.acc-chevron--open { transform: rotate(90deg); }

/* Corpo do acordeão */
.accordion-body {
  border-top: 1px solid var(--border);
  background: var(--surface-2);
  overflow: hidden;
}

/* Transição do acordeão */
.accordion-enter-active,
.accordion-leave-active {
  transition: max-height .25s ease, opacity .2s;
  max-height: 2000px;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

/* ── Armor rank tabs ── */
.armor-rank-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: 0;
}

.armor-rank-tab {
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: .1em;
  padding: 12px 32px;
  border: none;
  border-bottom: 3px solid transparent;
  background: none;
  cursor: pointer;
  margin-bottom: -1px;
  transition: color .15s, border-color .15s;
  color: var(--text-muted);
}

.armor-rank-tab--lr.armor-rank-tab--active { color: #6abf6a; border-bottom-color: #6abf6a; }
.armor-rank-tab--hr.armor-rank-tab--active { color: #e0a040; border-bottom-color: #e0a040; }
.armor-rank-tab--mr.armor-rank-tab--active { color: #c060c0; border-bottom-color: #c060c0; }

.armor-rank-tab--lr:hover { color: #6abf6a; }
.armor-rank-tab--hr:hover { color: #e0a040; }
.armor-rank-tab--mr:hover { color: #c060c0; }

/* ── Armor grid de cards ── */
.armor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.armor-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  text-align: left;
  transition: border-color .2s, transform .15s, box-shadow .2s;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.armor-card:hover {
  border-color: var(--gold);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,.4);
}

.armor-card__body {
  padding: 10px 14px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px solid var(--border);
}

.armor-card__name {
  font-family: var(--font-heading);
  font-size: 14px;
  color: var(--text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Header: nome + raridade ── */
.armor-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.armor-card__rarity {
  font-family: var(--font-heading);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 1px 4px;
  border-radius: 3px;
  flex-shrink: 0;
  color: var(--text-dim);
  border: 1px solid var(--border);
}
.armor-card__rarity--r1,
.armor-card__rarity--r2  { color: #aaa; border-color: #555; }
.armor-card__rarity--r3,
.armor-card__rarity--r4  { color: #78c878; border-color: #3a6a3a; }
.armor-card__rarity--r5,
.armor-card__rarity--r6  { color: #6ab4e8; border-color: #2a5a80; }
.armor-card__rarity--r7,
.armor-card__rarity--r8  { color: #c878e0; border-color: #6a3a80; }
.armor-card__rarity--r9,
.armor-card__rarity--r10 { color: #e0a840; border-color: #806020; }
.armor-card__rarity--r11,
.armor-card__rarity--r12 { color: #e06040; border-color: #802820; }

/* ── Grid de stats: defesa | slots ── */
.armor-card__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  align-items: center;
  background: var(--surface-2);
  border-radius: 6px;
  padding: 6px 10px;
}

/* Célula esquerda: defesa */
.armor-card__def-cell {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Célula direita: slots */
.armor-card__slots-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.acard-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  flex-shrink: 0;
}
.acard-icon--elem { width: 16px; height: 16px; }

.armor-card__def-val {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.armor-card__slots {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-wrap: wrap;
}

.slot-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.slot-count {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  margin-right: 3px;
}

.slot-none {
  font-size: 12px;
  color: var(--text-dim);
}

.armor-card__bonus {
  font-size: 12px;
  color: var(--gold);
  font-weight: 700;
}

/* ── Grid de elementos: 5 colunas ── */
.armor-card__elems {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  background: var(--surface-2);
  border-radius: 6px;
  overflow: hidden;
}

.armor-card__elem-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 4px;
  border-right: 1px solid var(--border);
}
.armor-card__elem-cell:last-child { border-right: none; }

.elem-val {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-dim);
}
.elem-val--pos { color: #78c878; }
.elem-val--neg { color: #e06060; }

/* Skeletons para o grid */
.armor-grid-skeleton {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.armor-card-skeleton {
  aspect-ratio: 4/5;
  background: var(--surface);
  border-radius: 8px;
  animation: pulse 1.4s ease-in-out infinite;
}

/* ── Armor list (toolbar) ── */
.armor-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 0 12px;
}

.rank-pills { display: flex; gap: 4px; }

.rank-pill {
  font-family: var(--font-heading);
  font-size: 11px;
  padding: 5px 12px;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  cursor: pointer;
  transition: color .15s, border-color .15s, background .15s;
}

.rank-pill--active { border-color: var(--gold); color: var(--gold); background: var(--gold-glow); }
.armor-count { font-size: 12px; color: var(--text-muted); margin-left: auto; }

.armor-elem-select {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-size: 12px;
  font-family: var(--font-heading);
  padding: 7px 10px;
  cursor: pointer;
  transition: border-color .2s;
  flex-shrink: 0;
}
.armor-elem-select:focus { outline: none; border-color: var(--gold); }

.armor-list {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}

.armor-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 11px 16px;
  background: var(--surface);
  border: none;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  text-align: left;
  transition: background .15s;
}

.armor-row:last-child { border-bottom: none; }
.armor-row:hover { background: var(--surface-2); }

.armor-row__rank {
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 3px;
  flex-shrink: 0;
}

.armor-rank--lr { background: #2a3a2a; color: #6abf6a; }
.armor-rank--hr { background: #3a2a1a; color: #e0a040; }
.armor-rank--mr { background: #2a1a2a; color: #c060c0; }

.armor-row__body { flex: 1; min-width: 0; }

.armor-row__name {
  font-family: var(--font-heading);
  font-size: 13px;
  color: var(--text);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.armor-row__meta  { font-size: 11px; color: var(--text-muted); }
.armor-row__bonus { color: var(--gold); }
.armor-row__arrow { color: var(--text-dim); font-size: 18px; transition: color .15s, transform .15s; flex-shrink: 0; }
.armor-row:hover .armor-row__arrow { color: var(--gold); transform: translateX(2px); }

/* ── Skeleton ── */
.skeleton-list { display: flex; flex-direction: column; gap: 2px; }
.skeleton-row {
  height: 46px;
  background: var(--surface);
  border-radius: 6px;
  animation: pulse 1.4s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }

.eq-empty { color: var(--text-muted); font-size: 14px; text-align: center; padding: 64px; }

/* ── Paginação de armas ── */
.weapon-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.pagination__btn {
  min-width: 38px;
  height: 38px;
  padding: 0 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 13px;
  font-family: var(--font-heading);
  cursor: pointer;
  transition: color .15s, border-color .15s, background .15s;
}

.pagination__btn:hover:not(:disabled) { color: var(--text); border-color: var(--gold); }
.pagination__btn:disabled             { opacity: .35; cursor: not-allowed; }
.pagination__btn--active              { color: var(--gold); border-color: var(--gold); background: var(--gold-glow); }

.pagination__ellipsis {
  color: var(--text-muted);
  padding: 0 4px;
  font-size: 14px;
  align-self: flex-end;
}

/* ── Responsivo ── */
@media (max-width: 768px) {
  .eq-page { padding: 20px 16px 60px; }

  /* Header empilha */
  .eq-header { flex-direction: column; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
  .eq-header__title { font-size: 22px; }
  .eq-main-tabs { width: 100%; }
  .eq-main-tab { flex: 1; text-align: center; }

  /* Type tabs menores */
  .type-tab { padding: 8px 10px; }
  .type-tab__label { font-size: 8px; }

  /* Sub-header */
  .type-header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .eq-search { min-width: 0; width: 100%; }

  /* Accordion header */
  .accordion-header { padding: 10px 12px; gap: 8px; }

  /* Armor rank tabs */
  .armor-rank-tab { padding: 10px 20px; flex: 1; text-align: center; }

  /* Armor toolbar */
  .armor-toolbar { gap: 10px; }
  .armor-toolbar .eq-search { min-width: 0; flex: 1; }

  /* Armor grid menor em mobile */
  .armor-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; }
  .armor-grid-skeleton { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 10px; }
  .armor-card__name { font-size: 13px; }
}

@media (max-width: 480px) {
  .armor-grid { grid-template-columns: 1fr; }
  .armor-grid-skeleton { grid-template-columns: 1fr; }
}
</style>
