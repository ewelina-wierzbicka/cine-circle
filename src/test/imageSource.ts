/**
 * The image URL a component handed to `next/image`. Vitest does not apply
 * `images.loaderFile`, so next/image falls back to `/_next/image?url=…`; the
 * original URL survives as that `url` param, or as the src itself.
 */
export function sourceOf(img: HTMLElement) {
  const src = img.getAttribute('src') ?? '';
  const url = new URL(src, 'http://localhost');
  return url.searchParams.get('url') ?? src;
}
