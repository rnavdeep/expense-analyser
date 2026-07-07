import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Vuetify styles and icons
import '@mdi/font/css/materialdesignicons.css' // Import MDI Icons

// Import aliases and mdi icon set
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const savedTheme = localStorage.getItem('ea-theme') ?? 'light'

// Keep body background in sync so the margin-less edges match the theme
const syncBodyBg = (t: string) => {
  document.body.style.backgroundColor = t === 'dark' ? '#0f1117' : '#faf9f6'
}
syncBodyBg(savedTheme)

// Create Vuetify instance
const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi }
  },
  components,
  directives,
  theme: {
    defaultTheme: savedTheme,
    themes: {
      light: {
        colors: {
          primary:    '#1a1d28',
          secondary:  '#2f9e6f',
          error:      '#dc2626',
          success:    '#16a34a',
          surface:    '#ffffff',
          background: '#faf9f6',
          nav:        '#1a1d28',
        }
      },
      dark: {
        dark: true,
        colors: {
          primary:    '#3bc47a',
          secondary:  '#3bc47a',
          error:      '#ef4444',
          success:    '#22c55e',
          surface:    '#1c1f2e',
          background: '#0f1117',
          nav:        '#1a1d28',
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

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
