import { type GalleryImage } from "@/lib/estimate-schema";

export const GALLERY_ACCEPTED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".heic",
  ".heif",
] as const;

export const GALLERY_ACCEPT_INPUT =
  "image/jpeg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif";

function isHeicFile(file: File): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

export function isGalleryImageFile(file: {
  type: string;
  name: string;
}): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (
    type === "image/jpeg" ||
    type === "image/png" ||
    type === "image/heic" ||
    type === "image/heif"
  ) {
    return true;
  }

  return GALLERY_ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function formatCapturedTime(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function captionFromFileName(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "");
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("画像の読み込みに失敗しました"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("画像の読み込みに失敗しました"));
    reader.readAsDataURL(blob);
  });
}

async function createDataUrlFromFile(file: File): Promise<string> {
  if (isHeicFile(file)) {
    const { default: heic2any } = await import("heic2any");
    const converted = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.92,
    });
    const blob = Array.isArray(converted) ? converted[0] : converted;
    if (!(blob instanceof Blob)) {
      throw new Error("HEIC の変換に失敗しました");
    }
    return blobToDataUrl(blob);
  }

  return blobToDataUrl(file);
}

export async function createGalleryImagesFromFiles(
  files: FileList | File[],
): Promise<GalleryImage[]> {
  const list = Array.from(files).filter(isGalleryImageFile);
  const capturedAt = new Date();

  const images = await Promise.all(
    list.map(async (file, index) => {
      const src = await createDataUrlFromFile(file);
      return {
        id: `upload-${capturedAt.getTime()}-${index}`,
        capturedAtDisplay: formatCapturedTime(capturedAt),
        caption: captionFromFileName(file.name),
        imageAlt: file.name,
        src,
      } satisfies GalleryImage;
    }),
  );

  return images;
}

async function prepareUploadFile(file: File): Promise<File> {
  if (!isHeicFile(file)) {
    return file;
  }

  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
  });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  if (!(blob instanceof Blob)) {
    throw new Error("HEIC の変換に失敗しました");
  }

  const jpegName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
  return new File([blob], jpegName, { type: "image/jpeg" });
}

export async function uploadGalleryFileToBlob(file: File): Promise<string> {
  const uploadFile = await prepareUploadFile(file);
  const formData = new FormData();
  formData.append("file", uploadFile);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !data.url) {
    throw new Error(data.error ?? "アップロードに失敗しました");
  }

  return data.url;
}

export async function uploadGalleryFilesToBlob(
  files: FileList | File[],
): Promise<string[]> {
  const list = Array.from(files).filter(isGalleryImageFile);
  if (list.length === 0) {
    return [];
  }

  return Promise.all(list.map((file) => uploadGalleryFileToBlob(file)));
}
