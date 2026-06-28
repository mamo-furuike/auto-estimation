import { describe, expect, it } from "vitest";

import { rowToVehicle, type VehicleProjectRow } from "@/lib/vehicle-db-mapper";

describe("vehicle db mapper", () => {
  it("rowToVehicle が DB 行を Vehicle に変換する", () => {
    const row: VehicleProjectRow = {
      id: "v-1234",
      display_id: "#1234",
      vehicle_name: "Toyota RAV4",
      prime_contractor_name: "トヨタ車体株式会社",
      customer_name: "山田 太郎",
      plate_office: "品川",
      plate_class: "300",
      plate_hiragana: "あ",
      plate_number: "1234",
      entry_date: "2026-05-12",
      status: "ai_analyzing",
      metadata: {
        aiAnalysisSummary: "テストサマリー",
        mamoEstimate: {
          title: "マモさんの見積（PDF）",
          thumbnailCaption: "1234_見積.pdf",
        },
        aiLearning: { progressPercent: 88, modelsTrained: 14 },
        aiDraftEstimate: { lines: [], totalYen: 112500 },
        images: ["https://blob.vercel-storage.com/test.jpg"],
      },
    };

    const vehicle = rowToVehicle(row);
    expect(vehicle.displayId).toBe("#1234");
    expect(vehicle.vehicleName).toBe("Toyota RAV4");
    expect(vehicle.galleryImages).toHaveLength(1);
    expect(vehicle.galleryImages[0]?.src).toBe(
      "https://blob.vercel-storage.com/test.jpg",
    );
    expect(vehicle.aiAnalysisSummary).toBe("テストサマリー");
  });
});
