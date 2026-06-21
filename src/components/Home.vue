<template>
  <div class="home-container">

    <!-- ── HERO ── -->
    <section class="hero-section">
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="hero-content">
        <div class="hero-eyebrow">Expense Intelligence</div>
        <h1 class="hero-heading">
          Snap a receipt.<br>Get clean, shareable expense data.
        </h1>
        <p class="hero-sub">
          AWS Textract reads merchant, totals and line items automatically.
          Organise, split and settle with friends — with live updates.
        </p>
        <div v-if="!isUserLoggedIn" class="hero-actions">
          <router-link to="/register">
            <v-btn color="secondary" size="large" class="cta-primary">
              Get started — it's free
            </v-btn>
          </router-link>
          <router-link to="/login">
            <v-btn variant="outlined" size="large" class="cta-secondary">
              Log in
            </v-btn>
          </router-link>
        </div>
        <div v-else class="hero-actions">
          <router-link to="/myExpenses">
            <v-btn color="secondary" size="large" class="cta-primary">View my expenses</v-btn>
          </router-link>
        </div>
      </div>
    </section>

    <!-- ── FEATURES ── -->
    <section class="features-section">
      <h2 class="section-heading">Everything in one place</h2>
      <div class="features-grid">
        <div class="feature-card">
          <v-icon size="32" color="secondary" class="feature-icon">mdi-receipt-text-outline</v-icon>
          <h3>Upload bills</h3>
          <p>Drop in an image or PDF of any receipt — all your bills in one place.</p>
        </div>
        <div class="feature-card">
          <v-icon size="32" color="secondary" class="feature-icon">mdi-text-recognition</v-icon>
          <h3>Process receipts</h3>
          <p>Textract extracts totals and details — no manual typing.</p>
        </div>
        <div class="feature-card">
          <v-icon size="32" color="secondary" class="feature-icon">mdi-account-group-outline</v-icon>
          <h3>Share expense</h3>
          <p>Split costs with other users and track who owes what.</p>
        </div>
      </div>
    </section>

  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useAuthStore } from '../stores/Auth'

export default defineComponent({
  name: 'eaHome',
  setup() {
    const authStore = useAuthStore()
    const isUserLoggedIn = computed(() => authStore.isAuthenticated)
    return {
      ...authStore,
      isUserLoggedIn
    }
  }
})
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* ── Hero ── */
.hero-section {
  background-color: var(--ea-nav);
  color: #ffffff;
  padding: 64px 56px 72px;
  position: relative;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  top: -160px;
  right: -120px;
  width: 460px;
  height: 460px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(47, 158, 111, 0.28), transparent 62%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  max-width: 900px;
  width: 100%;
}

.hero-eyebrow {
  font-family: var(--ea-mono);
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #6ee7b7;
  margin-bottom: 22px;
}

.hero-heading {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: clamp(32px, 4vw, 46px);
  line-height: 1.05;
  letter-spacing: -0.025em;
  margin: 0 0 20px;
}

.hero-sub {
  font-size: 17px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.72);
  margin: 0 0 32px;
}

.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.cta-primary {
  background-color: var(--ea-emerald) !important;
  color: var(--ea-ink) !important;
  font-weight: 700 !important;
}

.cta-secondary {
  border-color: rgba(255, 255, 255, 0.35) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

/* ── Features ── */
.features-section {
  padding: 48px 56px 64px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.section-heading {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 28px;
  letter-spacing: -0.02em;
  color: var(--ea-ink);
  margin-bottom: 28px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 22px;
}

.feature-card {
  border: 1px solid var(--ea-border);
  border-radius: 14px;
  padding: 26px;
  background: var(--ea-surface);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.feature-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
}

.feature-icon {
  display: block;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 18px;
  color: var(--ea-ink);
  margin: 0 0 8px;
}

.feature-card p {
  font-size: 14px;
  line-height: 1.55;
  color: var(--ea-muted);
  margin: 0;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .hero-section { padding: 48px 24px 56px; }
  .features-section { padding: 40px 24px 48px; }
  .features-grid { grid-template-columns: 1fr; }
}
</style>
