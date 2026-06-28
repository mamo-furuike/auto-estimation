import { describe, expect, it, beforeEach } from "vitest";

import estimateVehiclesData from "@/data/estimate-vehicles.json";
import { vehiclesDataSchema } from "@/lib/estimate-schema";
import {
  GALLERY_STORAGE_KEY,
  LEGACY_ESTIMATE_STORAGE_KEY,
  SELECTED_VEHICLE_STORAGE_KEY,
  buildGallerySeedByVehicleId,
  loadGalleryStorage,
  mergeWithGallerySeed,
  migrateLegacyEstimateStorage,
  saveGalleryStorage,
} from "@/lib/gallery-storage";

describe("gallery storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("save した gallery を load できる", () => {
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

    expect(saveGalleryStorage(vehicles)).toBe(true);
    expect(loadGalleryStorage()?.["v-test"]).toEqual([]);
  });

  it("アップロード画像の data URL を保存できる", () => {
    const dataUrl =
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA//2Q==";

    saveGalleryStorage([
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
    ]);

    expect(loadGalleryStorage()?.["v-img"]?.[0]?.src).toBe(dataUrl);
  });

  it("旧 localStorage から gallery へ移行できる", () => {
    window.localStorage.setItem(
      LEGACY_ESTIMATE_STORAGE_KEY,
      JSON.stringify({
        vehicles: [
          {
            id: "v-legacy",
            galleryImages: [
              {
                id: "g1",
                capturedAtDisplay: "01:00",
                caption: "legacy",
                imageAlt: "legacy",
              },
            ],
          },
        ],
        selectedVehicleId: "v-legacy",
      }),
    );

    const migrated = migrateLegacyEstimateStorage();
    expect(migrated?.["v-legacy"]).toHaveLength(1);
    expect(window.localStorage.getItem(LEGACY_ESTIMATE_STORAGE_KEY)).toBeNull();
    expect(window.localStorage.getItem(GALLERY_STORAGE_KEY)).not.toBeNull();
    expect(window.localStorage.getItem(SELECTED_VEHICLE_STORAGE_KEY)).toBe(
      "v-legacy",
    );
  });

  it("localStorage の gallery を最優先する", () => {
    const parsed = vehiclesDataSchema.parse(estimateVehiclesData);
    const seed = buildGallerySeedByVehicleId(parsed.vehicles);
    const vehicle = parsed.vehicles[0]!;

    saveGalleryStorage([
      {
        ...vehicle,
        galleryImages: [
          {
            id: "local",
            capturedAtDisplay: "09:00",
            caption: "local only",
            imageAlt: "local",
          },
        ],
      },
    ]);

    const merged = mergeWithGallerySeed(
      [{ ...vehicle, galleryImages: [] }],
      seed,
      loadGalleryStorage(),
    );

    expect(merged[0]?.galleryImages[0]?.id).toBe("local");
  });

  it("DB の galleryImages を seed より優先する", () => {
    const parsed = vehiclesDataSchema.parse(estimateVehiclesData);
    const seed = buildGallerySeedByVehicleId(parsed.vehicles);
    const vehicle = parsed.vehicles[0]!;

    const merged = mergeWithGallerySeed(
      [
        {
          ...vehicle,
          galleryImages: [
            {
              id: "db",
              capturedAtDisplay: "10:00",
              caption: "from db",
              imageAlt: "from db",
              src: "https://blob.vercel-storage.com/db.jpg",
            },
          ],
        },
      ],
      seed,
      null,
    );

    expect(merged[0]?.galleryImages[0]?.id).toBe("db");
  });
});
