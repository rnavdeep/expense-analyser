<template>
  <div class="register-page">
    <div class="register-brand">
      <div class="brand-inner">
        <div class="brand-logo-mark"></div>
        <h2 class="brand-heading">Start in under<br>a minute.</h2>
        <p class="brand-sub">Upload a receipt, share the cost, and settle up — all from one place.</p>
      </div>
    </div>
    <div class="register-form-panel">
    <div class="register-card">

      <div class="logo-mark" aria-hidden="true"></div>

      <h1 class="register-heading">Create account</h1>
      <p class="register-sub">Start tracking in under a minute.</p>

      <v-form @submit.prevent="handleRegister" ref="form" class="register-form">
        <v-text-field
          label="Username"
          v-model="formData.username"
          autocomplete="username"
          required
        />
        <v-text-field
          label="Email"
          v-model="formData.email"
          type="email"
          autocomplete="email"
          required
        />
        <v-text-field
          label="Password"
          v-model="formData.password"
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
          autocomplete="new-password"
          required
        />

        <!-- Password strength meter -->
        <div v-if="formData.password" class="strength-meter">
          <div class="strength-bars">
            <div
              v-for="i in 4"
              :key="i"
              class="strength-bar"
              :class="{ active: i <= passwordStrength }"
            ></div>
          </div>
          <span class="strength-label">{{ strengthLabel }}</span>
        </div>

        <v-text-field
          label="Confirm Password"
          v-model="formData.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showConfirmPassword = !showConfirmPassword"
          :error-messages="confirmError"
          autocomplete="new-password"
          required
        />

        <v-btn
          type="submit"
          color="primary"
          size="large"
          block
          class="submit-btn"
        >
          Create account
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

      <p class="login-link">
        Already have one?
        <router-link to="/login">Log in</router-link>
      </p>
    </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { type RegisterData } from '../models/RegisterData'
import { useRouter } from 'vue-router'
import AuthService from '../services/AuthService'
import { RegisterRequestDto } from '../models/RegisterData'

export default defineComponent({
  name: 'eaRegister',
  setup() {
    const formData = ref<RegisterData>({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      roles: []
    })

    const roles = ref(['Reader', 'Writer', 'Editor', 'Admin'])
    const errorMessage = ref('')
    const successMessage = ref('')
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const router = useRouter()

    const passwordStrength = computed(() => {
      const p = formData.value.password
      if (!p) return 0
      let score = 0
      if (p.length >= 8) score++
      if (/[A-Z]/.test(p)) score++
      if (/\d/.test(p)) score++
      if (/[@$!%*?&]/.test(p)) score++
      return score
    })

    const strengthLabel = computed(() => {
      const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
      return labels[passwordStrength.value] ?? ''
    })

    const confirmError = computed(() => {
      if (!formData.value.confirmPassword) return ''
      return formData.value.password !== formData.value.confirmPassword
        ? 'Passwords do not match'
        : ''
    })

    const handleRegister = async () => {
      if (formData.value.password !== formData.value.confirmPassword) {
        errorMessage.value = 'Passwords do not match!'
        return
      }

      const registerRequest = new RegisterRequestDto(
        formData.value.username,
        formData.value.password,
        formData.value.email,
        formData.value.roles
      )

      try {
        await AuthService.Register(registerRequest)
        formData.value.username = ''
        formData.value.email = ''
        formData.value.password = ''
        formData.value.confirmPassword = ''
        formData.value.roles = []
        errorMessage.value = ''
        successMessage.value = 'Registration successful! Redirecting...'
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } catch (error) {
        if (error instanceof Error) {
          errorMessage.value = error.message || 'Registration failed. Please try again.'
        } else {
          errorMessage.value = 'An unexpected error occurred'
        }
      }
    }

    return {
      formData,
      roles,
      errorMessage,
      successMessage,
      showPassword,
      showConfirmPassword,
      passwordStrength,
      strengthLabel,
      confirmError,
      handleRegister
    }
  }
})
</script>

<style scoped>
.register-page {
  min-height: calc(100vh - 64px);
  display: flex;
  width: 100%;
}

/* Left brand panel */
.register-brand {
  flex: 1;
  background: var(--ea-nav);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 48px;
}

.brand-inner {
  max-width: 420px;
}

.brand-logo-mark {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #6366f1;
  margin-bottom: 40px;
  position: relative;
}
.brand-logo-mark::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: var(--ea-nav);
}

.brand-heading {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: clamp(28px, 3vw, 40px);
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: #ffffff;
  margin-bottom: 20px;
}

.brand-sub {
  font-size: 16px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.65);
}

/* Right form panel */
.register-form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ea-paper);
  padding: 40px 48px;
  overflow-y: auto;
}

.register-card {
  width: 100%;
  max-width: 480px;
  background: var(--ea-surface);
  border-radius: 18px;
  border: 1px solid var(--ea-border);
  padding: 48px 44px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  border-top: 6px solid #6366f1;
}

@media (max-width: 768px) {
  .register-page { flex-direction: column; }
  .register-brand { padding: 40px 24px; flex: none; }
  .register-form-panel { padding: 32px 24px; }
}

.logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--ea-nav);
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
  background: #6366f1;
}

.register-heading {
  font-family: var(--ea-display);
  font-weight: 600;
  font-size: 30px;
  letter-spacing: -0.02em;
  color: var(--ea-ink);
  margin-bottom: 6px;
}

.register-sub {
  font-size: 15px;
  color: var(--ea-muted);
  margin-bottom: 30px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.strength-meter {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: -8px;
  margin-bottom: 8px;
}

.strength-bars {
  display: flex;
  gap: 5px;
  flex: 1;
}

.strength-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--ea-border);
  transition: background 0.2s;
}

.strength-bar.active {
  background: var(--ea-emerald);
}

.strength-label {
  font-family: var(--ea-mono);
  font-size: 11px;
  color: var(--ea-muted);
  white-space: nowrap;
}

.submit-btn {
  margin-top: 8px;
  font-size: 16px !important;
  height: 50px !important;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: var(--ea-muted);
  margin-top: 24px;
}
.login-link a {
  color: var(--ea-emerald);
  font-weight: 600;
  text-decoration: none;
}
.login-link a:hover { text-decoration: underline; }
</style>
