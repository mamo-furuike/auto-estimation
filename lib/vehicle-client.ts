import { type Vehicle } from "@/lib/estimate-schema";
import {
  type NewProjectFormValues,
} from "@/lib/estimate-vehicle-factory";
import { type VehicleProjectPatch } from "@/lib/vehicle-db";

type VehiclesResponse = { vehicles: Vehicle[] };
type VehicleResponse = { vehicle: Vehicle };
type ErrorResponse = { error: string };

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T | ErrorResponse;
  if (!response.ok) {
    const message =
      "error" in (data as ErrorResponse)
        ? (data as ErrorResponse).error
        : "リクエストに失敗しました";
    throw new Error(message);
  }
  return data as T;
}

export async function fetchVehiclesFromApi(): Promise<Vehicle[]> {
  const response = await fetch("/api/vehicles");
  const data = await parseJson<VehiclesResponse>(response);
  return data.vehicles;
}

export async function createVehicleViaApi(
  values: NewProjectFormValues,
): Promise<Vehicle> {
  const response = await fetch("/api/vehicles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const data = await parseJson<VehicleResponse>(response);
  return data.vehicle;
}

export async function updateVehicleViaApi(
  id: string,
  patch: VehicleProjectPatch,
): Promise<Vehicle> {
  const response = await fetch(`/api/vehicles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = await parseJson<VehicleResponse>(response);
  return data.vehicle;
}

type ProjectImagesResponse = { vehicle: Vehicle; images: string[] };

export async function addProjectImagesViaApi(
  projectId: string,
  urls: string[],
): Promise<Vehicle> {
  const response = await fetch(`/api/projects/${projectId}/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ urls }),
  });
  const data = await parseJson<ProjectImagesResponse>(response);
  return data.vehicle;
}
