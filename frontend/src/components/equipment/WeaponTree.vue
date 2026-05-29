<script setup lang="ts">
/**
 * Renderiza a árvore de upgrades de uma linha de arma.
 * Mostra bifurcações recursivamente com conectores visuais ├─ └─
 */
import { ref, computed, defineComponent, h, type PropType } from 'vue'
import type { Weapon } from '@/types/weapon'
import { usePlannerStore } from '@/stores/plannerStore'

const props = defineProps<{
  root: Weapon
  all:  Weapon[]   // todas as armas do mesmo tipo
}>()

const emit = defineEmits<{ select: [w: Weapon] }>()

const selectedId    = ref<number | null>(null)
const plannerStore  = usePlannerStore()
const plannerFeedback = ref<'added' | 'exists' | null>(null)

// Retorna os materiais relevantes: craft se existir, senão upgrade
function effectiveMaterials(w: Weapon) {
  return w.craftMaterials?.length ? w.craftMaterials : (w.upgradeMaterials ?? [])
}

function addToPlanner(w: Weapon) {
  const mats = effectiveMaterials(w)
  const materials = mats.map(m => ({
    id:               `mat-${m.itemId ?? m.name}-${w.id}`,
    materialId:       m.itemId ?? undefined,
    name:             m.name,
    requiredQuantity: m.quantity,
    ownedQuantity:    0,
    completed:        false,
  }))
  const added = plannerStore.addEquipmentNode({
    equipmentId:   w.id,
    name:          w.name,
    equipmentType: 'weapon',
    subtype:       w.weaponType,
    rarity:        w.rarity,
    materials,
  })
  plannerFeedback.value = added ? 'added' : 'exists'
  setTimeout(() => { plannerFeedback.value = null }, 2200)
}

// ── Build tree ────────────────────────────────────────────────────────────────
interface Node { weapon: Weapon; children: Node[] }

function build(parentId: number | null): Node[] {
  return props.all
    .filter(w => w.previousWeaponId === parentId)
    .map(w => ({ weapon: w, children: build(w.id) }))
}

const tree = computed<Node[]>(() =>
  build(null).filter(n => n.weapon.id === props.root.id),
)

// ── Selected weapon ───────────────────────────────────────────────────────────
const selected = computed<Weapon | null>(() =>
  selectedId.value == null ? null : (props.all.find(w => w.id === selectedId.value) ?? null),
)

function select(w: Weapon) {
  selectedId.value = selectedId.value === w.id ? null : w.id
  emit('select', w)
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const ELEMENT_COLORS: Record<string, string> = {
  Fire: 'var(--el-fire)', Water: 'var(--el-water)', Thunder: 'var(--el-thunder)',
  Ice: 'var(--el-ice)', Dragon: 'var(--el-dragon)', Poison: 'var(--el-poison)',
  Blast: 'var(--el-blast)',
}

function rarityColor(r: number) {
  if (r <= 4) return '#6abf6a'
  if (r <= 8) return '#e0a040'
  return '#c060c0'
}

function slots(s1: number, s2: number, s3: number): string {
  return [s1, s2, s3].filter(s => s > 0).map(s => `[${s}]`).join('') || ''
}

// ── Recursive tree node (render function component) ───────────────────────────
const TreeNode = defineComponent({
  props: {
    nodes:      { type: Array as PropType<Node[]>, required: true },
    selectedId: { type: Number as PropType<number | null>, default: null },
    isRoot:     { type: Boolean, default: false },
  },
  emits: ['select'],
  setup(props, { emit }) {
    function renderNodes(nodes: Node[], depth = 0): ReturnType<typeof h>[] {
      return nodes.map((node, idx) => {
        const w          = node.weapon
        const isLast     = idx === nodes.length - 1
        const isSelected = w.id === props.selectedId
        const hasKids    = node.children.length > 0

        const connector = depth === 0
          ? null
          : h('span', { class: 'tree-connector' }, isLast ? '└─' : '├─')

        const nodeBtn = h('button', {
          class: ['tree-node', isSelected && 'tree-node--active'],
          onClick: () => emit('select', w),
        }, [
          // rarity
          h('span', { class: 'tn-rarity', style: { color: rarityColor(w.rarity) } }, `R${w.rarity}`),
          // name
          h('span', { class: 'tn-name' }, w.name),
          // attack
          h('span', { class: 'tn-atk' }, `⚔ ${w.attack}`),
          // element
          w.element1
            ? h('span', {
                class: 'tn-el',
                style: { color: ELEMENT_COLORS[w.element1] ?? 'inherit' },
              }, `${w.element1}${w.elementHidden ? '*' : ''}`)
            : null,
          // slots
          slots(w.slot1, w.slot2, w.slot3)
            ? h('span', { class: 'tn-slots' }, slots(w.slot1, w.slot2, w.slot3))
            : null,
          // final star
          w.isFinal ? h('span', { class: 'tn-final' }, '★') : null,
        ])

        const line = h('div', {
          class: ['tree-row', depth > 0 && 'tree-row--child'],
          style: { '--depth': depth },
        }, [connector, nodeBtn])

        const children = hasKids
          ? h('div', { class: 'tree-branch' }, renderNodes(node.children, depth + 1))
          : null

        return h('div', { key: w.id }, [line, children])
      })
    }

    return () => h('div', { class: 'tree-wrap' }, renderNodes(props.nodes))
  },
})
</script>

<template>
  <div class="weapon-tree">
    <!-- Árvore -->
    <div class="weapon-tree__nodes">
      <TreeNode
        :nodes="tree"
        :selected-id="selectedId"
        @select="select"
      />
    </div>

    <!-- Painel de detalhes inline -->
    <Transition name="slide">
      <div v-if="selected" class="weapon-detail">
        <div class="wd-header">
          <div class="wd-title-row">
            <span class="wd-rarity" :style="{ color: selected.rarity <= 4 ? '#6abf6a' : selected.rarity <= 8 ? '#e0a040' : '#c060c0' }">
              R{{ selected.rarity }}
            </span>
            <h4 class="wd-name">{{ selected.name }}</h4>
            <span v-if="selected.isFinal" class="wd-final">FINAL</span>
          </div>
        </div>

        <div class="wd-stats">
          <div class="wd-stat">
            <span class="wd-stat__lbl">Ataque</span>
            <span class="wd-stat__val">{{ selected.attack }}</span>
          </div>
          <div class="wd-stat">
            <span class="wd-stat__lbl">Afinidade</span>
            <span
              class="wd-stat__val"
              :class="{ 'val-pos': selected.affinity > 0, 'val-neg': selected.affinity < 0 }"
            >{{ selected.affinity > 0 ? '+' : '' }}{{ selected.affinity }}%</span>
          </div>
          <div v-if="selected.defense" class="wd-stat">
            <span class="wd-stat__lbl">Defesa</span>
            <span class="wd-stat__val">+{{ selected.defense }}</span>
          </div>
          <div v-if="selected.element1" class="wd-stat">
            <span class="wd-stat__lbl">Elemento</span>
            <span class="wd-stat__val" :style="{ color: ELEMENT_COLORS[selected.element1] }">
              {{ selected.element1 }} {{ selected.element1Attack }}
              <span v-if="selected.elementHidden" class="val-hidden">(ocult)</span>
            </span>
          </div>
          <div v-if="selected.elderseal" class="wd-stat">
            <span class="wd-stat__lbl">Elderseal</span>
            <span class="wd-stat__val">{{ selected.elderseal }}</span>
          </div>
          <div class="wd-stat">
            <span class="wd-stat__lbl">Slots</span>
            <span class="wd-stat__val">
              {{ [selected.slot1, selected.slot2, selected.slot3].filter(s => s > 0).map(s => `[${s}]`).join(' ') || '—' }}
            </span>
          </div>
          <div v-if="selected.phial" class="wd-stat">
            <span class="wd-stat__lbl">Phial</span>
            <span class="wd-stat__val">{{ selected.phial }}<span v-if="selected.phialPower"> {{ selected.phialPower }}</span></span>
          </div>
          <div v-if="selected.shelling" class="wd-stat">
            <span class="wd-stat__lbl">Shelling</span>
            <span class="wd-stat__val">{{ selected.shelling }} Lv{{ selected.shellingLevel }}</span>
          </div>
          <div v-if="selected.kinsectBonus" class="wd-stat">
            <span class="wd-stat__lbl">Kinsect</span>
            <span class="wd-stat__val">{{ selected.kinsectBonus }}</span>
          </div>
        </div>

        <!-- Materiais de craft -->
        <div v-if="selected.craftMaterials?.length" class="wd-craft">
          <p class="wd-craft__title">Craft (do zero)</p>
          <ul class="wd-craft__list">
            <li v-for="m in selected.craftMaterials" :key="m.itemId ?? m.name" class="wd-craft__item">
              <span>{{ m.name }}</span>
              <span class="wd-craft__qty">× {{ m.quantity }}</span>
            </li>
          </ul>
        </div>

        <!-- Materiais de upgrade -->
        <div v-if="selected.upgradeMaterials?.length" class="wd-craft">
          <p class="wd-craft__title">Upgrade</p>
          <ul class="wd-craft__list">
            <li v-for="m in selected.upgradeMaterials" :key="m.itemId ?? m.name" class="wd-craft__item">
              <span>{{ m.name }}</span>
              <span class="wd-craft__qty">× {{ m.quantity }}</span>
            </li>
          </ul>
        </div>

        <div v-if="!selected.craftMaterials?.length && !selected.upgradeMaterials?.length" class="wd-no-mats">
          Sem materiais disponíveis.
        </div>

        <!-- Planner -->
        <div class="wd-planner">
          <button
            class="wd-planner__btn"
            :disabled="!effectiveMaterials(selected).length"
            @click="addToPlanner(selected)"
          >＋ Adicionar ao Planner</button>
          <Transition name="fade">
            <span
              v-if="plannerFeedback"
              class="wd-planner__feedback"
              :class="{ 'wd-planner__feedback--exists': plannerFeedback === 'exists' }"
            >{{ plannerFeedback === 'added' ? '✓ Adicionado' : '⚠ Já existe' }}</span>
          </Transition>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.weapon-tree {
  display: flex;
  gap: 0;
}

/* ── Nós da árvore ── */
.weapon-tree__nodes {
  flex: 1;
  padding: 8px 0;
  min-width: 0;
}

/* ── Rows ── */
:deep(.tree-wrap) { display: flex; flex-direction: column; }

:deep(.tree-row) {
  display: flex;
  align-items: center;
  padding-left: calc(var(--depth, 0) * 20px);
}

:deep(.tree-branch) {
  border-left: 1px solid var(--border);
  margin-left: 18px;
}

:deep(.tree-connector) {
  font-size: 12px;
  color: var(--text-dim);
  margin-right: 4px;
  flex-shrink: 0;
  font-family: monospace;
  line-height: 1;
}

/* ── Node button ── */
:deep(.tree-node) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  border-radius: 5px;
  background: none;
  border: 1px solid transparent;
  cursor: pointer;
  text-align: left;
  transition: background .15s, border-color .15s;
  width: 100%;
}

:deep(.tree-node:hover) {
  background: var(--surface-2);
  border-color: var(--border);
}

:deep(.tree-node--active) {
  background: var(--gold-glow) !important;
  border-color: var(--gold) !important;
}

:deep(.tn-rarity) {
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 700;
  width: 22px;
  flex-shrink: 0;
}

:deep(.tn-name) {
  font-family: var(--font-heading);
  font-size: 12px;
  color: var(--text);
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.tn-atk)   { font-size: 11px; color: var(--text-muted); flex-shrink: 0; }
:deep(.tn-el)    { font-size: 11px; flex-shrink: 0; }
:deep(.tn-slots) { font-size: 10px; color: var(--gold); flex-shrink: 0; }
:deep(.tn-final) { font-size: 10px; color: var(--gold); flex-shrink: 0; }

/* ── Detalhe ── */
.weapon-detail {
  width: 280px;
  flex-shrink: 0;
  border-left: 1px solid var(--border);
  background: var(--surface);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  /* Fica visível mesmo quando a árvore é longa */
  position: sticky;
  top: 72px;          /* altura da navbar */
  max-height: calc(100vh - 96px);
  overflow-y: auto;
  align-self: flex-start;
}

.wd-header {}
.wd-title-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.wd-rarity {
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 700;
  border: 1px solid currentColor;
  border-radius: 3px;
  padding: 1px 6px;
}

.wd-name {
  font-family: var(--font-heading);
  font-size: 14px;
  color: var(--text);
  margin: 0;
  flex: 1;
}

.wd-final {
  font-size: 9px;
  letter-spacing: .1em;
  color: var(--gold);
  background: var(--gold-glow);
  border: 1px solid var(--gold);
  border-radius: 3px;
  padding: 1px 5px;
  font-family: var(--font-heading);
}

.wd-stats { display: flex; flex-direction: column; gap: 4px; }

.wd-stat {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 3px 8px;
  background: var(--surface-2);
  border-radius: 4px;
}

.wd-stat__lbl { color: var(--text-muted); font-family: var(--font-heading); font-size: 10px; letter-spacing: .06em; }
.wd-stat__val { color: var(--text); font-family: var(--font-heading); }

.val-pos     { color: #6abf6a !important; }
.val-neg     { color: #e74c3c !important; }
.val-hidden  { opacity: .6; font-size: 10px; }

.wd-no-mats { font-size: 11px; color: var(--text-dim); border-top: 1px solid var(--border); padding-top: 10px; }
.wd-craft { border-top: 1px solid var(--border); padding-top: 10px; }
.wd-craft__title { font-family: var(--font-heading); font-size: 10px; letter-spacing: .1em; color: var(--gold); margin: 0 0 6px; }
.wd-craft__list  { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 3px; }
.wd-craft__item  { display: flex; justify-content: space-between; font-size: 11px; color: var(--text); background: var(--surface-2); border-radius: 3px; padding: 3px 8px; }
.wd-craft__qty   { color: var(--gold); font-family: var(--font-heading); }

/* ── Planner ── */
.wd-planner {
  border-top: 1px solid var(--border);
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wd-planner__btn {
  background: transparent;
  border: 1px solid var(--gold);
  color: var(--gold);
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 12px;
  font-family: var(--font-heading);
  letter-spacing: .04em;
  cursor: pointer;
  transition: background .15s, color .15s;
  width: 100%;
}

.wd-planner__btn:hover:not(:disabled) {
  background: var(--gold-glow);
  color: var(--gold-light);
}

.wd-planner__btn:disabled {
  opacity: .4;
  cursor: not-allowed;
  border-color: var(--border);
  color: var(--text-muted);
}

.wd-planner__feedback        { font-size: 11px; color: #5cb85c; }
.wd-planner__feedback--exists { color: var(--text-muted); }

/* ── Transição ── */
.slide-enter-active, .slide-leave-active { transition: opacity .15s, transform .15s; }
.slide-enter-from, .slide-leave-to       { opacity: 0; transform: translateX(8px); }

.fade-enter-active, .fade-leave-active { transition: opacity .25s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }

/* ── Responsivo ── */
@media (max-width: 768px) {
  /* Empilha árvore + detalhes verticalmente */
  .weapon-tree { flex-direction: column; }

  .weapon-detail {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--border);
    position: static;       /* cancela o sticky */
    max-height: none;
    padding: 14px 12px;
  }

  /* Árvore mais compacta */
  :deep(.tree-node) { padding: 7px 8px; }
  :deep(.tn-atk), :deep(.tn-slots) { display: none; } /* hide na mobile, espaço curto */
}
</style>
