<script setup lang="ts">
import type { SkillLevel } from '@/types/armor'

defineProps<{
  name:         string
  description?: string | null
  /** Level concedido pela peça/bônus atual — usado pra destacar */
  currentLevel?: number | null
  levels:       SkillLevel[]
}>()
</script>

<template>
  <span class="tt">
    <slot />

    <span class="tt__pop">
      <span class="tt__title">{{ name }}</span>
      <span v-if="description" class="tt__desc">{{ description }}</span>

      <span v-if="levels.length > 0" class="tt__levels">
        <span
          v-for="lv in levels"
          :key="lv.level"
          class="tt__level"
          :class="{ 'tt__level--current': currentLevel === lv.level }"
        >
          <strong>Lv{{ lv.level }}</strong>
          <span class="tt__level-desc">{{ lv.description }}</span>
        </span>
      </span>
    </span>
  </span>
</template>

<style scoped>
.tt {
  position: relative;
  cursor: help;
  border-bottom: 1px dotted var(--text-muted);
}

.tt__pop {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);

  display: flex;
  flex-direction: column;
  gap: 6px;

  width: max-content;
  max-width: 340px;
  padding: 10px 14px;

  background: var(--surface);
  border: 1px solid var(--gold);
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.7);

  pointer-events: none;
  opacity: 0;
  z-index: 50;
  transition: opacity 0.15s ease, transform 0.15s ease;

  font-family: var(--font-body);
  font-weight: 400;
  font-size: 12px;
  letter-spacing: 0;
  text-transform: none;
  text-align: left;
  line-height: 1.4;
  white-space: normal;
  color: var(--text);
}

/* Setinha apontando pra baixo */
.tt::after {
  content: '';
  position: absolute;
  bottom: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  border: 6px solid transparent;
  border-top-color: var(--gold);
  pointer-events: none;
  opacity: 0;
  z-index: 51;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tt:hover .tt__pop,
.tt:hover::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* ── Conteúdo ──────────────────────────────────────────────────────── */
.tt__title {
  font-family: var(--font-heading);
  font-size: 13px;
  color: var(--gold);
  letter-spacing: 0.05em;
}

.tt__desc {
  color: var(--text-muted);
  font-style: italic;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
}

.tt__levels {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tt__level {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  color: var(--text-muted);
  font-size: 11px;
  padding: 2px 4px;
  margin: 0 -4px;
  border-radius: 4px;
}

.tt__level strong {
  flex-shrink: 0;
  min-width: 32px;
  font-family: var(--font-heading);
  font-size: 10px;
  letter-spacing: 0.05em;
  color: var(--text-dim);
}

.tt__level-desc { flex: 1; }

.tt__level--current {
  background: var(--gold-glow);
  color: var(--text);
}
.tt__level--current strong { color: var(--gold); }
</style>
