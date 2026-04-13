import {defineConfig} from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@snm/ui': path.resolve(__dirname, 'packages/ui/src'),
      '@snm/core': path.resolve(__dirname, 'packages/core/src'),
      '@snm/types': path.resolve(__dirname, 'packages/types/src')
    }
  },
  test: {
    include: ['packages/**/*.test.ts', 'packages/**/*.test.tsx'],
    environment: 'node',
    globals: false,
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.ts'],
      exclude: ['packages/*/src/**/*.test.ts', 'packages/*/src/**/index.ts']
    }
  }
});
