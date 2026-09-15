import type { Page } from '@playwright/test';

// Whether the browser can encode WebP via canvas. resizeImage downscales
// only when it can; otherwise it passes the original file through, so
// avatar assertions branch on this.
export async function supportsWebp(page: Page): Promise<boolean> {
  return page.evaluate(() =>
    document
      .createElement('canvas')
      .toDataURL('image/webp')
      .startsWith('data:image/webp'),
  );
}
