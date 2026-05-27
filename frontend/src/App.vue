<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import LanguagePicker from '@/components/LanguagePicker.vue'
import { useUI } from '@/composables/useUI'

const { t } = useUI()
</script>

<template>
  <div class="app-shell">

    <!-- Navbar -->
    <nav class="navbar">
      <RouterLink to="/" class="navbar__brand">
        <span class="navbar__brand-text">Astera</span>
        <span class="navbar__brand-sub">Data Bank</span>
      </RouterLink>

      <div class="navbar__right">
        <RouterLink to="/monsters" class="navbar__link" active-class="navbar__link--active">
          {{ t.nav.monsters }}
        </RouterLink>
        <LanguagePicker />
      </div>
    </nav>

    <!-- Conteúdo da página -->
    <main class="app-content">
      <RouterView />
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
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  background: rgba(12, 11, 9, 0.85);
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
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}

.navbar__link:hover,
.navbar__link--active {
  color: var(--gold);
  border-color: var(--border);
}

/* ── Conteúdo ── */
.app-content {
  flex: 1;
}
</style>
