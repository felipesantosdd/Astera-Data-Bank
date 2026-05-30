<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import AppIntro from '@/components/AppIntro.vue'
import LanguagePicker from '@/components/LanguagePicker.vue'
import { useUI } from '@/composables/useUI'

const { t } = useUI()
const route = useRoute()
const router = useRouter()
const menuOpen = ref(false)
const showIntro = ref(true)
const scrollPositions = new Map<string, number>()

function closeMenu() { menuOpen.value = false }

function routeKey(path = route.fullPath) {
  return path
}

function saveCurrentScroll() {
  scrollPositions.set(routeKey(), window.scrollY)
}

const removeBeforeGuard = router.beforeEach((_to, from) => {
  scrollPositions.set(from.fullPath, window.scrollY)
})

const removeAfterHook = router.afterEach(async (to) => {
  await nextTick()
  requestAnimationFrame(() => {
    window.scrollTo({ top: scrollPositions.get(to.fullPath) ?? 0, behavior: 'instant' })
  })
})

window.addEventListener('beforeunload', saveCurrentScroll)

onBeforeUnmount(() => {
  saveCurrentScroll()
  removeBeforeGuard()
  removeAfterHook()
  window.removeEventListener('beforeunload', saveCurrentScroll)
})
</script>

<template>
  <AppIntro v-if="showIntro" @finished="showIntro = false" />

  <div class="app-shell">

    <!-- Navbar -->
    <nav class="navbar">
      <RouterLink to="/" class="navbar__brand" @click="closeMenu">
        <span class="navbar__brand-text">Astera</span>
        <span class="navbar__brand-sub">Data Bank</span>
      </RouterLink>

      <!-- Links desktop -->
      <div class="navbar__right navbar__right--desktop">
        <RouterLink to="/monsters"  class="navbar__link" active-class="navbar__link--active">{{ t.nav.monsters }}</RouterLink>
        <RouterLink to="/materials" class="navbar__link" active-class="navbar__link--active">{{ t.nav.materials }}</RouterLink>
        <RouterLink to="/decorations" class="navbar__link" active-class="navbar__link--active">{{ t.nav.decorations }}</RouterLink>
        <RouterLink to="/equipment" class="navbar__link" active-class="navbar__link--active">{{ t.nav.equipment }}</RouterLink>
        <RouterLink to="/regions"   class="navbar__link" active-class="navbar__link--active">{{ t.nav.regions }}</RouterLink>
        <RouterLink to="/planner"   class="navbar__link" active-class="navbar__link--active">{{ t.nav.planner }}</RouterLink>
        <LanguagePicker />
      </div>

      <!-- Mobile: language + hamburger -->
      <div class="navbar__mobile-controls">
        <LanguagePicker />
        <button
          class="navbar__hamburger"
          :class="{ 'navbar__hamburger--open': menuOpen }"
          aria-label="Menu"
          @click="menuOpen = !menuOpen"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>

    <!-- Menu mobile -->
    <Transition name="slide-down">
      <div v-if="menuOpen" class="mobile-menu">
        <RouterLink to="/monsters"  class="mobile-menu__link" active-class="mobile-menu__link--active" @click="closeMenu">{{ t.nav.monsters }}</RouterLink>
        <RouterLink to="/materials" class="mobile-menu__link" active-class="mobile-menu__link--active" @click="closeMenu">{{ t.nav.materials }}</RouterLink>
        <RouterLink to="/decorations" class="mobile-menu__link" active-class="mobile-menu__link--active" @click="closeMenu">{{ t.nav.decorations }}</RouterLink>
        <RouterLink to="/equipment" class="mobile-menu__link" active-class="mobile-menu__link--active" @click="closeMenu">{{ t.nav.equipment }}</RouterLink>
        <RouterLink to="/regions"   class="mobile-menu__link" active-class="mobile-menu__link--active" @click="closeMenu">{{ t.nav.regions }}</RouterLink>
        <RouterLink to="/planner"   class="mobile-menu__link" active-class="mobile-menu__link--active" @click="closeMenu">{{ t.nav.planner }}</RouterLink>
      </div>
    </Transition>

    <main class="app-content">
      <RouterView v-slot="{ Component }">
        <KeepAlive>
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </main>

  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Navbar ── */
.navbar {
  position: sticky;
  top: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  background: rgba(12, 11, 9, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
}

.navbar__brand {
  display: flex;
  align-items: baseline;
  gap: 6px;
  text-decoration: none;
}

.navbar__brand-text {
  font-family: var(--font-heading);
  font-size: 18px;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: 0.05em;
}

.navbar__brand-sub {
  font-family: var(--font-heading);
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* ── Desktop links ── */
.navbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.navbar__link {
  font-family: var(--font-heading);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 8px 14px;
  border-radius: 6px;
  border: 1px solid transparent;
  transition: color 0.2s, border-color 0.2s;
  white-space: nowrap;
}

.navbar__link:hover         { color: var(--text); border-color: var(--border); }
.navbar__link--active       { color: var(--gold); border-color: var(--gold); background: var(--gold-glow); }

/* ── Mobile controls (hamburger + lang) ── */
.navbar__mobile-controls {
  display: none;
  align-items: center;
  gap: 8px;
}

/* ── Hamburger ── */
.navbar__hamburger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 44px;
  height: 44px;
  padding: 10px;
  background: none;
  border: none;
  cursor: pointer;
}

.navbar__hamburger span {
  display: block;
  height: 2px;
  background: var(--text-muted);
  border-radius: 1px;
  transition: transform 0.2s, opacity 0.2s;
}

.navbar__hamburger--open span:nth-child(1) { transform: translateY(7px) rotate(45deg); background: var(--gold); }
.navbar__hamburger--open span:nth-child(2) { opacity: 0; }
.navbar__hamburger--open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); background: var(--gold); }

/* ── Mobile menu dropdown ── */
.mobile-menu {
  position: sticky;
  top: 56px;
  z-index: 199;
  background: rgba(12, 11, 9, 0.98);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
}

.mobile-menu__link {
  font-family: var(--font-heading);
  font-size: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  transition: color 0.15s, background 0.15s;
}

.mobile-menu__link:last-child { border-bottom: none; }
.mobile-menu__link:hover            { color: var(--text); background: var(--surface); }
.mobile-menu__link--active          { color: var(--gold); background: var(--gold-glow); }

/* ── Transição menu ── */
.slide-down-enter-active, .slide-down-leave-active { transition: max-height 0.25s ease, opacity 0.2s; max-height: 300px; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to       { max-height: 0; opacity: 0; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .navbar__right--desktop { display: none; }
  .navbar__mobile-controls { display: flex; }
  .navbar { padding: 0 16px; }
}

/* ── Conteúdo ── */
.app-content { flex: 1; }
</style>
