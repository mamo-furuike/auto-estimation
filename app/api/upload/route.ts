import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { isGalleryImageFile } from "@/lib/gallery-upload";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "ファイルが必要です" },
        { status: 400 },
      );
    }

    if (!isGalleryImageFile(file)) {
      return NextResponse.json(
        { error: "JPG / PNG / HEIC のみアップロードできます" },
        { status: 400 },
      );
    }

    const pathname = `vehicle-images/${Date.now()}-${file.name}`;
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "アップロードに失敗しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
