const COMPRESSIBLE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_DIMENSION = 2560;
const MIN_COMPRESSION_SIZE = 350 * 1024;
const TARGET_IMAGE_BYTES = 1.5 * 1024 * 1024;

const toBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));

/**
 * Optimizes browser-supported raster images before upload.
 * GIFs (animation), SVGs, PDFs, video, and other formats are passed through
 * unchanged; applying an image codec to those files would corrupt them.
 * The original is retained whenever encoding fails or does not reduce size.
 */
export async function prepareUploadFile(file: File): Promise<File> {
  if (!COMPRESSIBLE_IMAGE_TYPES.has(file.type) || file.size < MIN_COMPRESSION_SIZE) {
    return file;
  }

  if (typeof createImageBitmap !== "function" || typeof document === "undefined") {
    return file;
  }

  let bitmap: ImageBitmap | undefined;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext("2d");
    if (!context) return file;

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    let best: Blob | null = null;
    for (const quality of [0.84, 0.76, 0.68]) {
      const candidate = await toBlob(canvas, quality);
      if (!candidate) continue;
      if (!best || candidate.size < best.size) best = candidate;
      if (candidate.size <= TARGET_IMAGE_BYTES) break;
    }

    if (!best || best.size >= file.size) return file;

    const baseName = file.name.replace(/\.[^.]+$/, "") || "upload";
    return new File([best], `${baseName}.webp`, {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  } catch {
    // A browser codec or malformed image must never block the original upload.
    return file;
  } finally {
    bitmap?.close();
  }
}

export async function prepareUploadFiles(files: File[]): Promise<File[]> {
  return Promise.all(files.map(prepareUploadFile));
}
