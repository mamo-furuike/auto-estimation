import { z } from "zod";

import { clearVehicleProjectPdfUrl, setVehicleProjectPdfUrl } from "@/lib/vehicle-db";

const bodySchema = z.object({
  url: z.string().url(),
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

    const vehicle = await setVehicleProjectPdfUrl(id, parsed.data.url);

    if (!vehicle) {
      return Response.json({ error: "車両が見つかりません" }, { status: 404 });
    }

    return Response.json({ vehicle, pdfUrl: vehicle.pdfUrl ?? null });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PDF URL の保存に失敗しました";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const vehicle = await clearVehicleProjectPdfUrl(id);

    if (!vehicle) {
      return Response.json({ error: "車両が見つかりません" }, { status: 404 });
    }

    return Response.json({ vehicle, pdfUrl: null });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PDF の削除に失敗しました";
    return Response.json({ error: message }, { status: 500 });
  }
}
