<template>
  <v-container class="feature-container">
    <v-card>
      <v-card-title>Feature Title</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="onSubmit">
          <v-text-field v-model="formValue" label="Field" :rules="[rules.required]" />
          <v-btn type="submit" color="primary" :loading="isLoading">Submit</v-btn>
        </v-form>

        <v-alert v-if="errorMessage" type="error" variant="tonal">
          {{ errorMessage }}
        </v-alert>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
// import { useDomainStore } from '@/stores/Domain'

export default defineComponent({
  name: 'eaFeatureName',
  setup() {
    // const domainStore = useDomainStore()
    const formValue = ref('')
    const errorMessage = ref('')
    const isLoading = computed(() => false)

    const rules = {
      required: (value: string) => !!value || 'This field is required'
    }

    const onSubmit = async () => {
      try {
        errorMessage.value = ''
        // await domainStore.someAction(formValue.value)
      } catch (error) {
        errorMessage.value = 'Unable to complete request.'
      }
    }

    return {
      formValue,
      errorMessage,
      isLoading,
      rules,
      onSubmit
    }
  }
})
</script>

<style scoped>
.feature-container {
  padding: 16px;
}
</style>
