import { describe, expect, it } from "vitest";

import { isPdfFile, pdfCaptionFromUrl } from "@/lib/pdf-upload";

describe("pdf upload", () => {
  it("PDF ファイルのみ許可する", () => {
    expect(
      isPdfFile({ type: "application/pdf", name: "estimate.pdf" }),
    ).toBe(true);
    expect(isPdfFile({ type: "", name: "estimate.PDF" })).toBe(true);
  });

  it("PDF 以外を拒否する", () => {
    expect(
      isPdfFile({ type: "image/jpeg", name: "photo.jpg" }),
    ).toBe(false);
  });

  it("URL からファイル名キャプションを生成する", () => {
    expect(
      pdfCaptionFromUrl(
        "https://blob.vercel-storage.com/vehicle-pdfs/1234_estimate.pdf",
      ),
    ).toBe("1234_estimate.pdf");
  });
});
