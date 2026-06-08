import { describe, expect, it } from "vitest";

import { isGalleryImageFile } from "@/lib/gallery-upload";

describe("gallery upload", () => {
  it("JPG / PNG / HEIC を許可する", () => {
    expect(
      isGalleryImageFile({ type: "image/jpeg", name: "photo.jpg" }),
    ).toBe(true);
    expect(
      isGalleryImageFile({ type: "image/png", name: "photo.png" }),
    ).toBe(true);
    expect(
      isGalleryImageFile({ type: "image/heic", name: "photo.heic" }),
    ).toBe(true);
    expect(
      isGalleryImageFile({ type: "", name: "photo.HEIC" }),
    ).toBe(true);
  });

  it("非対応形式を拒否する", () => {
    expect(
      isGalleryImageFile({ type: "application/pdf", name: "doc.pdf" }),
    ).toBe(false);
    expect(
      isGalleryImageFile({ type: "image/webp", name: "photo.webp" }),
    ).toBe(false);
  });
});
