import { deleteVehicleProject } from "@/lib/vehicle-db";

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
