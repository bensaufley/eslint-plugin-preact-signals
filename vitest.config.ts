/// <reference types="vitest/globals" />

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['lib', 'node_modules'],
    setupFiles: ['./src/test-support/testSetup.ts'],
    globals: true,
  },
});
