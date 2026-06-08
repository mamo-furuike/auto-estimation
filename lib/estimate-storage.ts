import { z } from "zod";

import {
  vehicleSchema,
  vehiclesDataSchema,
} from "@/lib/estimate-schema";

export const ESTIMATE_STORAGE_KEY = "auto-estimation-data:v1";

const estimateStorageSchema = z.object({
  vehicles: z.array(vehicleSchema),
  selectedVehicleId: z.string(),
});

export type EstimateStorageData = z.infer<typeof estimateStorageSchema>;

export function loadEstimateStorage(): EstimateStorageData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(ESTIMATE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = estimateStorageSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;

    if (parsed.data.vehicles.length === 0) return null;

    const selectedExists = parsed.data.vehicles.some(
      (v) => v.id === parsed.data.selectedVehicleId,
    );

    return {
      vehicles: parsed.data.vehicles,
      selectedVehicleId: selectedExists
        ? parsed.data.selectedVehicleId
        : (parsed.data.vehicles[0]?.id ?? ""),
    };
  } catch {
    return null;
  }
}

export function saveEstimateStorage(data: EstimateStorageData): boolean {
  if (typeof window === "undefined") return false;

  const validated = estimateStorageSchema.safeParse(data);
  if (!validated.success) return false;

  try {
    window.localStorage.setItem(
      ESTIMATE_STORAGE_KEY,
      JSON.stringify(validated.data),
    );
    return true;
  } catch {
    return false;
  }
}

/** テスト・開発用: シード JSON の内容で localStorage を上書きする */
export function seedEstimateStorageFromJson(json: unknown): boolean {
  const parsed = vehiclesDataSchema.safeParse(json);
  if (!parsed.success || parsed.data.vehicles.length === 0) return false;

  return saveEstimateStorage({
    vehicles: parsed.data.vehicles,
    selectedVehicleId: parsed.data.vehicles[0]?.id ?? "",
  });
}
