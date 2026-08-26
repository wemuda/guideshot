import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': new URL('./apps/site', import.meta.url).pathname },
  },
  test: {
    coverage: {
      reporter: ['text', 'json-summary'],
    },
    include: ['apps/site/test/**/*.test.ts', 'packages/*/test/**/*.test.ts'],
    passWithNoTests: false,
  },
});
