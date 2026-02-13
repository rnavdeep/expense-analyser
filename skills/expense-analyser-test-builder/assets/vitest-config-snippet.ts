// Add this `test` block to `vite.config.ts`, or adapt it into `vitest.config.ts`.
test: {
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
