/**
 * Reading and compressing images picked from the user's device.
 *
 * Uploaded files end up as a data URL stored directly in the record's JSON
 * payload — there is no separate object storage in this stack. A phone photo
 * straight off a camera can be several megabytes, which is both slow to save
 * and large enough to risk hitting the function payload limit, so every
 * image is downscaled and re-encoded as JPEG before it is ever handed to
 * `onChange`.
 */

export class ImageUploadError extends Error {}

const MAX_IMAGE_DIMENSION = 1280;
const IMAGE_JPEG_QUALITY = 0.82;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new ImageUploadError('That file could not be read.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new ImageUploadError('That file is not a readable image.'));
    img.src = src;
  });
}

/** Reads an image file, downscales it to fit within maxDimension, and returns a compressed JPEG data URL. */
export async function readAndCompressImage(
  file: File,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new ImageUploadError('Please choose an image file (JPG, PNG, WEBP).');
  }
  const { maxDimension = MAX_IMAGE_DIMENSION, quality = IMAGE_JPEG_QUALITY } = options;

  const original = await readFileAsDataUrl(file);
  const img = await loadImage(original);

  const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return original;

  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}

/** For files that can't be re-encoded (PDFs, etc.) — read as-is, but refuse anything unreasonably large. */
export async function readFileAsDataUrlCapped(file: File, maxBytes: number): Promise<string> {
  if (file.size > maxBytes) {
    throw new ImageUploadError(`That file is too large (max ${Math.round(maxBytes / (1024 * 1024))}MB).`);
  }
  return readFileAsDataUrl(file);
}
