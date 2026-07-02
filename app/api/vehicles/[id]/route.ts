import {
  updateVehicleProject,
  deleteVehicleProject,
  type VehicleProjectPatch,
} from "@/lib/vehicle-db";
import { vehiclePatchSchema } from "@/lib/vehicle-api-schemas";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = vehiclePatchSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "入力が不正です" },
        { status: 400 },
      );
    }

    const vehicle = await updateVehicleProject(
      id,
      parsed.data as VehicleProjectPatch,
    );

    if (!vehicle) {
      return Response.json({ error: "車両が見つかりません" }, { status: 404 });
    }

    return Response.json({ vehicle });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "車両の更新に失敗しました";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const deleted = await deleteVehicleProject(id);

    if (!deleted) {
      return Response.json({ error: "車両が見つかりません" }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "車両の削除に失敗しました";
    return Response.json({ error: message }, { status: 500 });
  }
}
