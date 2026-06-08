import { Workspace } from "@/components/workspace/Workspace";
import estimateVehiclesData from "@/data/estimate-vehicles.json";
import estimateWorkspaceData from "@/data/estimate-workspace.json";
import {
  vehiclesDataSchema,
  estimateWorkspaceSchema,
} from "@/lib/estimate-schema";

export default function Page() {
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

  return (
    <Workspace
      initialVehicles={vehiclesResult.data.vehicles}
      workspace={wsResult.data}
    />
  );
}
