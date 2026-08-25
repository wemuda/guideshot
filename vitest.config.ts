import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json-summary'],
    },
    include: ['apps/site/test/**/*.test.ts', 'packages/*/test/**/*.test.ts'],
    passWithNoTests: false,
  },
});
