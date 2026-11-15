import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import os from 'os';

export default defineConfig({
  root: path.resolve(import.meta.dirname),
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      reportsDirectory: path.join(os.tmpdir(), 'girasoles-mobile-coverage'),
      clean: false,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/test/**',
        'src/types/**',
        'src/main.tsx',
        'src/**/*.d.ts',
      ],
      thresholds: {
        lines: 36,
        statements: 35,
        branches: 30,
        functions: 30,
        'src/utils/**': {
          lines: 80,
          statements: 78,
          branches: 76,
          functions: 82,
        },
        'src/config/**': {
          lines: 75,
          statements: 70,
          branches: 63,
          functions: 56,
        },
        'src/hooks/**': {
          lines: 75,
          statements: 72,
          branches: 56,
          functions: 72,
        },
        'src/components/ui/**': {
          lines: 73,
          statements: 71,
          branches: 71,
          functions: 57,
        },
        'src/services/**': {
          lines: 35,
          statements: 33,
          branches: 22,
          functions: 19,
        },
        'src/pages/**': {
          lines: 13,
          statements: 13,
          branches: 25,
          functions: 6,
        },
      },
    },
  },
});
