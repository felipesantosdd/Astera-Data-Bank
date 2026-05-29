<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Weapon } from '@/types/weapon'
import type { ArmorSet } from '@/types/armor'
import { usePlannerStore } from '@/stores/plannerStore'
import { armorPieceImageUrl, armorSlotIcon } from '@/utils/armorImageUrl'
import { useItems } from '@/composables/useItems'
import ItemIcon from '@/components/ItemIcon.vue'
import ItemSourcesModal from '@/components/ItemSourcesModal.vue'
import SkillTooltip from '@/components/SkillTooltip.vue'

const props = defineProps<{
  weapon: Weapon | null
  armor:  ArmorSet | null
}>()

const emit = defineEmits<{ close: [] }>()

const plannerStore = usePlannerStore()
const { data: items } = useItems()
// plannerFeedback não é mais usado (feedback é por peça via pieceFeedback)

const isWeapon = computed(() => !!props.weapon)
const title    = computed(() => props.weapon?.name ?? props.armor?.name ?? '')

const WEAPON_TYPE_LABELS: Record<string, string> = {
  'great-sword':      'Great Sword',
  'sword-and-shield': 'Sword & Shield',
  'dual-blades':      'Dual Blades',
  'long-sword':       'Long Sword',
  'hammer':           'Hammer',
  'hunting-horn':     'Hunting Horn',
  'lance':            'Lance',
  'gunlance':         'Gunlance',
  'switch-axe':       'Switch Axe',
  'charge-blade':     'Charge Blade',
  'insect-glaive':    'Insect Glaive',
  'light-bowgun':     'Light Bowgun',
  'heavy-bowgun':     'Heavy Bowgun',
  'bow':              'Bow',
}

const ELEMENT_COLORS: Record<string, string> = {
  Fire: 'var(--el-fire)', Water: 'var(--el-water)', Thunder: 'var(--el-thunder)',
  Ice: 'var(--el-ice)', Dragon: 'var(--el-dragon)', Poison: 'var(--el-poison)',
  Blast: 'var(--el-blast)',
}

const selectedMaterial = ref<{ id: number; name: string; quantity: number | null } | null>(null)
const itemById = computed(() => {
  const map = new Map<number, { iconName: string | null; iconColor: string | null }>()
  for (const item of items.value ?? []) map.set(item.id, item)
  return map
})

function itemMeta(itemId: number) {
  return itemById.value.get(itemId)
}

function openMaterialSources(material: { itemId: number; name: string; quantity?: number | null }) {
  selectedMaterial.value = {
    id: material.itemId,
    name: material.name,
    quantity: material.quantity ?? 1,
  }
}

function closeMaterialSources() {
  selectedMaterial.value = null
}

function slotText(s1?: number | null, s2?: number | null, s3?: number | null): string {
  return [s1, s2, s3]
    .filter(s => s != null && s > 0)
    .map(s => `[${s}]`)
    .join(' ') || '—'
}

// ── Planner — por peça de armadura ───────────────────────────────────────────
const pieceFeedback = ref<Record<number, 'added' | 'exists'>>({})

function addPieceToPlanner(piece: import('@/types/armor').ArmorPiece) {
  const materials = piece.materials.map(m => ({
    id:               `mat-${m.itemId}-${piece.id}`,
    materialId:       m.itemId,
    name:             m.name,
    requiredQuantity: m.quantity ?? 0,
    ownedQuantity:    0,
    completed:        false,
  }))
  const added = plannerStore.addEquipmentNode({
    equipmentId:   piece.id,
    name:          piece.name,
    equipmentType: 'armor',
    subtype:       piece.type,
    rarity:        piece.rarity,
    materials,
  })
  pieceFeedback.value[piece.id] = added ? 'added' : 'exists'
  setTimeout(() => { delete pieceFeedback.value[piece.id] }, 2200)
}

function onOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click="onOverlayClick">
      <div class="modal">

        <!-- Header -->
        <div class="modal__header">
          <div class="modal__header-left">
            <span v-if="isWeapon" class="modal__type-badge">
              {{ WEAPON_TYPE_LABELS[weapon!.weaponType] ?? weapon!.weaponType }}
            </span>
            <span v-else class="modal__type-badge modal__type-badge--armor">
              Armadura {{ armor!.rank }}
            </span>
            <h2 class="modal__title">{{ title }}</h2>
          </div>
          <button class="modal__close" @click="emit('close')">✕</button>
        </div>

        <div class="modal__body">

          <!-- ── ARMA ── -->
          <template v-if="weapon">
            <div class="detail-grid">
              <div class="detail-stat">
                <span class="detail-stat__label">Ataque</span>
                <span class="detail-stat__val">{{ weapon.attack }}</span>
              </div>
              <div class="detail-stat">
                <span class="detail-stat__label">Afinidade</span>
                <span class="detail-stat__val" :class="{ 'val--pos': weapon.affinity > 0, 'val--neg': weapon.affinity < 0 }">
                  {{ weapon.affinity > 0 ? '+' : '' }}{{ weapon.affinity }}%
                </span>
              </div>
              <div v-if="weapon.defense" class="detail-stat">
                <span class="detail-stat__label">Defesa</span>
                <span class="detail-stat__val">+{{ weapon.defense }}</span>
              </div>
              <div class="detail-stat">
                <span class="detail-stat__label">Rarity</span>
                <span class="detail-stat__val">{{ weapon.rarity }}</span>
              </div>
              <div v-if="weapon.element1" class="detail-stat">
                <span class="detail-stat__label">Elemento</span>
                <span class="detail-stat__val" :style="{ color: ELEMENT_COLORS[weapon.element1] }">
                  {{ weapon.element1 }} {{ weapon.element1Attack }}
                  <span v-if="weapon.elementHidden" style="opacity:0.6"> (ocult)</span>
                </span>
              </div>
              <div v-if="weapon.elderseal" class="detail-stat">
                <span class="detail-stat__label">Elderseal</span>
                <span class="detail-stat__val">{{ weapon.elderseal }}</span>
              </div>
              <div class="detail-stat">
                <span class="detail-stat__label">Slots</span>
                <span class="detail-stat__val">{{ slotText(weapon.slot1, weapon.slot2, weapon.slot3) }}</span>
              </div>
              <div v-if="weapon.phial" class="detail-stat">
                <span class="detail-stat__label">Phial</span>
                <span class="detail-stat__val">{{ weapon.phial }}<span v-if="weapon.phialPower"> {{ weapon.phialPower }}</span></span>
              </div>
              <div v-if="weapon.shelling" class="detail-stat">
                <span class="detail-stat__label">Shelling</span>
                <span class="detail-stat__val">{{ weapon.shelling }} Lv{{ weapon.shellingLevel }}</span>
              </div>
            </div>

            <!-- Materiais de craft -->
            <section v-if="weapon.craftMaterials.length" class="materials-section">
              <h3 class="section-title">Materiais de Craft</h3>
              <div class="mat-chip-list">
                <button
                  v-for="m in weapon.craftMaterials"
                  :key="m.itemId"
                  class="mat-chip"
                  @click="openMaterialSources(m)"
                >
                  <ItemIcon :name="itemMeta(m.itemId)?.iconName ?? null" :color="itemMeta(m.itemId)?.iconColor ?? null" :size="24" />
                  <span class="mat-name">{{ m.name }}</span>
                  <span class="mat-qty">×{{ m.quantity }}</span>
                </button>
              </div>
            </section>
          </template>

          <!-- ── ARMADURA ── -->
          <template v-else-if="armor">
            <div v-if="armor.bonus" class="set-bonus">
              <h3 class="section-title">Bônus de Set — {{ armor.bonus.name }}</h3>
              <ul class="bonus-list">
                <li v-for="s in armor.bonus.skills" :key="s.name" class="bonus-item">
                  <span class="bonus-req">({{ s.required }} peças)</span>
                  <span class="bonus-name">{{ s.name }}</span>
                </li>
              </ul>
            </div>

            <div v-for="piece in armor.pieces" :key="piece.id" class="armor-piece">
              <div class="piece-header">
                <!-- Foto da peça com fallback para ícone de slot -->
                <div class="piece-img-wrap">
                  <img
                    :src="armorPieceImageUrl(piece.id)"
                    :alt="piece.name"
                    class="piece-img"
                    @error="(e) => ((e.target as HTMLImageElement).src = armorSlotIcon(piece.type))"
                  />
                </div>
                <div class="piece-header-info">
                  <span class="piece-type">{{ piece.type }}</span>
                  <span class="piece-name">{{ piece.name }}</span>
                  <div class="piece-meta">
                    <span class="piece-def">🛡 {{ piece.defenseBase }}~{{ piece.defenseMax }}</span>
                    <span class="piece-slots">{{ slotText(piece.slot1, piece.slot2, piece.slot3) }}</span>
                  </div>
                </div>
              </div>

              <div v-if="piece.skills.length" class="piece-skills">
                <SkillTooltip
                  v-for="sk in piece.skills"
                  :key="`${piece.id}-${sk.name}`"
                  :name="sk.name"
                  :description="sk.description"
                  :current-level="sk.level"
                  :levels="sk.levels"
                >
                  <span class="skill-badge">
                    {{ sk.name }}<span v-if="sk.level"> Lv{{ sk.level }}</span>
                  </span>
                </SkillTooltip>
              </div>

              <div v-if="piece.materials.length" class="mat-chip-list mat-chip-list--sm">
                <button
                  v-for="m in piece.materials"
                  :key="m.itemId"
                  class="mat-chip"
                  @click="openMaterialSources(m)"
                >
                  <ItemIcon :name="itemMeta(m.itemId)?.iconName ?? null" :color="itemMeta(m.itemId)?.iconColor ?? null" :size="22" />
                  <span class="mat-name">{{ m.name }}</span>
                  <span class="mat-qty">×{{ m.quantity }}</span>
                </button>
              </div>

              <!-- Botão por peça -->
              <div class="piece-planner">
                <button
                  class="piece-planner__btn"
                  :disabled="!piece.materials.length"
                  @click="addPieceToPlanner(piece)"
                >＋ Planner</button>
                <Transition name="fade">
                  <span
                    v-if="pieceFeedback[piece.id]"
                    class="piece-planner__feedback"
                    :class="{ 'piece-planner__feedback--exists': pieceFeedback[piece.id] === 'exists' }"
                  >{{ pieceFeedback[piece.id] === 'added' ? '✓' : '⚠' }}</span>
                </Transition>
              </div>
            </div>
          </template>

        </div>

        <!-- Footer -->
        <div class="modal__footer">
          <span v-if="armor" class="modal__footer-hint">
            Use "＋ Planner" em cada peça para adicionar individualmente.
          </span>
          <button class="modal__footer-close" @click="emit('close')">Fechar</button>
        </div>

      </div>
    </div>

    <ItemSourcesModal
      :item-id="selectedMaterial?.id ?? null"
      :item-name="selectedMaterial?.name ?? ''"
      :item-icon-name="selectedMaterial ? itemMeta(selectedMaterial.id)?.iconName ?? null : null"
      :item-icon-color="selectedMaterial ? itemMeta(selectedMaterial.id)?.iconColor ?? null : null"
      :planner-quantity="selectedMaterial?.quantity ?? 1"
      @close="closeMaterialSources"
    />
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  width: 100%;
  max-width: 640px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ── */
.modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
  gap: 12px;
  flex-shrink: 0;
}

.modal__header-left { display: flex; flex-direction: column; gap: 4px; }

.modal__type-badge {
  font-family: var(--font-heading);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gold);
  background: var(--gold-glow);
  border: 1px solid var(--gold);
  border-radius: 4px;
  padding: 2px 8px;
  width: fit-content;
}

.modal__type-badge--armor {
  color: #c060c0;
  background: #c060c020;
  border-color: #c060c0;
}

.modal__title {
  font-family: var(--font-heading);
  font-size: 20px;
  color: var(--text);
  margin: 0;
}

.modal__close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  flex-shrink: 0;
  transition: color 0.15s;
}
.modal__close:hover { color: var(--text); }

/* ── Body ── */
.modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Stat grid ── */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 10px;
}

.detail-stat {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-stat__label {
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-heading);
  letter-spacing: 0.08em;
}

.detail-stat__val {
  font-size: 15px;
  color: var(--text);
  font-family: var(--font-heading);
}

.val--pos { color: #6abf6a; }
.val--neg { color: #e74c3c; }

/* ── Materials ── */
.section-title {
  font-family: var(--font-heading);
  font-size: 12px;
  letter-spacing: 0.1em;
  color: var(--gold);
  margin: 0 0 10px;
}

.mat-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mat-list--sm .mat-item { font-size: 11px; }

.mat-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text);
  background: var(--surface-2);
  border-radius: 4px;
  padding: 4px 10px;
}

.mat-qty { color: var(--gold); font-family: var(--font-heading); }

.mat-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mat-chip-list--sm {
  gap: 6px;
}

.mat-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  max-width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  padding: 5px 8px 5px 6px;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.mat-chip:hover {
  color: var(--gold-light);
  border-color: var(--gold);
  background: var(--gold-glow);
}

.mat-chip .mat-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Armor pieces ── */
.armor-piece {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  background: var(--surface-2);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.piece-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Foto da peça */
.piece-img-wrap {
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.piece-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.piece-header-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.piece-type {
  font-size: 10px;
  font-family: var(--font-heading);
  letter-spacing: 0.1em;
  color: var(--text-muted);
  text-transform: uppercase;
}

.piece-name {
  font-family: var(--font-heading);
  font-size: 14px;
  color: var(--text);
}

.piece-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.piece-def   { font-size: 11px; color: var(--text-muted); }
.piece-slots { font-size: 11px; color: var(--gold); }

.piece-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.skill-badge {
  font-size: 11px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px 8px;
  color: var(--text-muted);
  cursor: help;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.skill-badge:hover {
  color: var(--gold);
  border-color: var(--gold);
  background: var(--gold-glow);
}

/* ── Set bonus ── */
.set-bonus { background: var(--surface-2); border-radius: 6px; padding: 12px; }
.bonus-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.bonus-item { display: flex; gap: 8px; font-size: 12px; }
.bonus-req  { color: var(--gold); font-family: var(--font-heading); }
.bonus-name { color: var(--text); }

/* ── Per-piece planner button ── */
.piece-planner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.piece-planner__btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: 5px;
  padding: 4px 12px;
  font-size: 11px;
  font-family: var(--font-heading);
  letter-spacing: .04em;
  cursor: pointer;
  transition: color .15s, border-color .15s, background .15s;
}

.piece-planner__btn:hover:not(:disabled) {
  color: var(--gold);
  border-color: var(--gold);
  background: var(--gold-glow);
}

.piece-planner__btn:disabled {
  opacity: .35;
  cursor: not-allowed;
}

.piece-planner__feedback        { font-size: 11px; color: #5cb85c; }
.piece-planner__feedback--exists { font-size: 11px; color: var(--text-muted); }

/* ── Footer ── */
.modal__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 24px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.modal__footer-hint {
  font-size: 11px;
  color: var(--text-muted);
  flex: 1;
}

.modal__footer-close {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 12px;
  font-family: var(--font-heading);
  cursor: pointer;
  transition: color .15s, border-color .15s;
}

.modal__footer-close:hover { color: var(--text); border-color: var(--gold); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

/* ── Responsivo ── */
@media (max-width: 640px) {
  .modal-overlay { padding: 0; align-items: flex-end; }
  .modal {
    max-width: 100%;
    max-height: 92vh;
    border-radius: 16px 16px 0 0;
  }
  .modal__header  { padding: 16px 16px 12px; }
  .modal__body    { padding: 14px 16px; }
  .modal__footer  { padding: 10px 16px; }
  .modal__title   { font-size: 16px; }
  .detail-grid    { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .piece-img-wrap { width: 48px; height: 48px; }
}
</style>
