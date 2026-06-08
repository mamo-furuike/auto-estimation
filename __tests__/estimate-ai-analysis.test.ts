import { describe, expect, it } from "vitest";

import { getAiAnalysisTabDisplay } from "@/lib/estimate-ai-analysis";
import { type Vehicle } from "@/lib/estimate-schema";

const baseVehicle: Vehicle = {
  id: "v-test",
  displayId: "#0000",
  primeContractorName: "テスト",
  customerName: "テスト",
  plateOffice: "品川",
  plateClass: "300",
  plateHiragana: "あ",
  plateNumber: "0000",
  vehicleName: "Test Car",
  entryDate: "2026-05-01",
  status: "ai_analyzing",
  galleryImages: [
    {
      id: "g1",
      capturedAtDisplay: "01:00",
      caption: "損傷1",
      imageAlt: "alt",
    },
    {
      id: "g2",
      capturedAtDisplay: "01:01",
      caption: "損傷2",
      imageAlt: "alt2",
    },
  ],
  aiAnalysisSummary: "サマリー本文",
  mamoEstimate: { title: "PDF", thumbnailCaption: "x.pdf" },
  aiLearning: { progressPercent: 50, modelsTrained: 1 },
  aiDraftEstimate: { lines: [], totalYen: 0 },
};

describe("getAiAnalysisTabDisplay", () => {
  it("returns photo count from gallery images", () => {
    const display = getAiAnalysisTabDisplay(baseVehicle);
    expect(display.photoCount).toBe(2);
    expect(display.damageBullets.length).toBeGreaterThan(0);
    expect(display.statusNote).toBeNull();
  });

  it("returns empty bullets and status note when no photos", () => {
    const display = getAiAnalysisTabDisplay({
      ...baseVehicle,
      galleryImages: [],
      aiAnalysisSummary: "写真がありません",
    });
    expect(display.photoCount).toBe(0);
    expect(display.damageBullets).toEqual([]);
    expect(display.statusNote).toBe("写真がありません");
  });

  it("returns queue-waiting dummy bullets for photo_done", () => {
    const display = getAiAnalysisTabDisplay({
      ...baseVehicle,
      status: "photo_done",
      galleryImages: [baseVehicle.galleryImages[0]!],
    });
    expect(display.damageBullets[0]).toContain("1 枚");
    expect(display.damageBullets.some((b) => b.includes("キュー"))).toBe(
      true,
    );
  });
});
