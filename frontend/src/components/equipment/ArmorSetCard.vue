<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ArmorSet } from '@/types/armor'
import { armorSetImageUrl } from '@/utils/armorImageUrl'

const props = defineProps<{ set: ArmorSet }>()

const setImgFailed = ref(false)

// Sets com 1 peça mostram direto a imagem da peça
const isSinglePiece = computed(() => props.set.pieces.length === 1)
const singlePiece = computed(() => props.set.pieces[0])

// Grid class baseada no número de peças
const gridClass = computed(() => {
  const n = props.set.pieces.length
  if (n <= 4) return 'asc__pieces-grid--two-col'
  return ''
})
</script>

<template>
  <div
    class="asc__wrap"
    :class="`asc__wrap--${set.rank.toLowerCase()}`"
  >
    <!-- Set com 1 peça: mostra direto a imagem da peça -->
    <template v-if="isSinglePiece">
      <img
        :src="`/armor/pieces/${singlePiece.id}.png`"
        :alt="singlePiece.name"
        class="asc__set-img"
        loading="lazy"
        @error="(e) => { (e.target as HTMLImageElement).src = `/armor/slot-${singlePiece.type}.png` }"
      />
    </template>

    <!-- Set com múltiplas peças: foto do set completo com fallback em grade -->
    <template v-else>
      <img
        v-show="!setImgFailed"
        :src="armorSetImageUrl(set.id)"
        :alt="set.name"
        class="asc__set-img"
        loading="lazy"
        @error="setImgFailed = true"
      />

      <div
        v-show="setImgFailed"
        class="asc__pieces-grid"
        :class="gridClass"
      >
        <img
          v-for="piece in set.pieces"
          :key="piece.id"
          :src="`/armor/pieces/${piece.id}.png`"
          :alt="piece.type"
          class="asc__piece"
          loading="lazy"
          @error="(e) => { (e.target as HTMLImageElement).src = `/armor/slot-${piece.type}.png` }"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.asc__wrap {
  width: 100%;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

/* Fundo neutro uniforme para todos os ranks */
.asc__wrap--lr,
.asc__wrap--hr,
.asc__wrap--mr { background: var(--surface-2); }

/* Foto do set */
.asc__set-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Fallback: grade de peças */
.asc__pieces-grid {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  padding: 8px;
  align-items: center;
}

/* 1 peça: cobre todo o espaço */
.asc__pieces-grid--single {
  grid-template-columns: 1fr;
  padding: 4px;
}

.asc__pieces-grid--single .asc__piece {
  object-fit: cover !important;
  opacity: 1;
}

/* 2-4 peças: 2 colunas */
.asc__pieces-grid--two-col {
  grid-template-columns: repeat(2, 1fr);
}

.asc__piece {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: .9;
}
</style>
