<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits<{
  finished: []
}>()

const visible = ref(true)
const activeWord = ref(0)
const words = ['Planeje', 'cace', 'evolua']

const largeMonsterIds = [
  31, 24, 43, 44, 132, 119, 120, 118,
  125, 146, 144, 138, 38, 37, 30, 41,
  29, 49, 32, 23, 36, 116, 128, 131,
]

interface IconEntry {
  id: number
  // posição final (dentro da tela)
  tx: number
  ty: number
  // posição inicial (fora da tela, em uma borda)
  sx: number
  sy: number
  rotate: number
  delay: number
  duration: number
  size: number
}

const monsterIcons = ref<IconEntry[]>([])
const timers: number[] = []

function randomEdgeStart(vw: number, vh: number): { sx: number; sy: number } {
  const edge = Math.floor(Math.random() * 4) // 0=top 1=right 2=bottom 3=left
  switch (edge) {
    case 0: return { sx: Math.random() * 140 - 20, sy: -30 }
    case 1: return { sx: 110 + Math.random() * 20, sy: Math.random() * 120 - 10 }
    case 2: return { sx: Math.random() * 140 - 20, sy: 110 + Math.random() * 20 }
    default: return { sx: -30, sy: Math.random() * 120 - 10 }
  }
}

function finishIntro() {
  visible.value = false
  timers.push(window.setTimeout(() => emit('finished'), 520))
}

onMounted(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const vw = window.innerWidth
  const vh = window.innerHeight

  // Quantidade baseada no tamanho da tela: cobre ~4x a área
  const avgSize = 200
  const count = Math.min(Math.ceil((vw * vh * 4) / (avgSize * avgSize)), 100)

  monsterIcons.value = Array.from({ length: count }, (_, i) => {
    const { sx, sy } = randomEdgeStart(vw, vh)
    return {
      id: largeMonsterIds[Math.floor(Math.random() * largeMonsterIds.length)],
      tx: Math.random() * 100,
      ty: Math.random() * 100,
      sx,
      sy,
      rotate: Math.random() * 30 - 15,
      delay: Math.random() * 600,
      duration: 500 + Math.random() * 700,
      size: 140 + Math.random() * 180,
    }
  })

  if (prefersReducedMotion) {
    timers.push(window.setTimeout(finishIntro, 900))
    return
  }

  // Palavras começam depois que a maioria dos ícones chegou (~900ms)
  words.forEach((_, index) => {
    timers.push(window.setTimeout(() => {
      activeWord.value = index
    }, 900 + index * 820))
  })

  timers.push(window.setTimeout(finishIntro, 3900))
})

onBeforeUnmount(() => {
  for (const timer of timers) window.clearTimeout(timer)
})
</script>

<template>
  <div class="intro" :class="{ 'intro--leaving': !visible }">
    <div class="intro__icons" aria-hidden="true">
      <img
        v-for="(icon, index) in monsterIcons"
        :key="`${icon.id}-${index}`"
        class="intro__icon"
        :src="`/monsters/${icon.id}.png`"
        alt=""
        :style="{
          '--tx': `${icon.tx}%`,
          '--ty': `${icon.ty}%`,
          '--sx': `${icon.sx}%`,
          '--sy': `${icon.sy}%`,
          '--rotate': `${icon.rotate}deg`,
          '--delay': `${icon.delay}ms`,
          '--duration': `${icon.duration}ms`,
          '--size': `${icon.size}px`,
        }"
      >
    </div>

    <div class="intro__vignette" />

    <div class="intro__copy" aria-live="polite">
      <span
        v-for="(word, index) in words"
        :key="word"
        class="intro__word"
        :class="{ 'intro__word--active': activeWord === index }"
      >
        {{ word }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.intro {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #050403;
  opacity: 1;
  transition: opacity 0.5s ease, visibility 0.5s ease;
}

.intro--leaving {
  opacity: 0;
  visibility: hidden;
}

.intro__icons {
  position: absolute;
  inset: 0;
  /* Fundo marrom escuro: gaps entre monstros parecem sombra, não buraco negro */
  background: #120d06;
}

.intro__icon {
  position: absolute;
  left: var(--tx);
  top: var(--ty);
  width: var(--size);
  height: var(--size);
  object-fit: contain;
  transform-origin: center center;
  /* começa fora da tela */
  transform: translate(calc(var(--sx) - var(--tx)), calc(var(--sy) - var(--ty))) rotate(var(--rotate));
  opacity: 0;
  filter:
    drop-shadow(0 0 12px rgba(196, 154, 42, 0.15))
    brightness(0.75)
    saturate(0.6);
  animation: intro-fly-in var(--duration) cubic-bezier(0.22, 0.8, 0.36, 1) var(--delay) forwards;
}

.intro__vignette {
  position: absolute;
  inset: 0;
  /* Vignette nas bordas + mancha no centro para destacar o texto */
  background:
    radial-gradient(ellipse 50% 40% at center, rgba(5, 4, 3, 0.55) 0%, transparent 100%),
    radial-gradient(ellipse 100% 100% at center, transparent 40%, rgba(5, 4, 3, 0.7) 100%);
  pointer-events: none;
}

.intro__copy {
  position: relative;
  z-index: 1;
  width: min(900px, calc(100vw - 48px));
  height: clamp(82px, 16vw, 172px);
}

.intro__word {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-family: var(--font-heading);
  font-size: clamp(54px, 13vw, 154px);
  font-weight: 700;
  line-height: 1;
  color: var(--gold-light);
  letter-spacing: 0;
  text-transform: uppercase;
  opacity: 0;
  transform: translateY(24px) scale(0.96);
  text-shadow:
    0 0 30px rgba(196, 154, 42, 0.5),
    0 0 60px rgba(196, 154, 42, 0.2),
    0 4px 24px rgba(0, 0, 0, 1),
    0 12px 40px rgba(0, 0, 0, 0.9);
  transition: opacity 0.22s ease, transform 0.32s ease;
}

.intro__word--active {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@keyframes intro-fly-in {
  0% {
    opacity: 0;
    transform: translate(calc(var(--sx) - var(--tx)), calc(var(--sy) - var(--ty))) rotate(var(--rotate)) scale(0.6);
  }

  15% {
    opacity: 0.75;
  }

  100% {
    opacity: 0.55;
    transform: translate(0, 0) rotate(var(--rotate)) scale(1);
  }
}

@media (max-width: 640px) {
  .intro__copy {
    width: calc(100vw - 32px);
  }

  .intro__icon {
    width: calc(var(--size) * 0.7);
    height: calc(var(--size) * 0.7);
  }
}

@media (prefers-reduced-motion: reduce) {
  .intro {
    transition-duration: 0.2s;
  }

  .intro__icons {
    display: none;
  }

  .intro__word {
    transition-duration: 0.12s;
  }
}
</style>
