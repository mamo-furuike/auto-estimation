import {
  type Vehicle,
  vehicleSchema,
  vehicleStatusSchema,
} from "@/lib/estimate-schema";
import {
  galleryImagesToMetadataUrls,
  metadataImagesToGalleryImages,
} from "@/lib/gallery-images-from-metadata";
import {
  defaultVehicleMetadata,
  vehicleMetadataSchema,
  type VehicleMetadata,
} from "@/lib/vehicle-metadata";

export type VehicleProjectRow = {
  id: string;
  display_id: string;
  vehicle_name: string;
  prime_contractor_name: string;
  customer_name: string;
  plate_office: string;
  plate_class: string;
  plate_hiragana: string;
  plate_number: string;
  entry_date: string | Date;
  status: string;
  metadata: unknown;
};

export function parseVehicleMetadata(value: unknown): VehicleMetadata {
  const parsed = vehicleMetadataSchema.safeParse(value);
  if (parsed.success) {
    return parsed.data;
  }

  const fallback = vehicleMetadataSchema.safeParse({
    ...defaultVehicleMetadata,
    ...(typeof value === "object" && value !== null ? value : {}),
  });

  return fallback.success ? fallback.data : defaultVehicleMetadata;
}

export function rowToVehicle(row: VehicleProjectRow): Vehicle {
  const metadata = parseVehicleMetadata(row.metadata);
  const entryDate =
    row.entry_date instanceof Date
      ? row.entry_date.toISOString().slice(0, 10)
      : String(row.entry_date).slice(0, 10);

  const { images, ...vehicleMetadata } = metadata;

  const candidate = {
    id: row.id,
    displayId: row.display_id,
    primeContractorName: row.prime_contractor_name,
    customerName: row.customer_name,
    plateOffice: row.plate_office,
    plateClass: row.plate_class,
    plateHiragana: row.plate_hiragana,
    plateNumber: row.plate_number,
    vehicleName: row.vehicle_name,
    entryDate,
    status: row.status,
    galleryImages: metadataImagesToGalleryImages(images),
    ...vehicleMetadata,
  };

  const statusParsed = vehicleStatusSchema.safeParse(candidate.status);
  if (!statusParsed.success) {
    throw new Error(`不正なステータス: ${candidate.status}`);
  }

  return vehicleSchema.parse({
    ...candidate,
    status: statusParsed.data,
  });
}

export function vehicleToMetadata(vehicle: Vehicle): VehicleMetadata {
  return {
    aiAnalysisSummary: vehicle.aiAnalysisSummary,
    mamoEstimate: vehicle.mamoEstimate,
    aiLearning: vehicle.aiLearning,
    aiDraftEstimate: vehicle.aiDraftEstimate,
    images: galleryImagesToMetadataUrls(vehicle.galleryImages),
  };
}

export function mergeMetadataImages(
  metadata: VehicleMetadata,
  urls: string[],
): VehicleMetadata {
  const merged = [...metadata.images, ...urls];
  const unique = [...new Set(merged)];
  return {
    ...metadata,
    images: unique,
  };
}
