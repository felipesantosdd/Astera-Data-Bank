<script setup lang="ts">
import PlannerCanvas from '@/components/planner/PlannerCanvas.vue'
import { usePlannerStore } from '@/stores/plannerStore'

const store = usePlannerStore()
</script>

<template>
  <div class="planner-view">

    <!-- Toolbar superior -->
    <div class="planner-toolbar">
      <div class="planner-toolbar__left">
        <h1 class="planner-toolbar__title">Hunt Planner</h1>
        <span class="planner-toolbar__hint">Arraste para mover · Conecte handles para ligar cards · <span class="planner-toolbar__hint-red">Clique numa linha para remover</span></span>
      </div>
      <div class="planner-toolbar__actions">
        <button class="planner-btn" @click="store.addNoteNode()">+ Nota</button>
        <button class="planner-btn" @click="store.addChecklistNode()">+ Checklist</button>
      </div>
    </div>

    <!-- Canvas -->
    <div class="planner-canvas-wrap">
      <PlannerCanvas />
    </div>

  </div>
</template>

<style scoped>
.planner-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px); /* desconta navbar */
}

/* ── Toolbar ── */
.planner-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 24px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.planner-toolbar__left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.planner-toolbar__title {
  font-family: var(--font-heading);
  font-size: 18px;
  color: var(--gold);
  margin: 0;
}

.planner-toolbar__hint {
  font-size: 11px;
  color: var(--text-muted);
}

.planner-toolbar__hint-red {
  color: #e74c3c99;
}

.planner-toolbar__actions {
  display: flex;
  gap: 8px;
}

.planner-btn {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text-muted);
  border-radius: 6px;
  padding: 5px 14px;
  font-size: 12px;
  font-family: var(--font-heading);
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.planner-btn:hover {
  color: var(--gold);
  border-color: var(--gold);
}

/* ── Responsivo ── */
@media (max-width: 640px) {
  .planner-toolbar { padding: 8px 14px; flex-wrap: wrap; gap: 8px; }
  .planner-toolbar__hint { display: none; }
  .planner-toolbar__title { font-size: 15px; }
  .planner-toolbar__actions { gap: 6px; }
  .planner-btn { padding: 6px 12px; }
}

/* ── Canvas ── */
.planner-canvas-wrap {
  flex: 1;
  min-height: 0;
}
</style>
