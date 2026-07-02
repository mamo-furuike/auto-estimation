export function isPdfFile(file: { type: string; name: string }): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return type === "application/pdf" || name.endsWith(".pdf");
}

export function pdfCaptionFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const basename = pathname.split("/").pop() ?? "";
    const decoded = decodeURIComponent(basename.replace(/^\d+-/, ""));
    return decoded || "見積.pdf";
  } catch {
    return "見積.pdf";
  }
}

export async function uploadPdfFileToBlob(file: File): Promise<string> {
  if (!isPdfFile(file)) {
    throw new Error("PDF ファイルのみアップロードできます");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload-pdf", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !data.url) {
    throw new Error(data.error ?? "PDF のアップロードに失敗しました");
  }

  return data.url;
}
