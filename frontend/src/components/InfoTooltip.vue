<script setup lang="ts">
/**
 * Tooltip reutilizável com título + conteúdo, mostrado no hover.
 * Para skills (com lista de níveis) use SkillTooltip.
 */
defineProps<{
  title:    string
  content:  string
}>()
</script>

<template>
  <span class="info-tip">
    <slot />
    <span class="info-tip__pop">
      <span class="info-tip__title">{{ title }}</span>
      <span class="info-tip__content">{{ content }}</span>
    </span>
  </span>
</template>

<style scoped>
.info-tip {
  position: relative;
  cursor: help;
}

.info-tip__pop {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);

  display: flex;
  flex-direction: column;
  gap: 4px;

  width: max-content;
  max-width: 260px;
  padding: 8px 12px;

  background: var(--surface);
  border: 1px solid var(--gold);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);

  pointer-events: none;
  opacity: 0;
  z-index: 50;
  transition: opacity 0.15s ease, transform 0.15s ease;

  font-family: var(--font-body);
  font-weight: 400;
  font-size: 11px;
  letter-spacing: 0;
  text-transform: none;
  text-align: left;
  line-height: 1.5;
  white-space: normal;
  color: var(--text);
}

/* Setinha */
.info-tip::after {
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

.info-tip:hover .info-tip__pop,
.info-tip:hover::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.info-tip__title {
  font-family: var(--font-heading);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--gold);
}
.info-tip__content { color: var(--text); }
</style>
