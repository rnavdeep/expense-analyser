<template>
  <div class="login-page">
    <div class="login-brand">
      <div class="brand-inner">
        <div class="brand-logo-mark"></div>
        <h2 class="brand-heading">Track every expense.<br>Split every bill.</h2>
        <p class="brand-sub">Snap a receipt and let AWS Textract do the rest — clean data, shared instantly.</p>
      </div>
    </div>
    <div class="login-form-panel">
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
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { type LoginData, LoginDataDto } from '../models/LoginData'
import { useAuthStore } from '../stores/Auth'

export default defineComponent({
  name: 'eaLogin',
  setup() {
    const formData = ref<LoginData>({
      username: '',
      password: ''
    })

    const errorMessage = ref('')
    const successMessage = ref('')
    const showPassword = ref(false)
    const router = useRouter()
    const authStore = useAuthStore()

    const handlelogin = async () => {
      try {
        errorMessage.value = ''

        await authStore.login(new LoginDataDto(formData.value.username, formData.value.password))
        if (authStore.loginResponse?.isLoggedIn) {
          formData.value.username = ''
          formData.value.password = ''
          successMessage.value = 'Login successful! Redirecting to your dashboard....'
          errorMessage.value = ''

          router.push('/dashboard')
        } else {
          errorMessage.value = authStore.loginResponse.errors
        }
      } catch (error) {
        // Handle unknown error
        if (error instanceof Error) {
          errorMessage.value = 'Unexpected Error'
        }
      }
    }

    return {
      formData,
      errorMessage,
      successMessage,
      handlelogin,
      showPassword,
    }
  }
})
</script>

<style scoped>
.login-page {
  min-height: calc(100vh - 64px);
  display: flex;
  width: 100%;
}

/* Left brand panel */
.login-brand {
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
  background: var(--ea-emerald);
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
.login-form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ea-paper);
  padding: 40px 48px;
}

.login-card {
  width: 100%;
  max-width: 480px;
  background: var(--ea-surface);
  border-radius: 18px;
  border: 1px solid var(--ea-border);
  padding: 48px 44px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  border-top: 6px solid var(--ea-emerald);
}

@media (max-width: 768px) {
  .login-page { flex-direction: column; }
  .login-brand { padding: 40px 24px; flex: none; }
  .login-form-panel { padding: 32px 24px; }
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
