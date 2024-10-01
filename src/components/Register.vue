<template>
  <div class="register-container">
    <h1>Register</h1>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="formData.username" required />
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="formData.email" required />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" v-model="formData.password" required />
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirm Password:</label>
        <input type="password" id="confirmPassword" v-model="formData.confirmPassword" required />
      </div>
      <div class="button-group">
        <button type="submit" class="btn submit-btn">Submit</button>
        <router-link to="/login">
          <button class="btn login-btn">Login</button>
        </router-link>
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
import { type RegisterData } from '@/models/RegisterData'
import { useRouter } from 'vue-router'
import AuthService from '@/services/AuthService'
import { RegisterRequestDto } from '@/models/RegisterData'
import EncryptionService from '@/services/EncryptionService'
export default defineComponent({
  name: 'eaRegister',
  setup() {
    const formData = ref<RegisterData>({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    })

    const errorMessage = ref('')
    const successMessage = ref('')
    const router = useRouter()

    const validatePassword = (password: string): boolean => {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      return passwordRegex.test(password)
    }

    const handleRegister = async () => {
      if (formData.value.password !== formData.value.confirmPassword) {
        errorMessage.value = 'Passwords do not match!'
        return
      }
      if (formData.value.username !== formData.value.email) {
        errorMessage.value = 'Username should be same as Email'
        return
      }
      //add password validation
      if (validatePassword(formData.value.password)) {
        errorMessage.value = 'Invalid  password'
        return
      }
      const registerRequest = new RegisterRequestDto(
        formData.value.email,
        formData.value.password,
        ['Reader', 'Writer']
      )

      try {
        const encryptedData = EncryptionService.encrypt(registerRequest)
        await AuthService.Register(encryptedData)

        // Clear fields after successful registration
        formData.value.username = ''
        formData.value.email = ''
        formData.value.password = ''
        formData.value.confirmPassword = ''
        errorMessage.value = ''
        successMessage.value = 'Registration successful! Redirecting...'

        // Redirect to the homepage
        setTimeout(() => {
          router.push('/')
        }, 2000) // Delay for user to see the success message
      } catch (error) {
        // Handle unknown error
        if (error instanceof Error) {
          errorMessage.value = error.message || 'Registration failed. Please try again.'
        } else {
          errorMessage.value = 'An unexpected error occurred'
        }
      }
    }

    return {
      formData,
      errorMessage,
      successMessage,
      handleRegister
    }
  }
})
</script>

<style scoped>
.register-container {
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

.login-btn {
  background-color: #3498db;
  color: white;
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
