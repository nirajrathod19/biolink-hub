import imageCompression from "browser-image-compression";

export interface CompressImageOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
}

const AVATAR_DEFAULTS: CompressImageOptions = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 800,
};

const BACKGROUND_DEFAULTS: CompressImageOptions = {
  maxSizeMB: 0.5,
  maxWidthOrHeight: 1920,
};

export const presets = { avatar: AVATAR_DEFAULTS, background: BACKGROUND_DEFAULTS } as const;

/**
 * Compress an image file to WebP format.
 * Returns a File with .webp extension ready for upload.
 */
export async function compressImage(
  file: File,
  preset: keyof typeof presets = "avatar",
  customOptions?: CompressImageOptions
): Promise<File> {
  const opts = { ...presets[preset], ...customOptions };

  const compressed = await imageCompression(file, {
    maxSizeMB: opts.maxSizeMB ?? 0.5,
    maxWidthOrHeight: opts.maxWidthOrHeight ?? 800,
    fileType: "image/webp",
    useWebWorker: true,
  });

  // Ensure the file has a .webp extension and correct MIME
  const webpFile = new File([compressed], compressed.name.replace(/\.[^.]+$/, ".webp"), {
    type: "image/webp",
  });

  return webpFile;
}
