<template>
  <v-container class="register-container">
    <h1>Register</h1>
    <v-form @submit.prevent="handleRegister" ref="form">
      <v-text-field label="Username" v-model="formData.username" required></v-text-field>

      <v-text-field label="Email" v-model="formData.email" required type="email"></v-text-field>

      <v-text-field
        label="Password"
        v-model="formData.password"
        required
        type="password"
      ></v-text-field>

      <v-text-field
        label="Confirm Password"
        v-model="formData.confirmPassword"
        required
        type="password"
      ></v-text-field>

      <v-autocomplete
        label="Roles"
        v-model="formData.roles"
        :items="roles"
        multiple
        required
        chips
        clearable
      ></v-autocomplete>

      <div class="button-group">
        <v-btn type="submit" class="submit-btn" color="primary">Submit</v-btn>
      </div>
    </v-form>

    <v-alert v-if="errorMessage" type="error" class="error" dismissible>
      {{ errorMessage }}
    </v-alert>

    <v-alert v-if="successMessage" type="success" class="success" dismissible>
      {{ successMessage }}
    </v-alert>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { type RegisterData } from '../models/RegisterData'
import { useRouter } from 'vue-router'
import AuthService from '../services/AuthService'
import { RegisterRequestDto } from '../models/RegisterData'
import EncryptionService from '../services/EncryptionService'

export default defineComponent({
  name: 'eaRegister',
  setup() {
    const formData = ref<RegisterData>({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      roles: [] // Initialize roles as an empty array
    })

    const roles = ref(['Reader', 'Writer', 'Editor', 'Admin']) // Predefined roles

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
      // if (!validatePassword(formData.value.password)) {
      //   errorMessage.value =
      //     'Invalid password. It must be at least 8 characters long and include upper/lowercase letters, numbers, and special characters.'
      //   return
      // }

      const registerRequest = new RegisterRequestDto(
        formData.value.username,
        formData.value.password,
        formData.value.email,
        formData.value.roles // Include selected roles
      )

      try {
        //const encryptedData = EncryptionService.encrypt(registerRequest)
        await AuthService.Register(registerRequest)

        // Clear fields after successful registration
        formData.value.username = ''
        formData.value.email = ''
        formData.value.password = ''
        formData.value.confirmPassword = ''
        formData.value.roles = [] // Clear roles after registration
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
      roles,
      errorMessage,
      successMessage,
      handleRegister
    }
  }
})
</script>

<style scoped>
.register-container {
  width: 750px; /* Adjust as necessary */
  margin: auto; /* Center the form */
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.button-group {
  display: flex;
  justify-content: space-between; /* Space out buttons */
  margin-top: 20px; /* Add some space above the button group */
}

.submit-btn {
  width: 100%; /* Full width for submit button */
}
</style>
