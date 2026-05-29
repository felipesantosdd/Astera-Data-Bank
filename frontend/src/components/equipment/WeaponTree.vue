<script setup lang="ts">
/**
 * Renderiza a árvore de upgrades de uma linha de arma.
 * Mostra bifurcações recursivamente com conectores visuais ├─ └─
 */
import { ref, computed, defineComponent, h, type PropType } from 'vue'
import type { Weapon } from '@/types/weapon'
import { usePlannerPresence } from '@/composables/usePlannerPresence'

const props = defineProps<{
  root: Weapon
  all:  Weapon[]
}>()

const emit = defineEmits<{ select: [w: Weapon]; openModal: [w: Weapon] }>()

const selectedId      = ref<number | null>(null)
const { isEquipmentInPlanner } = usePlannerPresence()

// Retorna os materiais relevantes: craft se existir, senão upgrade
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
function select(w: Weapon) {
  selectedId.value = w.id
  emit('select', w)
  emit('openModal', w)
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const ELEMENT_COLORS: Record<string, string> = {
  Fire: 'var(--el-fire)', Water: 'var(--el-water)', Thunder: 'var(--el-thunder)',
  Ice: 'var(--el-ice)', Dragon: 'var(--el-dragon)', Poison: 'var(--el-poison)',
  Blast: 'var(--el-blast)',
}

const ELEM_ICON: Record<string, string> = {
  Fire: '/icons/ic_element_fire.svg', Water: '/icons/ic_element_water.svg',
  Thunder: '/icons/ic_element_thunder.svg', Ice: '/icons/ic_element_ice.svg',
  Dragon: '/icons/ic_element_dragon.svg', Poison: '/icons/ic_status_poison.svg',
  Blast: '/icons/ic_status_blast.svg',
}

function elemIcon(el: string) { return ELEM_ICON[el] ?? '' }

function rarityColor(r: number) {
  if (r <= 4) return '#6abf6a'
  if (r <= 8) return '#e0a040'
  return '#c060c0'
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
        const isPlanned  = isEquipmentInPlanner(w.id, 'weapon')
        const hasKids    = node.children.length > 0

        const connector = depth === 0
          ? null
          : h('span', { class: 'tree-connector' }, isLast ? '└─' : '├─')

        const nodeBtn = h('button', {
          class: ['tree-node', isSelected && 'tree-node--active', isPlanned && 'tree-node--planned'],
          onClick: () => emit('select', w),
        }, [
          // rarity
          h('span', { class: 'tn-rarity', style: { color: rarityColor(w.rarity) } }, `R${w.rarity}`),
          // name
          h('span', { class: 'tn-name' }, w.name),
          // attack
          h('span', { class: 'tn-atk' }, `⚔ ${w.attack}`),
          // element icon
          w.element1
            ? h('span', { class: 'tn-el', style: { color: ELEMENT_COLORS[w.element1] ?? 'inherit' } }, [
                h('img', { src: elemIcon(w.element1), alt: w.element1, class: 'tn-el-img' }),
                h('span', {}, `${w.element1Attack ?? ''}${w.elementHidden ? '*' : ''}`),
              ])
            : null,
          // slot icons
          ...[w.slot1, w.slot2, w.slot3]
            .filter((s): s is number => !!s && s > 0)
            .map(s => h('img', { src: `/icons/armor/slot${Math.min(s, 4)}.png`, alt: `[${s}]`, class: 'tn-slot-img' })),
          isPlanned ? h('span', { class: 'tn-planned' }, '✓') : null,
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
    <div class="weapon-tree__nodes">
      <TreeNode
        :nodes="tree"
        :selected-id="selectedId"
        @select="select"
      />
    </div>

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

:deep(.tree-node--planned) {
  border-color: var(--gold);
  box-shadow: inset 0 0 0 1px rgba(196, 154, 42, 0.25);
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

:deep(.tn-atk)     { font-size: 11px; color: var(--text-muted); flex-shrink: 0; }
:deep(.tn-el)      { font-size: 11px; flex-shrink: 0; display: inline-flex; align-items: center; gap: 2px; }
:deep(.tn-el-img)  { width: 13px; height: 13px; object-fit: contain; }
:deep(.tn-slot-img){ width: 13px; height: 13px; object-fit: contain; flex-shrink: 0; }
:deep(.tn-final) { font-size: 10px; color: var(--gold); flex-shrink: 0; }
:deep(.tn-planned) { font-size: 11px; color: #5cb85c; font-weight: 700; flex-shrink: 0; }

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

  /* Árvore scroll horizontal quando tem indentação profunda */
  .weapon-tree__nodes {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .weapon-detail {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--border);
    position: static;
    max-height: none;
    padding: 14px 12px;
  }

  /* Árvore mais compacta */
  :deep(.tree-node) { padding: 7px 8px; }
  :deep(.tn-atk), :deep(.tn-slots) { display: none; }
}
</style>
