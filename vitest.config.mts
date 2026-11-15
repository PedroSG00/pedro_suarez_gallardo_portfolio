import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: [
      'app/**/*.{test,spec}.?(c|m)[jt]s?(x)',
      'tests/lib/**/*.{test,spec}.?(c|m)[jt]s?(x)',
    ],
    coverage: {
      provider: 'v8',
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
        'vitest.config.mts',
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
