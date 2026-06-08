import { describe, expect, it, beforeEach } from "vitest";

import estimateVehiclesData from "@/data/estimate-vehicles.json";
import {
  ESTIMATE_STORAGE_KEY,
  loadEstimateStorage,
  saveEstimateStorage,
  seedEstimateStorageFromJson,
} from "@/lib/estimate-storage";

describe("estimate storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("save したデータを load できる", () => {
    const vehicles = [
      {
        id: "v-test",
        displayId: "#9999",
        primeContractorName: "テスト元請",
        customerName: "テスト太郎",
        plateOffice: "品川",
        plateClass: "300",
        plateHiragana: "あ",
        plateNumber: "9999",
        vehicleName: "Test Car",
        entryDate: "2026-06-01",
        status: "awaiting_intake" as const,
        galleryImages: [],
        aiAnalysisSummary: "テスト",
        mamoEstimate: {
          title: "マモさんの見積（PDF）",
          thumbnailCaption: "未アップロード",
        },
        aiLearning: { progressPercent: 0, modelsTrained: 14 },
        aiDraftEstimate: { lines: [], totalYen: 0 },
      },
    ];

    expect(
      saveEstimateStorage({ vehicles, selectedVehicleId: "v-test" }),
    ).toBe(true);

    const loaded = loadEstimateStorage();
    expect(loaded?.vehicles).toHaveLength(1);
    expect(loaded?.selectedVehicleId).toBe("v-test");
    expect(loaded?.vehicles[0]?.customerName).toBe("テスト太郎");
  });

  it("不正な JSON は null を返す", () => {
    window.localStorage.setItem(ESTIMATE_STORAGE_KEY, "{ invalid");
    expect(loadEstimateStorage()).toBeNull();
  });

  it("seedEstimateStorageFromJson で JSON シードを保存できる", () => {
    expect(seedEstimateStorageFromJson(estimateVehiclesData)).toBe(true);
    const loaded = loadEstimateStorage();
    expect(loaded?.vehicles.length).toBeGreaterThan(0);
    expect(loaded?.vehicles[0]?.displayId).toBe("#1234");
  });

  it("アップロード画像の data URL を保存できる", () => {
    const dataUrl =
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==";

    saveEstimateStorage({
      vehicles: [
        {
          id: "v-img",
          displayId: "#1",
          primeContractorName: "元請",
          customerName: "客",
          plateOffice: "品川",
          plateClass: "300",
          plateHiragana: "あ",
          plateNumber: "1",
          vehicleName: "Car",
          entryDate: "2026-06-01",
          status: "photo_done",
          galleryImages: [
            {
              id: "g1",
              capturedAtDisplay: "12:00",
              caption: "test",
              imageAlt: "test.jpg",
              src: dataUrl,
            },
          ],
          aiAnalysisSummary: "",
          mamoEstimate: {
            title: "マモさんの見積（PDF）",
            thumbnailCaption: "未",
          },
          aiLearning: { progressPercent: 0, modelsTrained: 14 },
          aiDraftEstimate: { lines: [], totalYen: 0 },
        },
      ],
      selectedVehicleId: "v-img",
    });

    expect(loadEstimateStorage()?.vehicles[0]?.galleryImages[0]?.src).toBe(
      dataUrl,
    );
  });
});
