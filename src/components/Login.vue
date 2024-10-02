<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="handlelogin">
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="formData.username" required />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="formData.password" required />
      </div>
      <div class="button-group">
        <button type="submit" class="btn submit-btn">Submit</button>
        <router-link to="/">
          <button class="btn home-btn">Home</button>
        </router-link>
      </div>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
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
        await authStore.login(formData.value.username, formData.value.password)
        if (authStore.loginResponse?.isLoggedIn) {
          formData.value.username = ''
          formData.value.password = ''
          // errorMessage.value = resp.jwtToken
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
  max-width: 4000px;
  width: 700px;
  margin-left: 300px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.button-group {
  display: flex;
  justify-content: center;
  gap: 20px;
}
.btn {
  padding: 10px 20px;
  font-size: 20px;
  cursor: pointer;
  border: #0a0909;
  border-radius: 10px;
}
.home-btn {
  background-color: green;
  color: white;
}
.btn:hover {
  transform: translateY(-2px); /* Lift effect on hover */
}

.error {
  color: red;
  text-align: center;
  margin-top: 10px;
}
.success {
  color: green;
  text-align: center;
  margin-top: 10px;
}
</style>
