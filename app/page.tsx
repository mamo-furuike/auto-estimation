import { Workspace } from "@/components/workspace/Workspace";
import estimateVehiclesData from "@/data/estimate-vehicles.json";
import estimateWorkspaceData from "@/data/estimate-workspace.json";
import {
  vehiclesDataSchema,
  estimateWorkspaceSchema,
} from "@/lib/estimate-schema";
import { buildGallerySeedByVehicleId } from "@/lib/gallery-storage";
import { listVehicleProjects } from "@/lib/vehicle-db";

export const dynamic = "force-dynamic";

async function loadInitialVehicles() {
  if (!process.env.DATABASE_URL) {
    const parsed = vehiclesDataSchema.safeParse(estimateVehiclesData);
    if (!parsed.success) {
      throw new Error(
        `DATABASE_URL が未設定で、シード JSON も不正です: ${parsed.error.issues[0]?.message}`,
      );
    }
    return parsed.data.vehicles;
  }

  return listVehicleProjects();
}

export default async function Page() {
  const vehiclesResult = vehiclesDataSchema.safeParse(estimateVehiclesData);
  const wsResult = estimateWorkspaceSchema.safeParse(estimateWorkspaceData);

  if (!vehiclesResult.success || !wsResult.success) {
    const errors = [
      !vehiclesResult.success &&
        `estimate-vehicles.json: ${vehiclesResult.error.issues[0]?.message}`,
      !wsResult.success &&
        `estimate-workspace.json: ${wsResult.error.issues[0]?.message}`,
    ].filter(Boolean);
    throw new Error(`データの形式が正しくありません:\n${errors.join("\n")}`);
  }

  const seedGalleries = buildGallerySeedByVehicleId(
    vehiclesResult.data.vehicles,
  );

  let initialVehicles;
  try {
    initialVehicles = await loadInitialVehicles();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "車両データの読み込みに失敗しました";
    throw new Error(message);
  }

  return (
    <Workspace
      initialVehicles={initialVehicles}
      seedGalleries={seedGalleries}
      workspace={wsResult.data}
    />
  );
}
