<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Weapon } from '@/types/weapon'

const props = defineProps<{
  root: Weapon
  allWeapons: Weapon[]   // todas as armas do mesmo tipo, para montar a árvore
}>()

const emit = defineEmits<{ close: [] }>()

// ── Build tree ────────────────────────────────────────────────────────────────
interface WeaponNode {
  weapon: Weapon
  children: WeaponNode[]
}

function buildTree(parentId: number | null): WeaponNode[] {
  return props.allWeapons
    .filter(w => w.previousWeaponId === parentId)
    .map(w => ({ weapon: w, children: buildTree(w.id) }))
}

const tree = computed<WeaponNode[]>(() => buildTree(null).filter(n => n.weapon.id === props.root.id))

// ── Selected weapon ───────────────────────────────────────────────────────────
const selected = ref<Weapon>(props.root)

function select(w: Weapon) { selected.value = w }

// ── Helpers ───────────────────────────────────────────────────────────────────
const ELEMENT_COLORS: Record<string, string> = {
  Fire: 'var(--el-fire)', Water: 'var(--el-water)', Thunder: 'var(--el-thunder)',
  Ice: 'var(--el-ice)', Dragon: 'var(--el-dragon)', Poison: 'var(--el-poison)',
  Blast: 'var(--el-blast)',
}

function rarityColor(r: number): string {
  if (r <= 4) return '#6abf6a'
  if (r <= 8) return '#e0a040'
  return '#c060c0'
}

function slotText(s1: number, s2: number, s3: number): string {
  return [s1, s2, s3].filter(s => s > 0).map(s => `[${s}]`).join(' ') || '—'
}

function onOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click="onOverlayClick">
      <div class="modal">

        <div class="modal__header">
          <h2 class="modal__title">{{ root.name }} <span class="modal__line-label">— linha de evolução</span></h2>
          <button class="modal__close" @click="emit('close')">✕</button>
        </div>

        <div class="modal__body">

          <!-- Árvore à esquerda -->
          <div class="tree-col">
            <template v-for="node in tree" :key="node.weapon.id">
              <WeaponTreeNode
                :node="node"
                :selected-id="selected.id"
                @select="select"
              />
            </template>
          </div>

          <!-- Detalhes à direita -->
          <div class="detail-col">
            <div class="detail-header">
              <span class="detail-rarity" :style="{ color: rarityColor(selected.rarity) }">R{{ selected.rarity }}</span>
              <h3 class="detail-name">{{ selected.name }}</h3>
              <span v-if="selected.isFinal" class="detail-final">FINAL</span>
            </div>

            <div class="detail-stats">
              <div class="stat-row">
                <span class="stat-label">Ataque</span>
                <span class="stat-val">{{ selected.attack }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Afinidade</span>
                <span
                  class="stat-val"
                  :class="{ 'val--pos': selected.affinity > 0, 'val--neg': selected.affinity < 0 }"
                >{{ selected.affinity > 0 ? '+' : '' }}{{ selected.affinity }}%</span>
              </div>
              <div v-if="selected.defense" class="stat-row">
                <span class="stat-label">Defesa</span>
                <span class="stat-val">+{{ selected.defense }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Slots</span>
                <span class="stat-val">{{ slotText(selected.slot1, selected.slot2, selected.slot3) }}</span>
              </div>
              <div v-if="selected.elderseal" class="stat-row">
                <span class="stat-label">Elderseal</span>
                <span class="stat-val">{{ selected.elderseal }}</span>
              </div>

              <!-- Elemento -->
              <div v-if="selected.element1" class="stat-row">
                <span class="stat-label">Elemento</span>
                <span class="stat-val" :style="{ color: ELEMENT_COLORS[selected.element1] ?? 'inherit' }">
                  {{ selected.element1 }} {{ selected.element1Attack }}
                  <span v-if="selected.elementHidden" class="stat-hidden">(ocult)</span>
                </span>
              </div>

              <!-- Tipo-specific -->
              <div v-if="selected.phial" class="stat-row">
                <span class="stat-label">Phial</span>
                <span class="stat-val">{{ selected.phial }}<span v-if="selected.phialPower"> {{ selected.phialPower }}</span></span>
              </div>
              <div v-if="selected.shelling" class="stat-row">
                <span class="stat-label">Shelling</span>
                <span class="stat-val">{{ selected.shelling }} Lv{{ selected.shellingLevel }}</span>
              </div>
              <div v-if="selected.kinsectBonus" class="stat-row">
                <span class="stat-label">Kinsect</span>
                <span class="stat-val">{{ selected.kinsectBonus }}</span>
              </div>
            </div>

            <!-- Materiais de craft -->
            <div v-if="selected.craftMaterials.length" class="craft-section">
              <p class="craft-title">{{ selected.craftable ? 'Craft' : 'Upgrade' }}</p>
              <ul class="craft-list">
                <li v-for="m in selected.craftMaterials" :key="m.itemId" class="craft-item">
                  <span>{{ m.name }}</span>
                  <span class="craft-qty">× {{ m.quantity }}</span>
                </li>
              </ul>
            </div>
            <div v-else class="no-craft">Sem materiais</div>
          </div>

        </div>
      </div>
    </div>
  </Teleport>
</template>

<!-- Componente recursivo para nó da árvore -->
<script lang="ts">
import { defineComponent, h, type PropType } from 'vue'

interface WeaponNode { weapon: Weapon; children: WeaponNode[] }

const WeaponTreeNode = defineComponent({
  name: 'WeaponTreeNode',
  props: {
    node:       { type: Object as PropType<WeaponNode>, required: true },
    selectedId: { type: Number, required: true },
  },
  emits: ['select'],
  setup(props, { emit }) {
    function rarityColor(r: number) {
      if (r <= 4) return '#6abf6a'
      if (r <= 8) return '#e0a040'
      return '#c060c0'
    }

    function renderNode(node: WeaponNode, depth = 0): ReturnType<typeof h> {
      const w = node.weapon
      const isSelected = w.id === props.selectedId
      const hasChildren = node.children.length > 0

      return h('div', { class: 'tree-item-wrap', style: { '--depth': depth } }, [
        h('button', {
          class: ['tree-item', isSelected ? 'tree-item--active' : ''],
          onClick: () => emit('select', w),
        }, [
          h('span', {
            class: 'tree-item__rarity',
            style: { color: rarityColor(w.rarity) },
          }, `R${w.rarity}`),
          h('span', { class: 'tree-item__name' }, w.name),
          w.isFinal ? h('span', { class: 'tree-item__final' }, '★') : null,
        ]),
        hasChildren
          ? h('div', { class: 'tree-children' },
              node.children.map(child => renderNode(child, depth + 1)))
          : null,
      ])
    }

    return () => renderNode(props.node)
  },
})

export { WeaponTreeNode }
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.78);
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
  max-width: 860px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 14px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  gap: 12px;
}

.modal__title {
  font-family: var(--font-heading);
  font-size: 18px;
  color: var(--text);
  margin: 0;
}

.modal__line-label {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 400;
}

.modal__close {
  background: none; border: none; color: var(--text-muted);
  font-size: 16px; cursor: pointer; padding: 4px; flex-shrink: 0;
  transition: color .15s;
}
.modal__close:hover { color: var(--text); }

/* ── Body split ── */
.modal__body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ── Tree column ── */
.tree-col {
  width: 300px;
  flex-shrink: 0;
  overflow-y: auto;
  border-right: 1px solid var(--border);
  padding: 12px 0;
}

/* ── Detail column ── */
.detail-col {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.detail-rarity {
  font-family: var(--font-heading);
  font-size: 11px;
  font-weight: 700;
  border: 1px solid currentColor;
  border-radius: 4px;
  padding: 2px 7px;
}

.detail-name {
  font-family: var(--font-heading);
  font-size: 17px;
  color: var(--text);
  margin: 0;
  flex: 1;
}

.detail-final {
  font-size: 11px;
  color: var(--gold);
  background: var(--gold-glow);
  border: 1px solid var(--gold);
  border-radius: 4px;
  padding: 2px 7px;
  font-family: var(--font-heading);
  letter-spacing: .06em;
}

/* ── Stats ── */
.detail-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  padding: 5px 10px;
  background: var(--surface-2);
  border-radius: 5px;
}

.stat-label { color: var(--text-muted); font-family: var(--font-heading); font-size: 11px; letter-spacing: .06em; }
.stat-val   { color: var(--text); font-family: var(--font-heading); font-size: 14px; }
.stat-hidden { opacity: .6; font-size: 11px; }

.val--pos { color: #6abf6a; }
.val--neg { color: #e74c3c; }

/* ── Craft ── */
.craft-section { border-top: 1px solid var(--border); padding-top: 14px; }
.craft-title { font-family: var(--font-heading); font-size: 11px; letter-spacing: .1em; color: var(--gold); margin: 0 0 8px; }
.craft-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.craft-item { display: flex; justify-content: space-between; font-size: 12px; color: var(--text); background: var(--surface-2); border-radius: 4px; padding: 4px 10px; }
.craft-qty { color: var(--gold); font-family: var(--font-heading); }
.no-craft  { font-size: 12px; color: var(--text-muted); border-top: 1px solid var(--border); padding-top: 14px; }
</style>

<style>
/* Estilos globais para o componente recursivo WeaponTreeNode */
.tree-item-wrap {
  padding-left: calc(var(--depth, 0) * 16px);
}

.tree-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 16px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background .15s;
  position: relative;
}

.tree-item:hover { background: var(--surface-2); }
.tree-item--active { background: var(--gold-glow) !important; }

.tree-item__rarity {
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
  width: 24px;
}

.tree-item__name {
  font-size: 12px;
  color: var(--text);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tree-item__final {
  color: var(--gold);
  font-size: 10px;
  flex-shrink: 0;
}

.tree-children {
  border-left: 1px solid var(--border);
  margin-left: 24px;
}
</style>
