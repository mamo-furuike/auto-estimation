import { describe, expect, it } from "vitest";

import {
  galleryImagesToMetadataUrls,
  metadataImagesToGalleryImages,
} from "@/lib/gallery-images-from-metadata";

describe("gallery images from metadata", () => {
  it("metadata.images を GalleryImage に変換する", () => {
    const urls = [
      "https://blob.vercel-storage.com/vehicle-images/photo.jpg",
    ];
    const images = metadataImagesToGalleryImages(urls);

    expect(images).toHaveLength(1);
    expect(images[0]?.src).toBe(urls[0]);
    expect(images[0]?.caption).toBe("photo");
  });

  it("GalleryImage から http(s) URL のみ metadata.images に抽出する", () => {
    const urls = galleryImagesToMetadataUrls([
      {
        id: "1",
        capturedAtDisplay: "12:00",
        caption: "blob",
        imageAlt: "blob",
        src: "https://blob.vercel-storage.com/a.jpg",
      },
      {
        id: "2",
        capturedAtDisplay: "12:01",
        caption: "local",
        imageAlt: "local",
        src: "data:image/jpeg;base64,abc",
      },
    ]);

    expect(urls).toEqual(["https://blob.vercel-storage.com/a.jpg"]);
  });
});
