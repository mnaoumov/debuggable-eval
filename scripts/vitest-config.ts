import type { ViteUserConfig } from 'vitest/config';

export const config: ViteUserConfig = {
  test: {
    coverage: {
      exclude: ['src/**/*.test.ts'],
      include: ['src/**/*.ts']
    },
    include: ['src/**/*.test.ts']
  }
};
