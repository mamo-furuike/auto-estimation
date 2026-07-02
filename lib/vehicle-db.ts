import estimateVehiclesData from "@/data/estimate-vehicles.json";
import { getSql } from "@/lib/db";
import { type Vehicle, vehiclesDataSchema } from "@/lib/estimate-schema";
import {
  createVehicleFromForm,
  type NewProjectFormValues,
} from "@/lib/estimate-vehicle-factory";
import {
  rowToVehicle,
  type VehicleProjectRow,
  vehicleToMetadata,
  parseVehicleMetadata,
  mergeMetadataImages,
} from "@/lib/vehicle-db-mapper";
import { type VehicleMetadata } from "@/lib/vehicle-metadata";

export async function listVehicleProjects(): Promise<Vehicle[]> {
  const sql = getSql();
  await seedVehicleProjectsIfEmpty();

  return fetchAllVehicleProjects(sql);
}

async function fetchAllVehicleProjects(
  sql: ReturnType<typeof getSql>,
): Promise<Vehicle[]> {
  const rows = await sql`
    SELECT
      id,
      display_id,
      vehicle_name,
      prime_contractor_name,
      customer_name,
      plate_office,
      plate_class,
      plate_hiragana,
      plate_number,
      entry_date,
      status,
      metadata
    FROM vehicle_projects
    ORDER BY entry_date DESC, display_id DESC
  `;

  return (rows as VehicleProjectRow[]).map(rowToVehicle);
}

export async function createVehicleProject(
  values: NewProjectFormValues,
): Promise<Vehicle> {
  const sql = getSql();
  const existing = await fetchAllVehicleProjects(sql);
  const vehicle = createVehicleFromForm(values, existing);
  const metadata = vehicleToMetadata(vehicle);

  await sql`
    INSERT INTO vehicle_projects (
      id,
      display_id,
      vehicle_name,
      prime_contractor_name,
      customer_name,
      plate_office,
      plate_class,
      plate_hiragana,
      plate_number,
      entry_date,
      status,
      metadata
    ) VALUES (
      ${vehicle.id},
      ${vehicle.displayId},
      ${vehicle.vehicleName},
      ${vehicle.primeContractorName},
      ${vehicle.customerName},
      ${vehicle.plateOffice},
      ${vehicle.plateClass},
      ${vehicle.plateHiragana},
      ${vehicle.plateNumber},
      ${vehicle.entryDate},
      ${vehicle.status},
      ${JSON.stringify(metadata)}::jsonb
    )
  `;

  return vehicle;
}

export type VehicleProjectPatch = Partial<
  Pick<
    Vehicle,
    | "primeContractorName"
    | "customerName"
    | "vehicleName"
    | "plateOffice"
    | "plateClass"
    | "plateHiragana"
    | "plateNumber"
    | "entryDate"
    | "status"
    | "aiAnalysisSummary"
    | "mamoEstimate"
    | "aiLearning"
    | "aiDraftEstimate"
  >
>;

export async function updateVehicleProject(
  id: string,
  patch: VehicleProjectPatch,
): Promise<Vehicle | null> {
  const sql = getSql();

  const existingRows = await sql`
    SELECT
      id,
      display_id,
      vehicle_name,
      prime_contractor_name,
      customer_name,
      plate_office,
      plate_class,
      plate_hiragana,
      plate_number,
      entry_date,
      status,
      metadata
    FROM vehicle_projects
    WHERE id = ${id}
    LIMIT 1
  `;

  if (existingRows.length === 0) {
    return null;
  }

  const current = rowToVehicle(existingRows[0] as VehicleProjectRow);
  const next: Vehicle = {
    ...current,
    ...patch,
  };
  const metadata = vehicleToMetadata(next);

  await sql`
    UPDATE vehicle_projects
    SET
      vehicle_name = ${next.vehicleName},
      prime_contractor_name = ${next.primeContractorName},
      customer_name = ${next.customerName},
      plate_office = ${next.plateOffice},
      plate_class = ${next.plateClass},
      plate_hiragana = ${next.plateHiragana},
      plate_number = ${next.plateNumber},
      entry_date = ${next.entryDate},
      status = ${next.status},
      metadata = ${JSON.stringify(metadata)}::jsonb,
      updated_at = now()
    WHERE id = ${id}
  `;

  return next;
}

export async function appendVehicleProjectImages(
  id: string,
  urls: string[],
): Promise<Vehicle | null> {
  if (urls.length === 0) {
    return null;
  }

  const sql = getSql();

  const existingRows = await sql`
    SELECT
      id,
      display_id,
      vehicle_name,
      prime_contractor_name,
      customer_name,
      plate_office,
      plate_class,
      plate_hiragana,
      plate_number,
      entry_date,
      status,
      metadata
    FROM vehicle_projects
    WHERE id = ${id}
    LIMIT 1
  `;

  if (existingRows.length === 0) {
    return null;
  }

  const row = existingRows[0] as VehicleProjectRow;
  const current = rowToVehicle(row);
  const metadata = mergeMetadataImages(
    parseVehicleMetadata(row.metadata),
    urls,
  );
  const nextStatus =
    current.status === "awaiting_intake" ? "photo_done" : current.status;

  await sql`
    UPDATE vehicle_projects
    SET
      status = ${nextStatus},
      metadata = ${JSON.stringify(metadata)}::jsonb,
      updated_at = now()
    WHERE id = ${id}
  `;

  return rowToVehicle({
    ...row,
    status: nextStatus,
    metadata,
  });
}

export async function setVehicleProjectPdfUrl(
  id: string,
  pdfUrl: string,
): Promise<Vehicle | null> {
  const sql = getSql();

  const existingRows = await sql`
    SELECT
      id,
      display_id,
      vehicle_name,
      prime_contractor_name,
      customer_name,
      plate_office,
      plate_class,
      plate_hiragana,
      plate_number,
      entry_date,
      status,
      metadata
    FROM vehicle_projects
    WHERE id = ${id}
    LIMIT 1
  `;

  if (existingRows.length === 0) {
    return null;
  }

  const row = existingRows[0] as VehicleProjectRow;
  const metadata: VehicleMetadata = {
    ...parseVehicleMetadata(row.metadata),
    pdf_url: pdfUrl,
  };

  await sql`
    UPDATE vehicle_projects
    SET
      metadata = ${JSON.stringify(metadata)}::jsonb,
      updated_at = now()
    WHERE id = ${id}
  `;

  return rowToVehicle({
    ...row,
    metadata,
  });
}

export async function clearVehicleProjectPdfUrl(
  id: string,
): Promise<Vehicle | null> {
  const sql = getSql();

  const existingRows = await sql`
    SELECT
      id,
      display_id,
      vehicle_name,
      prime_contractor_name,
      customer_name,
      plate_office,
      plate_class,
      plate_hiragana,
      plate_number,
      entry_date,
      status,
      metadata
    FROM vehicle_projects
    WHERE id = ${id}
    LIMIT 1
  `;

  if (existingRows.length === 0) {
    return null;
  }

  const row = existingRows[0] as VehicleProjectRow;
  const parsed = parseVehicleMetadata(row.metadata);
  const metadata: VehicleMetadata = {
    ...parsed,
    pdf_url: null,
    mamoEstimate: {
      ...parsed.mamoEstimate,
      thumbnailCaption: "未アップロード",
    },
  };

  await sql`
    UPDATE vehicle_projects
    SET
      metadata = ${JSON.stringify(metadata)}::jsonb,
      updated_at = now()
    WHERE id = ${id}
  `;

  return rowToVehicle({
    ...row,
    metadata,
  });
}

export async function deleteVehicleProject(id: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    DELETE FROM vehicle_projects
    WHERE id = ${id}
    RETURNING id
  `;

  return rows.length > 0;
}

async function seedVehicleProjectsIfEmpty(): Promise<void> {
  const sql = getSql();
  const countRows = await sql`SELECT COUNT(*)::int AS count FROM vehicle_projects`;
  const count = Number((countRows[0] as { count: number }).count);

  if (count > 0) {
    return;
  }

  const parsed = vehiclesDataSchema.safeParse(estimateVehiclesData);
  if (!parsed.success || parsed.data.vehicles.length === 0) {
    return;
  }

  for (const vehicle of parsed.data.vehicles) {
    const metadata = vehicleToMetadata(vehicle);

    await sql`
      INSERT INTO vehicle_projects (
        id,
        display_id,
        vehicle_name,
        prime_contractor_name,
        customer_name,
        plate_office,
        plate_class,
        plate_hiragana,
        plate_number,
        entry_date,
        status,
        metadata
      ) VALUES (
        ${vehicle.id},
        ${vehicle.displayId},
        ${vehicle.vehicleName},
        ${vehicle.primeContractorName},
        ${vehicle.customerName},
        ${vehicle.plateOffice},
        ${vehicle.plateClass},
        ${vehicle.plateHiragana},
        ${vehicle.plateNumber},
        ${vehicle.entryDate},
        ${vehicle.status},
        ${JSON.stringify(metadata)}::jsonb
      )
      ON CONFLICT (id) DO NOTHING
    `;
  }
}
