import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// The `@/` alias is declared once, in tsconfig.json. Read it from there
// instead of restating it, so the compiler and the runner cannot drift.
const tsconfig = JSON.parse(
  readFileSync(new URL('./tsconfig.json', import.meta.url), 'utf8'),
) as { compilerOptions: { paths: Record<string, string[]> } };

// Keep the trailing slash in the `find` key: a bare `@` would also swallow
// package imports like `@testing-library/react`.
const alias = Object.entries(tsconfig.compilerOptions.paths).map(
  ([pattern, [target]]) => ({
    find: pattern.replace(/\*$/, ''),
    replacement: fileURLToPath(
      new URL(target.replace(/\*$/, ''), import.meta.url),
    ),
  }),
);

export default defineConfig({
  plugins: [react()],
  resolve: { alias },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // Playwright owns `e2e/`. Without this, a Playwright spec that happens to
    // move under `src/` would be run by the wrong runner.
    exclude: ['e2e/**', 'node_modules/**', '.next/**', '.next-e2e/**'],
  },
});
