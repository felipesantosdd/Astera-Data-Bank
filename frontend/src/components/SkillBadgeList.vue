<script setup lang="ts">
import SkillTooltip from '@/components/SkillTooltip.vue'

interface Skill {
  name: string
  description?: string
  level?: number | null
  levels?: { level: number; description: string }[]
}

defineProps<{ skills: Skill[] }>()
</script>

<template>
  <div v-if="skills.length" class="skill-badge-list">
    <SkillTooltip
      v-for="sk in skills"
      :key="sk.name"
      :name="sk.name"
      :description="sk.description"
      :current-level="sk.level ?? undefined"
      :levels="sk.levels"
    >
      <span class="skill-badge">
        {{ sk.name }}<span v-if="sk.level" class="skill-badge__lv"> Lv{{ sk.level }}</span>
      </span>
    </SkillTooltip>
  </div>
</template>

<style scoped>
.skill-badge-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.skill-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 11px;
  color: var(--text-muted);
  cursor: default;
  transition: border-color .15s, color .15s;
  white-space: nowrap;
}

.skill-badge:hover {
  border-color: var(--gold);
  color: var(--text);
}

.skill-badge__lv {
  color: var(--gold);
  font-weight: 700;
}
</style>
