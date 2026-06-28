import { type GalleryImage } from "@/lib/estimate-schema";

function formatCapturedTime(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function captionFromUrl(url: string, index: number): string {
  try {
    const pathname = new URL(url).pathname;
    const basename = pathname.split("/").pop() ?? "";
    const withoutQuery = basename.split("?")[0] ?? basename;
    const decoded = decodeURIComponent(withoutQuery);
    const withoutTimestamp = decoded.replace(/^\d+-/, "");
    const caption = withoutTimestamp.replace(/\.[^.]+$/, "");
    return caption || `写真 ${index + 1}`;
  } catch {
    return `写真 ${index + 1}`;
  }
}

export function metadataImagesToGalleryImages(urls: string[]): GalleryImage[] {
  const capturedAtDisplay = formatCapturedTime(new Date());

  return urls.map((url, index) => ({
    id: `blob-${index}-${hashString(url)}`,
    capturedAtDisplay,
    caption: captionFromUrl(url, index),
    imageAlt: captionFromUrl(url, index),
    src: url,
  }));
}

export function galleryImagesToMetadataUrls(images: GalleryImage[]): string[] {
  return images
    .map((image) => image.src)
    .filter(
      (src): src is string =>
        typeof src === "string" &&
        (src.startsWith("https://") || src.startsWith("http://")),
    );
}

function hashString(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
