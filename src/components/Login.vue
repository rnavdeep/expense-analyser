<template>
  <v-container class="login-container" fluid>
    <v-card>
      <v-card-title>
        <h1>Login</h1>
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handlelogin">
          <v-text-field label="Username" v-model="formData.username" required></v-text-field>
          <v-text-field
            label="Password"
            v-model="formData.password"
            type="password"
            required
          ></v-text-field>

          <div class="button-group">
            <v-btn type="submit" color="primary">Submit</v-btn>
            <router-link to="/">
              <v-btn color="green">Home</v-btn>
            </router-link>
            <router-link to="/forgotPassword">
              <v-btn color="red">Forgot Password?</v-btn>
            </router-link>
          </div>
        </v-form>
        <div class="alerts">
          <v-alert
            v-if="errorMessage"
            border="start"
            close-label="Close Alert"
            color="red"
            variant="tonal"
            closable
          >
            {{ errorMessage }}
          </v-alert>
          <v-alert v-if="successMessage" type="success" dismissible>
            {{ successMessage }}
          </v-alert>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { type LoginData } from '@/models/LoginData'
import { useAuthStore } from '@/stores/Auth'

export default defineComponent({
  name: 'eaLogin',
  setup() {
    const formData = ref<LoginData>({
      username: '',
      password: ''
    })

    const errorMessage = ref('')
    const successMessage = ref('')
    const router = useRouter()
    const authStore = useAuthStore()

    const handlelogin = async () => {
      try {
        errorMessage.value = ''

        await authStore.login(formData.value.username, formData.value.password)
        if (authStore.loginResponse?.isLoggedIn) {
          formData.value.username = ''
          formData.value.password = ''
          successMessage.value = 'Login successful! Redirecting to Home....'
          errorMessage.value = ''

          router.push('/')
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
      handlelogin
    }
  }
})
</script>

<style scoped>
.login-container {
  width: 750px;
  margin: auto;
  padding: 20px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin: 10px;
  align-content: center;
}

.alerts {
  margin-top: 10px;
}
</style>
