/**
 * Converts a user-selected image File into a compressed WebP (or JPEG fallback)
 * Data URI compatible with the existing Firestore Base64 image format.
 */
export async function fileToCompressedDataUri(
  file: File,
  maxDimension = 760,
  quality = 0.82
): Promise<string> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('تعذر قراءة الصورة المختارة'));
      image.src = objectUrl;
    });

    let { width, height } = img;
    if (width > maxDimension || height > maxDimension) {
      if (width >= height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('تعذر معالجة الصورة في المتصفح');
    }

    ctx.drawImage(img, 0, 0, width, height);

    const webp = canvas.toDataURL('image/webp', quality);
    if (webp.startsWith('data:image/webp')) {
      return webp;
    }

    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
