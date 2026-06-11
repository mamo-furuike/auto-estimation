import { z } from "zod";

import { galleryImageSchema, type GalleryImage, type Vehicle } from "@/lib/estimate-schema";

export const GALLERY_STORAGE_KEY = "auto-estimation-galleries:v1";
export const SELECTED_VEHICLE_STORAGE_KEY = "auto-estimation-selected:v1";
/** @deprecated Neon 移行前のキー。初回のみ gallery へ移行する */
export const LEGACY_ESTIMATE_STORAGE_KEY = "auto-estimation-data:v1";

const galleryStorageSchema = z.record(z.string(), z.array(galleryImageSchema));

export function loadGalleryStorage(): Record<string, GalleryImage[]> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(GALLERY_STORAGE_KEY);
    if (!raw) return null;

    const parsed = galleryStorageSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function saveGalleryStorage(vehicles: Vehicle[]): boolean {
  if (typeof window === "undefined") return false;

  const galleries = Object.fromEntries(
    vehicles.map((vehicle) => [vehicle.id, vehicle.galleryImages]),
  );

  const validated = galleryStorageSchema.safeParse(galleries);
  if (!validated.success) return false;

  try {
    window.localStorage.setItem(
      GALLERY_STORAGE_KEY,
      JSON.stringify(validated.data),
    );
    return true;
  } catch {
    return false;
  }
}

export function loadSelectedVehicleId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SELECTED_VEHICLE_STORAGE_KEY);
}

export function saveSelectedVehicleId(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SELECTED_VEHICLE_STORAGE_KEY, id);
}

export function mergeVehicleGalleries(
  vehicles: Vehicle[],
  galleries: Record<string, GalleryImage[]> | null,
): Vehicle[] {
  if (!galleries) {
    return vehicles;
  }

  return vehicles.map((vehicle) => ({
    ...vehicle,
    galleryImages: galleries[vehicle.id] ?? vehicle.galleryImages,
  }));
}

/** 旧 localStorage（全データ）から gallery のみ取り出し、新キーへ移行する */
export function migrateLegacyEstimateStorage(): Record<string, GalleryImage[]> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(LEGACY_ESTIMATE_STORAGE_KEY);
    if (!raw) return null;

    const legacySchema = z.object({
      vehicles: z.array(
        z.object({
          id: z.string(),
          galleryImages: z.array(galleryImageSchema),
        }),
      ),
      selectedVehicleId: z.string().optional(),
    });

    const parsed = legacySchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;

    const galleries = Object.fromEntries(
      parsed.data.vehicles.map((vehicle) => [
        vehicle.id,
        vehicle.galleryImages,
      ]),
    );

    window.localStorage.setItem(
      GALLERY_STORAGE_KEY,
      JSON.stringify(galleries),
    );

    if (parsed.data.selectedVehicleId) {
      saveSelectedVehicleId(parsed.data.selectedVehicleId);
    }

    window.localStorage.removeItem(LEGACY_ESTIMATE_STORAGE_KEY);
    return galleries;
  } catch {
    return null;
  }
}

export function buildGallerySeedByVehicleId(
  seedVehicles: Vehicle[],
): Record<string, GalleryImage[]> {
  return Object.fromEntries(
    seedVehicles.map((vehicle) => [vehicle.id, vehicle.galleryImages]),
  );
}

export function mergeWithGallerySeed(
  vehicles: Vehicle[],
  seedGalleries: Record<string, GalleryImage[]>,
  storedGalleries: Record<string, GalleryImage[]> | null,
): Vehicle[] {
  return vehicles.map((vehicle) => ({
    ...vehicle,
    galleryImages:
      storedGalleries?.[vehicle.id] ??
      seedGalleries[vehicle.id] ??
      vehicle.galleryImages,
  }));
}
