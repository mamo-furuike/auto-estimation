import {
  type Vehicle,
  vehicleSchema,
  vehicleStatusSchema,
} from "@/lib/estimate-schema";
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
  return parsed.success ? parsed.data : defaultVehicleMetadata;
}

export function rowToVehicle(row: VehicleProjectRow): Vehicle {
  const metadata = parseVehicleMetadata(row.metadata);
  const entryDate =
    row.entry_date instanceof Date
      ? row.entry_date.toISOString().slice(0, 10)
      : String(row.entry_date).slice(0, 10);

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
    galleryImages: [],
    ...metadata,
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
  };
}
