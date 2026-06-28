import { z } from "zod";

import { appendVehicleProjectImages } from "@/lib/vehicle-db";

const bodySchema = z.object({
  urls: z.array(z.string().url()).min(1, "URL が必要です"),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "入力が不正です" },
        { status: 400 },
      );
    }

    const vehicle = await appendVehicleProjectImages(id, parsed.data.urls);

    if (!vehicle) {
      return Response.json({ error: "車両が見つかりません" }, { status: 404 });
    }

    return Response.json({
      vehicle,
      images: vehicle.galleryImages
        .map((image) => image.src)
        .filter((src): src is string => typeof src === "string"),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "画像 URL の保存に失敗しました";
    return Response.json({ error: message }, { status: 500 });
  }
}
