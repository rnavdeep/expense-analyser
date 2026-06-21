# Redesign Plan — Home & Login Pages
**Expense Analyser · Vue 3 + Vuetify**  
Based on `Expense Analyser Redesign.dc.html` mockups

---

## Overview

Two files are being redesigned. A shared foundation (fonts + Vuetify theme) must be set up first — it takes effect globally and makes the rest of the work easier.

| Step | File | Effort |
|---|---|---|
| 0 | Foundation: fonts + Vuetify theme | ~15 min |
| 1 | `src/components/Home.vue` | ~45 min |
| 2 | `src/components/Login.vue` | ~20 min |
| Bonus | `src/components/Register.vue` | ~20 min |

---

## Step 0 — Foundation (do this first)

### 0a. Add fonts — `index.html`

Add inside `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Hanken+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
```

### 0b. Update `src/assets/base.css`

Replace the `font-family` line in `body {}`:

```css
/* BEFORE */
font-family: Inter, -apple-system, BlinkMacSystemFont, ...

/* AFTER */
font-family: 'Hanken Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
```

Also add these CSS variables to `:root`:

```css
:root {
  /* Design system tokens */
  --ea-ink:        #1a1d28;   /* nav background, primary buttons */
  --ea-emerald:    #2f9e6f;   /* CTAs, active states, accents */
  --ea-paper:      #faf9f6;   /* page background */
  --ea-surface:    #ffffff;   /* cards */
  --ea-border:     #e8e5df;   /* card borders */
  --ea-muted:      #6b7280;   /* secondary text */
  --ea-mono:       'Space Mono', monospace;
  --ea-display:    'Space Grotesk', sans-serif;
}
```

### 0c. Configure Vuetify theme — `src/main.ts`

Replace the `createVuetify({...})` call:

```ts
const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi }
  },
  components,
  directives,
  theme: {
    themes: {
      light: {
        colors: {
          primary:    '#1a1d28',   // ink — used by v-btn color="primary"
          secondary:  '#2f9e6f',   // emerald — used by v-btn color="secondary"
          error:      '#dc2626',
          success:    '#16a34a',
          surface:    '#ffffff',
          background: '#faf9f6',
        }
      }
    }
  },
  defaults: {
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VBtn: {
      style: "font-family: 'Hanken Grotesk', sans-serif; font-weight: 700; text-transform: none; letter-spacing: 0;",
      rounded: 'lg',
    },
    VCard: {
      rounded: 'lg',
      elevation: 0,
    }
  }
})
```

> **Why:** This means every `color="primary"` button across the whole app now uses the ink color automatically. No per-component overrides needed.

---

## Step 1 — `src/components/Home.vue`

### What's wrong now
| Issue | Location |
|---|---|
| No `<h1>` — commented out | `hero-section` |
| Hero is a wall of text, no visual hierarchy | `hero-section` |
| Feature cards are dark grey `#494a50` — illegible | `.feature-card` |
| Buttons are raw `<button>` tags, not Vuetify | `.button-group` |
| Testimonials are unstyled placeholder text | `.testimonials-section` |
| `<img>` icons from assets but no fallback if missing | `features-grid` |

### Logic to preserve (do not touch)
```ts
// Keep this exactly as-is
const isUserLoggedIn = computed(() => authStore.isAuthenticated)
```

### New template structure

Replace the entire `<template>` block:

```vue
<template>
  <div class="home-container">

    <!-- ── HERO ── -->
    <section class="hero-section">
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
          <v-btn color="secondary" size="large">View my expenses</v-btn>
        </router-link>
      </div>
    </section>

    <!-- ── FEATURES ── -->
    <section class="features-section">
      <h2 class="section-heading">Everything in one place</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <v-icon size="28" color="secondary">mdi-receipt-text-outline</v-icon>
          </div>
          <h3>Upload bills</h3>
          <p>Drop in any image or PDF of a receipt — all your bills organised in one place.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <v-icon size="28" color="secondary">mdi-text-recognition</v-icon>
          </div>
          <h3>Process receipts</h3>
          <p>AWS Textract extracts totals, dates and line items automatically — no typing.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <v-icon size="28" color="secondary">mdi-account-group-outline</v-icon>
          </div>
          <h3>Share expenses</h3>
          <p>Split costs with friends and track who owes what — live notifications keep everyone in sync.</p>
        </div>
      </div>
    </section>

  </div>
</template>
```

> **Note:** Testimonials removed — placeholder quotes add no value. If real testimonials exist later, add them back.

### New styles

Replace the entire `<style scoped>` block:

```css
<style scoped>
/* ── Layout ── */
.home-container {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* ── Hero ── */
.hero-section {
  background-color: var(--ea-ink);
  color: #ffffff;
  padding: 96px 40px 104px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.hero-eyebrow {
  font-family: var(--ea-mono);
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #6ee7b7;       /* emerald light */
  margin-bottom: 24px;
}

.hero-heading {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: clamp(36px, 5vw, 56px);
  line-height: 1.06;
  letter-spacing: -0.025em;
  margin: 0 0 22px;
  max-width: 760px;
}

.hero-sub {
  font-size: 18px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.72);
  max-width: 580px;
  margin: 0 0 36px;
}

.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
}

.cta-primary {
  background-color: var(--ea-emerald) !important;
  color: var(--ea-ink) !important;
  font-weight: 700 !important;
}

.cta-secondary {
  border-color: rgba(255,255,255,0.35) !important;
  color: rgba(255,255,255,0.9) !important;
}

/* ── Features ── */
.features-section {
  padding: 80px 40px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.section-heading {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 34px;
  letter-spacing: -0.02em;
  color: var(--ea-ink);
  text-align: center;
  margin-bottom: 40px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.feature-card {
  border: 1px solid var(--ea-border);
  border-radius: 16px;
  padding: 28px;
  background: var(--ea-surface);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.feature-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #ecfdf5;   /* emerald tint */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.feature-card h3 {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 18px;
  color: var(--ea-ink);
  margin-bottom: 8px;
}

.feature-card p {
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--ea-muted);
  margin: 0;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .hero-section { padding: 64px 24px 72px; }
  .hero-heading { font-size: 32px; }
  .hero-sub { font-size: 16px; }
  .features-section { padding: 56px 24px; }
  .features-grid { grid-template-columns: 1fr; }
}
</style>
```

---

## Step 2 — `src/components/Login.vue`

### What's wrong now
| Issue | Location |
|---|---|
| Card floats at 750px with no page centering feel | `.login-container` |
| 3 buttons (Submit, Home, Forgot Password) in a row — confusing hierarchy | `.button-group` |
| "Home" button on a login page — unnecessary | `<router-link to="/">` |
| No link to Register | — |
| No accent / visual identity | — |

### Logic to preserve (do not touch)
```ts
// Keep entire <script lang="ts"> block exactly as-is
// formData, handlelogin, errorMessage, successMessage, router, authStore
```

### New template

Replace the entire `<template>` block:

```vue
<template>
  <div class="login-page">
    <div class="login-card">

      <!-- Logo mark -->
      <div class="logo-mark"></div>

      <h1 class="login-heading">Welcome back</h1>
      <p class="login-sub">Log in to manage your expenses.</p>

      <v-form @submit.prevent="handlelogin" class="login-form">
        <v-text-field
          label="Username"
          v-model="formData.username"
          autocomplete="username"
          required
        />
        <v-text-field
          label="Password"
          v-model="formData.password"
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
          autocomplete="current-password"
          required
        />

        <div class="forgot-row">
          <router-link to="/forgotPassword" class="forgot-link">Forgot password?</router-link>
        </div>

        <v-btn
          type="submit"
          color="primary"
          size="large"
          block
          class="submit-btn"
        >
          Log in
        </v-btn>
      </v-form>

      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        closable
        class="mt-4"
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <v-alert
        v-if="successMessage"
        type="success"
        variant="tonal"
        class="mt-4"
      >
        {{ successMessage }}
      </v-alert>

      <p class="register-link">
        New here?
        <router-link to="/register">Create an account</router-link>
      </p>
    </div>
  </div>
</template>
```

Add `showPassword` to the script — add one line inside `setup()`:

```ts
// Add this inside setup(), alongside the existing refs:
const showPassword = ref(false)

// Add to return object:
return {
  formData,
  errorMessage,
  successMessage,
  handlelogin,
  showPassword,   // ← add this
}
```

### New styles

Replace the entire `<style scoped>` block:

```css
<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ea-paper);
  padding: 24px;
}

.login-card {
  width: 100%;
  max-width: 460px;
  background: var(--ea-surface);
  border-radius: 18px;
  border: 1px solid var(--ea-border);
  padding: 48px 44px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  /* Emerald top accent stripe */
  border-top: 6px solid var(--ea-emerald);
}

.logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--ea-ink);
  margin-bottom: 28px;
  position: relative;
}
.logo-mark::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 11px;
  height: 11px;
  border-radius: 3px;
  background: var(--ea-emerald);
}

.login-heading {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 30px;
  letter-spacing: -0.02em;
  color: var(--ea-ink);
  margin-bottom: 6px;
}

.login-sub {
  font-size: 15px;
  color: var(--ea-muted);
  margin-bottom: 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.forgot-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.forgot-link {
  font-size: 13px;
  font-weight: 600;
  color: var(--ea-emerald);
  text-decoration: none;
}
.forgot-link:hover { text-decoration: underline; }

.submit-btn {
  margin-top: 8px;
  font-size: 16px !important;
  height: 50px !important;
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: var(--ea-muted);
  margin-top: 24px;
}
.register-link a {
  color: var(--ea-emerald);
  font-weight: 600;
  text-decoration: none;
}
.register-link a:hover { text-decoration: underline; }
</style>
```

---

## Step 3 (Bonus) — `src/components/Register.vue`

### What's wrong now
| Issue | Location |
|---|---|
| Role selector exposed to end users — confusing UX | `v-autocomplete roles` |
| No confirm-password visual feedback | — |
| Matches no visual style | — |

### Quick wins
1. **Remove the roles field** from the template (keep the logic if needed for API) — users shouldn't pick their own roles.
2. Apply the same `.login-card` pattern (same CSS class reuse).
3. Add a password-match inline error under "Confirm Password".

---

## Testing checklist

After making changes, verify:

- [ ] `npm run dev` starts with no errors
- [ ] Home hero shows dark background with white text
- [ ] Feature cards are white with border (not dark grey)
- [ ] Login page is centered, single card, green accent stripe
- [ ] Login form shows/hides password on eye icon click
- [ ] Login success still redirects to `/`
- [ ] Login error message still appears on bad credentials
- [ ] "Create an account" link on login goes to `/register`
- [ ] Vuetify buttons across the app picked up the new `primary` color

---

## Design reference

Open `assets/mockups/Expense Analyser Redesign.dc.html` (relative to the skill root) in the project preview to inspect exact spacing, colors and typography on any element using browser DevTools. See [design-system.md](design-system.md) for the consolidated token reference.

Key values quick-reference:
| Token | Value | Usage |
|---|---|---|
| Ink | `#1a1d28` | Nav, headings, primary buttons |
| Emerald | `#2f9e6f` | CTAs, active links, accents |
| Paper | `#faf9f6` | Page background |
| Border | `#e8e5df` | Card borders, dividers |
| Mono font | `Space Mono` | Amounts, labels, codes |
| Display font | `Space Grotesk` | Headings, nav |
| Body font | `Hanken Grotesk` | All body text |
