export const AVATAR_MAX_SIZE = 128;

type ResizeOptions = {
  maxSize?: number;
  quality?: number;
};

/**
 * Downscales an image file to fit inside a `maxSize` square and re-encodes it
 * as WebP. Returns the original file untouched if the browser cannot decode or
 * encode it, so upload never fails because of the resize step.
 *
 * Animated GIFs are flattened to their first frame.
 */
export async function resizeImage(
  file: File,
  { maxSize = AVATAR_MAX_SIZE, quality = 0.85 }: ResizeOptions = {},
): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));

    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', quality),
    );
    if (!blob) return file;

    return new File([blob], 'avatar.webp', { type: 'image/webp' });
  } catch {
    return file;
  }
}
