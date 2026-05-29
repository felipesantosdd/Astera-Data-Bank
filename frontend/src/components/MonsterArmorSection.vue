<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { useMonsterArmor } from '@/composables/useMonsterArmor'
import { useUI } from '@/composables/useUI'
import { useItems } from '@/composables/useItems'
import ItemSourcesModal from '@/components/ItemSourcesModal.vue'
import EquipmentDetailModal from '@/components/equipment/EquipmentDetailModal.vue'
import SkillTooltip from '@/components/SkillTooltip.vue'
import InfoTooltip from '@/components/InfoTooltip.vue'
import SkillBadgeList from '@/components/SkillBadgeList.vue'
import MaterialChipList from '@/components/MaterialChipList.vue'
import type { ArmorSet, ArmorPiece, ArmorMaterial } from '@/types/armor'
import { armorPieceImageUrl, armorSlotIcon } from '@/utils/armorImageUrl'

const props = defineProps<{ monsterId: number }>()
const monsterIdRef = toRef(props, 'monsterId')

const { data: sets, isLoading, isError } = useMonsterArmor(monsterIdRef)
const { t } = useUI()
const { data: items } = useItems()
const selectedArmorSet = ref<ArmorSet | null>(null)

const itemById = computed(() => {
  const map = new Map<number, { iconName: string | null; iconColor: string | null }>()
  for (const item of items.value ?? []) map.set(item.id, item)
  return map
})

function itemMeta(itemId: number) {
  return itemById.value.get(itemId)
}

// Agrupa sets por rank na ordem LR → HR → MR
const RANK_ORDER = ['LR', 'HR', 'MR'] as const
type Rank = typeof RANK_ORDER[number]

const groupedByRank = computed<Record<Rank, ArmorSet[]>>(() => {
  const result: Record<Rank, ArmorSet[]> = { LR: [], HR: [], MR: [] }
  for (const set of sets.value ?? []) {
    if (set.rank in result) result[set.rank as Rank].push(set)
  }
  return result
})

function rankLabel(rank: Rank): string {
  if (rank === 'LR') return t.value.armor.lowRank
  if (rank === 'HR') return t.value.armor.highRank
  return t.value.armor.masterRank
}

function rankBadge(rank: string): string {
  if (rank === 'LR') return t.value.armor.rankLR
  if (rank === 'HR') return t.value.armor.rankHR
  if (rank === 'MR') return t.value.armor.rankMR
  return rank
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    head:  t.value.armorTypes.head,
    chest: t.value.armorTypes.chest,
    arms:  t.value.armorTypes.arms,
    waist: t.value.armorTypes.waist,
    legs:  t.value.armorTypes.legs,
  }
  return map[type] ?? type
}

// Ordenação das peças dentro de um set (head, chest, arms, waist, legs)
const TYPE_ORDER: Record<string, number> = { head: 0, chest: 1, arms: 2, waist: 3, legs: 4 }
function sortedPieces(set: ArmorSet): ArmorPiece[] {
  return [...set.pieces].sort((a, b) =>
    (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99)
  )
}

function slotDots(p: ArmorPiece): number[] {
  return [p.slot1, p.slot2, p.slot3].map(s => s ?? 0)
}

// Modal de fontes do item (clicando num material)
const selectedItem = ref<{ id: number, name: string, quantity: number | null } | null>(null)
function openItemSources(m: ArmorMaterial) {
  selectedItem.value = { id: m.itemId, name: m.name, quantity: m.quantity }
}
function closeItemSources() {
  selectedItem.value = null
}

function openArmorDetails(set: ArmorSet) {
  selectedArmorSet.value = set
}

function closeArmorDetails() {
  selectedArmorSet.value = null
}

// Lista filtrada de resistências (só mostra as != 0)
function resistances(p: ArmorPiece): Array<{ key: string, value: number }> {
  const all = [
    { key: 'fire',    value: p.fire ?? 0 },
    { key: 'water',   value: p.water ?? 0 },
    { key: 'thunder', value: p.thunder ?? 0 },
    { key: 'ice',     value: p.ice ?? 0 },
    { key: 'dragon',  value: p.dragon ?? 0 },
  ]
  return all
}
</script>

<template>
  <section class="card card--full armor-section">
    <h2 class="card__title">{{ t.armor.section }}</h2>
    <p class="card__hint">{{ t.armor.sectionHint }}</p>

    <!-- Loading -->
    <div v-if="isLoading" class="armor-skel">
      <div v-for="i in 3" :key="i" class="armor-skel__row" />
    </div>

    <!-- Erro -->
    <div v-else-if="isError" class="state state--error">
      <p>⚠ {{ t.detail.backendHint }}</p>
    </div>

    <!-- Vazio -->
    <div v-else-if="!sets || sets.length === 0" class="state">
      <p class="state__hint">{{ t.armor.noArmor }}</p>
    </div>

    <!-- Conteúdo -->
    <template v-else>
      <div
        v-for="rank in RANK_ORDER"
        :key="rank"
        class="rank-group"
        v-show="groupedByRank[rank].length > 0"
      >
        <h3 class="rank-group__title">
          <span class="rank-pill" :class="`rank-pill--${rank.toLowerCase()}`">{{ rankBadge(rank) }}</span>
          {{ rankLabel(rank) }}
        </h3>

        <div v-for="set in groupedByRank[rank]" :key="set.id" class="armor-set">
          <div class="armor-set__header">
            <h4 class="armor-set__name">{{ set.name }}</h4>
          </div>

          <!-- Bônus do set -->
          <div v-if="set.bonus" class="bonus">
            <p class="bonus__label">⟡ {{ t.armor.setBonus }}: <strong>{{ set.bonus.name }}</strong></p>
            <p v-if="set.bonus.description" class="bonus__desc">{{ set.bonus.description }}</p>
            <ul v-if="set.bonus.skills.length > 0" class="bonus__skills">
              <li v-for="(s, i) in set.bonus.skills" :key="i">
                <span class="bonus__skill-req">{{ s.required }}</span>
                <span class="bonus__skill-label">{{ t.armor.requiredPieces }}</span>
                <SkillTooltip
                  :name="s.name"
                  :description="s.description"
                  :levels="s.levels"
                >
                  <span class="bonus__skill-name">→ {{ s.name }}</span>
                </SkillTooltip>
              </li>
            </ul>
          </div>

          <!-- Peças -->
          <div class="pieces">
            <article
              v-for="piece in sortedPieces(set)"
              :key="piece.id"
              class="piece"
              @click="openArmorDetails(set)"
            >
              <header class="piece__head">
                <div class="piece__image-wrap">
                  <img
                    :src="armorPieceImageUrl(piece.id)"
                    :alt="piece.name"
                    class="piece__image"
                    @error="(e) => ((e.target as HTMLImageElement).src = armorSlotIcon(piece.type))"
                  />
                </div>
                <div class="piece__head-copy">
                  <span class="piece__type">{{ typeLabel(piece.type) }}</span>
                  <span v-if="piece.rarity" class="piece__rarity">{{ t.armor.rarity }}{{ piece.rarity }}</span>
                </div>
              </header>

              <h5 class="piece__name">{{ piece.name }}</h5>

              <!-- Defesa: base / max / augmented (estágios de upgrade no MHW) -->
              <div class="piece__defense">
                <p class="piece__def-title">{{ t.armor.defense }}</p>
                <div class="piece__def-row">
                  <InfoTooltip
                    class="def-tip"
                    :title="t.armor.defenseBase"
                    :content="t.armor.defenseBaseTip"
                  >
                    <span class="def-stage">
                      <span class="def-stage__num">{{ piece.defenseBase ?? '—' }}</span>
                      <span class="def-stage__label">{{ t.armor.defenseBase }}</span>
                    </span>
                  </InfoTooltip>

                  <span class="def-stage__sep">/</span>

                  <InfoTooltip
                    class="def-tip"
                    :title="t.armor.defenseMax"
                    :content="t.armor.defenseMaxTip"
                  >
                    <span class="def-stage">
                      <span class="def-stage__num">{{ piece.defenseMax ?? '—' }}</span>
                      <span class="def-stage__label">{{ t.armor.defenseMax }}</span>
                    </span>
                  </InfoTooltip>

                  <template v-if="piece.defenseAugmentMax">
                    <span class="def-stage__sep">/</span>
                    <InfoTooltip
                      class="def-tip"
                      :title="t.armor.defenseAugment"
                      :content="t.armor.defenseAugmentTip"
                    >
                      <span class="def-stage">
                        <span class="def-stage__num def-stage__num--aug">{{ piece.defenseAugmentMax }}</span>
                        <span class="def-stage__label">{{ t.armor.defenseAugment }}</span>
                      </span>
                    </InfoTooltip>
                  </template>
                </div>
              </div>

              <!-- Resistências -->
              <div class="piece__res">
                <span
                  v-for="r in resistances(piece)"
                  :key="r.key"
                  class="res"
                  :class="[
                    `res--${r.key}`,
                    r.value > 0 ? 'res--pos' : r.value < 0 ? 'res--neg' : 'res--zero'
                  ]"
                >
                  <img :src="`/icons/ic_element_${r.key}.svg`" :alt="r.key" class="res__icon" />
                  <span class="res__val">{{ r.value > 0 ? `+${r.value}` : r.value }}</span>
                </span>
              </div>

              <!-- Slots -->
              <div class="piece__slots">
                <span class="piece__slots-label">{{ t.armor.slots }}:</span>
                <span
                  v-for="(lvl, i) in slotDots(piece)"
                  :key="i"
                  class="slot"
                  :class="lvl > 0 ? `slot--lvl${lvl}` : 'slot--empty'"
                >
                  {{ lvl > 0 ? lvl : '—' }}
                </span>
              </div>

              <!-- Skills -->
              <div v-if="piece.skills.length > 0" class="piece__skills">
                <p class="piece__sub">{{ t.armor.skills }}</p>
                <SkillBadgeList :skills="piece.skills" />
              </div>

              <!-- Materiais -->
              <div v-if="piece.materials.length > 0" class="piece__mats" @click.stop>
                <p class="piece__sub">{{ t.armor.materials }}</p>
                <MaterialChipList
                  size="sm"
                  :materials="piece.materials.map(m => ({ ...m, iconName: itemMeta(m.itemId)?.iconName, iconColor: itemMeta(m.itemId)?.iconColor }))"
                  @click="openItemSources"
                />
              </div>
            </article>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal de "onde encontrar" o material -->
    <ItemSourcesModal
      :item-id="selectedItem?.id ?? null"
      :item-name="selectedItem?.name ?? ''"
      :item-icon-name="selectedItem ? itemMeta(selectedItem.id)?.iconName ?? null : null"
      :item-icon-color="selectedItem ? itemMeta(selectedItem.id)?.iconColor ?? null : null"
      :planner-quantity="selectedItem?.quantity ?? 1"
      @close="closeItemSources"
    />

    <EquipmentDetailModal
      v-if="selectedArmorSet"
      :weapon="null"
      :armor="selectedArmorSet"
      @close="closeArmorDetails"
    />
  </section>
</template>

<style scoped>
.armor-section { margin-top: 16px; }

/* ── Skeletons ─────────────────────────────────────────────────────── */
.armor-skel { display: flex; flex-direction: column; gap: 12px; padding: 16px 0; }
.armor-skel__row {
  height: 120px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

/* ── Grupo por rank ────────────────────────────────────────────────── */
.rank-group { margin-top: 24px; }
.rank-group__title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-heading);
  font-size: 14px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text);
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

.rank-pill {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  border: 1px solid;
}
.rank-pill--lr { color: #8fb88f; border-color: #4a6e4a; background: rgba(74,110,74,0.15); }
.rank-pill--hr { color: var(--gold); border-color: var(--gold); background: var(--gold-glow); }
.rank-pill--mr { color: var(--el-fire); border-color: var(--el-fire); background: rgba(224,82,40,0.15); }

/* ── Set ───────────────────────────────────────────────────────────── */
.armor-set {
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px dashed var(--border);
}
.armor-set:last-child { border-bottom: none; }

.armor-set__header { margin-bottom: 12px; }
.armor-set__name {
  font-family: var(--font-heading);
  font-size: 16px;
  color: var(--gold);
  margin: 0;
  letter-spacing: 0.05em;
}

/* ── Bônus de set ──────────────────────────────────────────────────── */
.bonus {
  background: var(--surface-2);
  border-left: 3px solid var(--gold);
  padding: 10px 14px;
  border-radius: 0 6px 6px 0;
  margin-bottom: 12px;
}
.bonus__label {
  font-size: 13px;
  color: var(--text);
  margin: 0 0 4px;
}
.bonus__label strong { color: var(--gold); }
.bonus__desc {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0 0 6px;
  font-style: italic;
}
.bonus__skills {
  list-style: none;
  padding: 0;
  margin: 6px 0 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.bonus__skills li {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.bonus__skill-req {
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--gold);
  background: var(--gold-glow);
  padding: 1px 7px;
  border-radius: 3px;
  min-width: 18px;
  text-align: center;
}
.bonus__skill-label { color: var(--text-muted); font-size: 11px; }
.bonus__skill-name { color: var(--text); }

/* ── Grid de peças ─────────────────────────────────────────────────── */
.pieces {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
@media (min-width: 640px)  { .pieces { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 900px)  { .pieces { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1100px) { .pieces { grid-template-columns: repeat(5, 1fr); } }

/* ── Card de peça ──────────────────────────────────────────────────── */
.piece {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.2s;
  cursor: pointer;
}
.piece:hover { border-color: var(--gold); }

.piece__head {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-heading);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.piece__image-wrap {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}

.piece__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.piece__head-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}
.piece__type { color: var(--text-muted); }
.piece__rarity {
  color: var(--gold);
  background: var(--gold-glow);
  padding: 2px 6px;
  border-radius: 3px;
  letter-spacing: 0.05em;
}

.piece__name {
  font-family: var(--font-heading);
  font-size: 14px;
  color: var(--text);
  margin: 0;
  letter-spacing: 0.03em;
  min-height: 2.4em;
  line-height: 1.2;
}

.piece__defense {
  padding: 6px 8px;
  background: var(--surface);
  border-radius: 5px;
}
.piece__def-title {
  font-family: var(--font-heading);
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin: 0 0 4px;
}
.piece__def-row {
  display: flex;
  align-items: flex-end;
  gap: 6px;
}
/* O InfoTooltip vira o flex item; o def-stage interno mantém o layout vertical */
.piece__def-row .def-tip { flex: 1; min-width: 0; }
.def-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  min-width: 0;
}
.def-stage__num {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 16px;
  color: var(--text);
  line-height: 1;
}
.def-stage__num--aug { color: var(--gold); }
.def-stage__label {
  font-family: var(--font-heading);
  font-size: 8px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-dim);
}
.def-stage__sep {
  color: var(--text-dim);
  font-weight: 700;
  padding-bottom: 8px;
}

/* ── Resistências ──────────────────────────────────────────────────── */
.piece__res {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.res {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.res__icon { width: 11px; height: 11px; opacity: 0.8; }
.res--pos  { background: rgba(143,184,143,0.15); color: #8fb88f; }
.res--neg  { background: rgba(224,82,40,0.15);   color: var(--el-fire); }
.res--zero { color: var(--text-dim); }

/* ── Slots ─────────────────────────────────────────────────────────── */
.piece__slots {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}
.piece__slots-label {
  color: var(--text-muted);
  font-family: var(--font-heading);
  letter-spacing: 0.1em;
}
.slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 3px;
  font-weight: 700;
  font-size: 10px;
}
.slot--empty   { color: var(--text-dim); border: 1px dashed var(--border); }
.slot--lvl1 { background: rgba(196,154,42,0.2); color: var(--gold); border: 1px solid var(--gold); }
.slot--lvl2 { background: rgba(196,154,42,0.35); color: var(--gold-light); border: 1px solid var(--gold-light); }
.slot--lvl3 { background: rgba(196,154,42,0.5); color: #fff; border: 1px solid var(--gold-light); }
.slot--lvl4 { background: var(--gold); color: #000; border: 1px solid var(--gold-light); }

/* ── Skills ────────────────────────────────────────────────────────── */
.piece__sub {
  font-family: var(--font-heading);
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin: 0;
}
.piece__skills ul {
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.piece__skills li {
  font-size: 12px;
  color: var(--text);
}
.skill-dot { color: var(--gold); margin-right: 4px; }
.skill-lvl {
  font-family: var(--font-heading);
  font-size: 10px;
  color: var(--gold);
  margin-left: 4px;
}

/* ── Materiais (collapsible) ───────────────────────────────────────── */
.piece__mats {
  font-size: 12px;
  margin-top: auto;
}
.piece__mats summary {
  cursor: pointer;
  font-family: var(--font-heading);
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 4px 0;
  transition: color 0.2s;
}
.piece__mats summary:hover { color: var(--gold); }
.piece__mats ul {
  list-style: none;
  padding: 6px 0 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.piece__mats li { color: var(--text-muted); }
.mat-qty {
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--gold);
  margin-right: 4px;
}

/* Material clicável (abre modal de fontes) */
.mat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  margin: 0 -6px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.mat-item:hover {
  background: var(--gold-glow);
  color: var(--text);
}
.mat-name { flex: 1; }
.mat-arrow {
  color: var(--gold);
  opacity: 0;
  transition: opacity 0.15s, transform 0.15s;
  transform: translateX(-4px);
}
.mat-item:hover .mat-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* ── States (loading/error/empty herdam de MonsterDetailView) ──────── */
.state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
}
.state--error { color: var(--el-fire); }
.state__hint  { font-size: 13px; }

</style>
