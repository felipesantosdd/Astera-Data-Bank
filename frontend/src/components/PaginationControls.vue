<script setup lang="ts">
defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{ goTo: [page: number] }>()
</script>

<template>
  <div v-if="totalPages > 1" class="pagination">
    <button class="pagination__btn" :disabled="currentPage === 1" @click="emit('goTo', currentPage - 1)">‹</button>
    <template v-for="p in totalPages" :key="p">
      <template v-if="p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1">
        <button
          class="pagination__btn"
          :class="{ 'pagination__btn--active': p === currentPage }"
          @click="emit('goTo', p)"
        >{{ p }}</button>
      </template>
      <span v-else-if="p === 2 && currentPage > 4" class="pagination__ellipsis">…</span>
      <span v-else-if="p === totalPages - 1 && currentPage < totalPages - 3" class="pagination__ellipsis">…</span>
    </template>
    <button class="pagination__btn" :disabled="currentPage === totalPages" @click="emit('goTo', currentPage + 1)">›</button>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.pagination__btn {
  min-width: 38px;
  height: 38px;
  padding: 0 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 13px;
  font-family: var(--font-heading);
  cursor: pointer;
  transition: color .15s, border-color .15s, background .15s;
}

.pagination__btn:hover:not(:disabled) { color: var(--text); border-color: var(--gold); }
.pagination__btn:disabled             { opacity: .35; cursor: not-allowed; }
.pagination__btn--active              { color: var(--gold); border-color: var(--gold); background: var(--gold-glow); }

.pagination__ellipsis {
  color: var(--text-muted);
  padding: 0 4px;
  font-size: 14px;
  align-self: flex-end;
}

@media (max-width: 768px) {
  .pagination__btn { min-width: 44px; height: 44px; }
}
</style>
