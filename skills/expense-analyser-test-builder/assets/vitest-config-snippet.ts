// Example: copy this object into the `test` field of your Vitest config.
export const vitestTestConfigSnippet = {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['src/tests/setup.ts'],
  include: ['src/**/*.spec.ts'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html'],
    include: ['src/**/*.{ts,vue}'],
    exclude: ['src/main.ts']
  }
}
