import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'c8',
      reporter: ['text', 'lcov'],
      include: ['app/**/*.{ts,tsx}', 'middleware/**/*.ts', 'proxy.ts'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.e2e.ts',
        '.next/',
        'out/',
        'build/',
        'coverage/',
        'scripts/',
        'specs/',
        'docs/',
        'public/',
        'vitest.config.ts',
        'playwright.config.ts',
        'playwright.config.test.ts',
        'next.config.ts',
        'tsconfig.json',
        'eslint.config.mjs',
        'next-env.d.ts',
      ],
    },
  },
});
