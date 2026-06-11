import {
  createVehicleProject,
  listVehicleProjects,
} from "@/lib/vehicle-db";
import { newProjectFormSchema } from "@/lib/vehicle-api-schemas";

export async function GET() {
  try {
    const vehicles = await listVehicleProjects();
    return Response.json({ vehicles });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "車両一覧の取得に失敗しました";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = newProjectFormSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "入力が不正です" },
        { status: 400 },
      );
    }

    const vehicle = await createVehicleProject(parsed.data);
    return Response.json({ vehicle }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "車両の作成に失敗しました";
    return Response.json({ error: message }, { status: 500 });
  }
}
