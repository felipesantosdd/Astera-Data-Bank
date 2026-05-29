<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import type { SkillLevel } from '@/types/armor'

const props = defineProps<{
  name: string
  description?: string | null
  currentLevel?: number | null
  levels: SkillLevel[]
}>()

const trigger = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const anchor = ref({ left: 0, top: 0 })

const popStyle = computed(() => ({
  left: `${anchor.value.left}px`,
  top: `${anchor.value.top}px`,
}))

const arrowStyle = computed(() => ({
  left: `${anchor.value.left}px`,
  top: `${anchor.value.top}px`,
}))

function updatePosition() {
  const el = trigger.value
  if (!el) return

  const rect = el.getBoundingClientRect()
  const halfWidth = Math.min(170, Math.max(120, (window.innerWidth - 24) / 2))
  const left = Math.min(
    Math.max(rect.left + rect.width / 2, halfWidth + 12),
    window.innerWidth - halfWidth - 12,
  )

  anchor.value = {
    left,
    top: Math.max(12, rect.top - 10),
  }
}

function addListeners() {
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
}

function removeListeners() {
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
}

async function openTooltip() {
  isOpen.value = true
  await nextTick()
  updatePosition()
  addListeners()
}

function closeTooltip() {
  isOpen.value = false
  removeListeners()
}

onBeforeUnmount(removeListeners)
</script>

<template>
  <span
    ref="trigger"
    class="tt"
    tabindex="0"
    @mouseenter="openTooltip"
    @mouseleave="closeTooltip"
    @focusin="openTooltip"
    @focusout="closeTooltip"
  >
    <slot />
  </span>

  <Teleport to="body">
    <span
      v-if="isOpen"
      class="tt__pop"
      :style="popStyle"
    >
      <span class="tt__title">{{ props.name }}</span>
      <span v-if="props.description" class="tt__desc">{{ props.description }}</span>

      <span v-if="props.levels.length > 0" class="tt__levels">
        <span
          v-for="lv in props.levels"
          :key="lv.level"
          class="tt__level"
          :class="{ 'tt__level--current': props.currentLevel === lv.level }"
        >
          <strong>Lv{{ lv.level }}</strong>
          <span class="tt__level-desc">{{ lv.description }}</span>
        </span>
      </span>
    </span>

    <span
      v-if="isOpen"
      class="tt__arrow"
      :style="arrowStyle"
    />
  </Teleport>
</template>

<style scoped>
.tt {
  position: relative;
  cursor: help;
  border-bottom: 1px dotted var(--text-muted);
  outline: none;
}

.tt:focus-visible {
  border-bottom-color: var(--gold);
}

.tt__pop {
  position: fixed;
  transform: translate(-50%, -100%);

  display: flex;
  flex-direction: column;
  gap: 6px;

  width: max-content;
  max-width: min(340px, calc(100vw - 24px));
  padding: 10px 14px;

  background: var(--surface);
  border: 1px solid var(--gold);
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.7);

  pointer-events: none;
  z-index: 5000;

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

.tt__arrow {
  content: '';
  position: fixed;
  transform: translate(-50%, -2px);
  border: 6px solid transparent;
  border-top-color: var(--gold);
  pointer-events: none;
  z-index: 5001;
}

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

.tt__level-desc {
  flex: 1;
}

.tt__level--current {
  background: var(--gold-glow);
  color: var(--text);
}

.tt__level--current strong {
  color: var(--gold);
}
</style>
