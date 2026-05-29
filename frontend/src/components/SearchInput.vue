<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="search-input">
    <svg class="search-input__icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.5"/>
      <path d="M13 13l3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <input
      :value="modelValue"
      class="search-input__field"
      type="text"
      :placeholder="placeholder"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      v-if="modelValue"
      class="search-input__clear"
      aria-label="Limpar busca"
      @click="emit('update:modelValue', '')"
    >×</button>
  </div>
</template>

<style scoped>
.search-input {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 200px;
  flex: 1;
}

.search-input__icon {
  position: absolute;
  left: 10px;
  width: 16px;
  height: 16px;
  color: var(--text-muted);
  pointer-events: none;
  flex-shrink: 0;
}

.search-input__field {
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text);
  font-size: 13px;
  padding: 7px 32px 7px 34px;
  transition: border-color .2s;
}

.search-input__field:focus       { outline: none; border-color: var(--gold); }
.search-input__field::placeholder { color: var(--text-dim); }

.search-input__clear {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  padding: 2px 4px;
  transition: color .15s;
}

.search-input__clear:hover { color: var(--text); }

@media (max-width: 768px) {
  .search-input { min-width: 0; }
}
</style>
