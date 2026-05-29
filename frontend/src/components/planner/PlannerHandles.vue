<script setup lang="ts">
import { computed, nextTick, watch } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { usePlannerStore } from '@/stores/plannerStore'

const props = defineProps<{ nodeId: string }>()

const store = usePlannerStore()
const { updateNodeInternals } = useVueFlow()

const incomingEdges = computed(() =>
  store.edges.filter(edge => edge.target === props.nodeId),
)

const targetHandleCount = computed(() =>
  Math.max(1, incomingEdges.value.length + (store.isConnecting ? 1 : 0)),
)

const targetHandles = computed(() =>
  Array.from({ length: targetHandleCount.value }, (_, index) => ({
    id: `target-${index}`,
    top: `${((index + 1) / (targetHandleCount.value + 1)) * 100}%`,
  })),
)

watch(targetHandleCount, async () => {
  await nextTick()
  updateNodeInternals([props.nodeId])
}, { immediate: true })
</script>

<template>
  <Handle
    v-for="handle in targetHandles"
    :id="handle.id"
    :key="handle.id"
    type="target"
    :position="Position.Left"
    class="planner-handle planner-handle--target"
    :class="{ 'planner-handle--visible': store.isConnecting }"
    :style="{ top: handle.top }"
  />

  <Handle
    id="source"
    type="source"
    :position="Position.Right"
    class="planner-handle planner-handle--source planner-handle--visible"
  />
</template>

<style scoped>
.planner-handle {
  width: 10px;
  height: 10px;
  background: var(--gold);
  border: 2px solid var(--surface);
  opacity: 0;
  pointer-events: none;
  z-index: -1;
  transition: opacity 0.14s ease, transform 0.14s ease, box-shadow 0.14s ease;
}

.planner-handle--source,
.planner-handle--target {
  transform: translateY(-50%) scale(0.9);
}

.planner-handle--visible {
  opacity: 1;
  pointer-events: all;
  transform: translateY(-50%) scale(1);
}

.planner-handle--source {
  right: -5px;
  width: 10px;
  height: 10px;
  box-shadow: 0 0 0 3px rgba(196, 154, 42, 0.1);
  z-index: 0;
}

.planner-handle--target.planner-handle--visible {
  box-shadow: 0 0 0 4px rgba(196, 154, 42, 0.14);
}
</style>
