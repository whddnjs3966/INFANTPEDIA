const photoTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/heic", "image/heif", "image/bmp"]);
const maxFileBytes = 10 * 1024 * 1024;
const maxPixels = 50_000_000;

/** Resize a raster profile photo and store a JPEG data URL on the device. */
export function resizeImage(file: File, maxSize = 256, quality = 0.85): Promise<string> {
  if (!photoTypes.has(file.type) || file.size === 0 || file.size > maxFileBytes) {
    return Promise.reject(new Error("Unsupported photo"));
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load photo"));
    };
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const { naturalWidth: width, naturalHeight: height } = img;
        if (!width || !height || width * height > maxPixels) throw new Error("Unsupported photo dimensions");
        const scale = Math.min(1, maxSize / Math.max(width, height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const photo = canvas.toDataURL("image/jpeg", quality);
        if (!photo.startsWith("data:image/jpeg;")) throw new Error("Failed to encode photo");
        resolve(photo);
      } catch (error) {
        reject(error);
      }
    };
    img.src = url;
  });
}
