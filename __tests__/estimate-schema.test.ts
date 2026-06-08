import { describe, expect, it } from "vitest";

import estimateVehiclesData from "@/data/estimate-vehicles.json";
import estimateWorkspaceData from "@/data/estimate-workspace.json";
import {
  estimateWorkspaceSchema,
  vehiclesDataSchema,
} from "@/lib/estimate-schema";

describe("estimate schema", () => {
  it("data/estimate-vehicles.json は vehiclesDataSchema を満たす", () => {
    const parsed = vehiclesDataSchema.safeParse(estimateVehiclesData);
    expect(parsed.success).toBe(true);
  });

  it("data/estimate-workspace.json は estimateWorkspaceSchema を満たす", () => {
    const parsed = estimateWorkspaceSchema.safeParse(estimateWorkspaceData);
    expect(parsed.success).toBe(true);
  });

  it("workspace に appTitle と dashboard が含まれる", () => {
    const parsed = estimateWorkspaceSchema.safeParse(estimateWorkspaceData);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.appTitle).toBeTruthy();
    expect(parsed.data.dashboard.aiAnalyzingPercent).toBeGreaterThanOrEqual(0);
  });
});

describe("estimate vehicle factory", () => {
  it("parsePlateInput はスペース区切りのナンバーを分解する", async () => {
    const { parsePlateInput } = await import("@/lib/estimate-vehicle-factory");
    expect(parsePlateInput("品川 300 あ 1234")).toEqual({
      plateOffice: "品川",
      plateClass: "300",
      plateHiragana: "あ",
      plateNumber: "1234",
    });
  });

  it("createVehicleFromForm は新規車両を awaiting_intake で生成する", async () => {
    const { createVehicleFromForm } = await import(
      "@/lib/estimate-vehicle-factory"
    );
    const parsed = vehiclesDataSchema.safeParse(estimateVehiclesData);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;

    const created = createVehicleFromForm(
      {
        primeContractorName: "テスト元請",
        customerName: "テスト太郎",
        vehicleName: "Mazda CX-5",
        plateInput: "世田谷 500 さ 9999",
        entryDate: "2026-06-01",
      },
      parsed.data.vehicles,
    );

    expect(created.displayId).toBe("#5679");
    expect(created.status).toBe("awaiting_intake");
    expect(created.customerName).toBe("テスト太郎");
    expect(created.plateOffice).toBe("世田谷");
  });
});
