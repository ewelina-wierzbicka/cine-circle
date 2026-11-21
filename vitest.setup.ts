import { afterEach } from 'vitest';

// The setup file runs for every test file, including the ones that declare
// `// @vitest-environment node`. Loading jest-dom and Testing Library there
// costs seconds of transform and import per file and buys nothing, so both
// are imported only when there is a DOM to assert against.
if (typeof document !== 'undefined') {
  await import('@testing-library/jest-dom/vitest');
  const { cleanup } = await import('@testing-library/react');

  // `globals` is off, so Testing Library cannot install its own auto-cleanup.
  afterEach(() => {
    cleanup();
  });
}
