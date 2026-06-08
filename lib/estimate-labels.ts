import type { VehicleStatus } from "@/lib/estimate-schema";

export const VEHICLE_STATUS_LABEL: Record<VehicleStatus, string> = {
  awaiting_intake: "入庫待ち",
  photo_done: "写真撮影済",
  ai_analyzing: "AI解析中",
};

export function vehicleStatusBadgeVariant(
  status: VehicleStatus,
): "secondary" | "outline" | "default" {
  switch (status) {
    case "awaiting_intake":
      return "outline";
    case "photo_done":
      return "secondary";
    case "ai_analyzing":
      return "default";
    default:
      return "outline";
  }
}
