<script setup lang="ts">
import { computed, watch } from 'vue'
import { useItemSources } from '@/composables/useItemSources'
import { useUI } from '@/composables/useUI'

const props = defineProps<{
  itemId:   number | null
  itemName: string
}>()

const emit = defineEmits<{ close: [] }>()

const { t } = useUI()

/** Traduz condições que ficam em inglês no DB (ex: "Hunt (Bronze)" → "Caçada (Bronze)") */
function translateCondition(cond: string): string {
  return (t.value.conditions as Record<string, string>)[cond] ?? cond
}

const itemIdRef = computed(() => props.itemId)
const { data: sources, isLoading } = useItemSources(itemIdRef)

const isOpen = computed(() => props.itemId !== null)
const isEmpty = computed(() =>
  !!sources.value &&
  sources.value.rewards.length === 0 &&
  sources.value.gathering.length === 0
)

// Fecha com ESC + trava o scroll do body enquanto aberto
function handleKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) emit('close')
}
watch(isOpen, (open) => {
  if (open) {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKey)
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="backdrop" @click.self="emit('close')">
        <div class="modal" @click.stop>

          <header class="modal__header">
            <div class="modal__heading">
              <p class="modal__label">{{ t.itemSources.title }}</p>
              <h2 class="modal__title">{{ itemName }}</h2>
            </div>
            <button class="modal__close" @click="emit('close')" :aria-label="t.itemSources.close">✕</button>
          </header>

          <div class="modal__body">
            <!-- Loading -->
            <div v-if="isLoading" class="modal__state">
              <div class="modal__skel" />
              <div class="modal__skel" />
            </div>

            <!-- Empty -->
            <div v-else-if="isEmpty" class="modal__state modal__state--empty">
              {{ t.itemSources.noSources }}
            </div>

            <template v-else-if="sources">
              <!-- Drops de monstros -->
              <section v-if="sources.rewards.length > 0" class="modal__section">
                <h3 class="modal__section-title">{{ t.itemSources.monsterDrops }}</h3>
                <div class="modal__table-wrap">
                  <table class="src-table">
                    <thead>
                      <tr>
                        <th class="src-table__col-name">{{ t.itemSources.colMonster }}</th>
                        <th>{{ t.itemSources.colCondition }}</th>
                        <th>{{ t.itemSources.colRank }}</th>
                        <th class="src-table__col-pct">{{ t.itemSources.colChance }}</th>
                        <th>{{ t.itemSources.colStack }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(r, i) in sources.rewards" :key="i">
                        <td class="src-table__name">{{ r.monsterName }}</td>
                        <td class="src-table__cond">{{ translateCondition(r.condition) }}</td>
                        <td>
                          <span class="rank-pill" :class="`rank-pill--${r.rank.toLowerCase()}`">{{ r.rank }}</span>
                        </td>
                        <td class="src-table__pct">
                          <span class="pct-bar" :style="{ '--p': (r.percentage ?? 0) + '%' }">
                            <strong>{{ r.percentage }}%</strong>
                          </span>
                        </td>
                        <td class="src-table__stack">×{{ r.stack }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <!-- Coleta em mapas -->
              <section v-if="sources.gathering.length > 0" class="modal__section">
                <h3 class="modal__section-title">{{ t.itemSources.gathering }}</h3>
                <div class="modal__table-wrap">
                  <table class="src-table">
                    <thead>
                      <tr>
                        <th class="src-table__col-name">{{ t.itemSources.colLocation }}</th>
                        <th>{{ t.itemSources.colArea }}</th>
                        <th>{{ t.itemSources.colRank }}</th>
                        <th class="src-table__col-pct">{{ t.itemSources.colChance }}</th>
                        <th>{{ t.itemSources.colStack }}</th>
                        <th>{{ t.itemSources.colNodes }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(g, i) in sources.gathering" :key="i">
                        <td class="src-table__name">{{ g.locationName }}</td>
                        <td>{{ t.itemSources.areaPrefix }} {{ g.area }}</td>
                        <td>
                          <span class="rank-pill" :class="`rank-pill--${g.rank.toLowerCase()}`">{{ g.rank }}</span>
                        </td>
                        <td class="src-table__pct">
                          <span class="pct-bar" :style="{ '--p': (g.percentage ?? 0) + '%' }">
                            <strong>{{ g.percentage }}%</strong>
                          </span>
                        </td>
                        <td class="src-table__stack">×{{ g.stack }}</td>
                        <td>{{ g.nodes }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </template>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Backdrop e modal ──────────────────────────────────────────────── */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal {
  background: var(--surface);
  border: 1px solid var(--gold);
  border-radius: 12px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7), 0 0 32px var(--gold-glow);
  width: 100%;
  max-width: 800px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

/* Animação de entrada e saída */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active .modal, .modal-leave-active .modal {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal {
  transform: scale(0.96) translateY(8px);
  opacity: 0;
}

/* ── Header ───────────────────────────────────────────────────────── */
.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}
.modal__label {
  font-family: var(--font-heading);
  font-size: 10px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0 0 4px;
}
.modal__title {
  font-family: var(--font-heading);
  font-size: 22px;
  color: var(--text);
  margin: 0;
  letter-spacing: 0.03em;
}
.modal__close {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-size: 14px;
  transition: color 0.2s, border-color 0.2s, background 0.2s;
}
.modal__close:hover {
  color: var(--gold);
  border-color: var(--gold);
  background: var(--gold-glow);
}

/* ── Body ─────────────────────────────────────────────────────────── */
.modal__body {
  padding: 16px 24px 24px;
  overflow-y: auto;
}

.modal__state {
  padding: 32px 0;
  text-align: center;
  color: var(--text-muted);
}
.modal__state--empty { font-style: italic; }
.modal__skel {
  height: 32px;
  border-radius: 6px;
  background: var(--surface-2);
  margin: 8px 0;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

/* ── Seções ───────────────────────────────────────────────────────── */
.modal__section { margin-top: 8px; }
.modal__section + .modal__section { margin-top: 24px; }
.modal__section-title {
  font-family: var(--font-heading);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 0 0 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
}

/* ── Tabela ───────────────────────────────────────────────────────── */
.modal__table-wrap { overflow-x: auto; }
.src-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 480px;
}
.src-table th, .src-table td {
  padding: 8px 10px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}
.src-table th {
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  background: var(--surface-2);
}
.src-table tbody tr:hover { background: var(--surface-2); }
.src-table__name {
  color: var(--text);
  font-weight: 600;
}
.src-table__cond { color: var(--text-muted); }
.src-table__pct {
  font-variant-numeric: tabular-nums;
  min-width: 120px;
}
.src-table__stack { color: var(--gold); font-weight: 600; }
.src-table__col-pct { min-width: 130px; }

/* Barra visual da porcentagem */
.pct-bar {
  position: relative;
  display: block;
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--surface-2);
  overflow: hidden;
}
.pct-bar::before {
  content: '';
  position: absolute;
  inset: 0;
  width: var(--p, 0%);
  background: linear-gradient(to right, rgba(196, 154, 42, 0.15), rgba(196, 154, 42, 0.35));
  border-right: 1px solid var(--gold);
  z-index: 0;
}
.pct-bar strong {
  position: relative;
  color: var(--text);
  font-weight: 700;
  z-index: 1;
}

/* ── Rank pill (mesma do MonsterArmorSection) ─────────────────────── */
.rank-pill {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 3px;
  font-family: var(--font-heading);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  border: 1px solid;
}
.rank-pill--lr { color: #8fb88f; border-color: #4a6e4a; background: rgba(74,110,74,0.15); }
.rank-pill--hr { color: var(--gold); border-color: var(--gold); background: var(--gold-glow); }
.rank-pill--mr { color: var(--el-fire); border-color: var(--el-fire); background: rgba(224,82,40,0.15); }
</style>
