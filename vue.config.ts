import { defineConfig } from '@vue/cli-service'

export default defineConfig({
  css: {
    loaderOptions: {
      sass: {
        additionalData: `@use "vuetify/styles" as *;`
      }
    }
  }
})
