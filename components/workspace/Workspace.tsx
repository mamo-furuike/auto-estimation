"use client";

/**
 * Workspace: 見積アプリ向け 3 ペイン（車両一覧 / 画像ギャラリー / 見積＆AI学習）
 *
 * 左端のアプリサイドバーは非表示とし、3 列を全幅で表示する。
 *
 * ライトキャンバス + ネイビーアクセントは `.estimate-workspace-theme`（globals.css）
 *
 * データ永続化:
 * - 車両プロジェクト本体 → Neon（API 経由）
 * - 写真（data URL）→ localStorage
 */

import { useEffect, useMemo, useState } from "react";

import {
  type GalleryImage,
  type Vehicle,
  type EstimateWorkspaceMeta,
} from "@/lib/estimate-schema";
import { type NewProjectFormValues } from "@/lib/estimate-vehicle-factory";
import { createGalleryImagesFromFiles } from "@/lib/gallery-upload";
import {
  loadGalleryStorage,
  loadSelectedVehicleId,
  mergeWithGallerySeed,
  migrateLegacyEstimateStorage,
  saveGalleryStorage,
  saveSelectedVehicleId,
} from "@/lib/gallery-storage";
import {
  createVehicleViaApi,
  updateVehicleViaApi,
} from "@/lib/vehicle-client";
import { EstimateWorkspaceTopBar } from "@/components/workspace/EstimateWorkspaceTopBar";
import { VehicleProjectListPane } from "@/components/workspace/VehicleProjectListPane";
import { ImageGalleryPane } from "@/components/workspace/ImageGalleryPane";
import { EstimateAiTrainingPane } from "@/components/workspace/EstimateAiTrainingPane";

type WorkspaceProps = {
  initialVehicles: Vehicle[];
  seedGalleries: Record<string, GalleryImage[]>;
  workspace: EstimateWorkspaceMeta;
};

export function Workspace({
  initialVehicles,
  seedGalleries,
  workspace,
}: WorkspaceProps) {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    () => initialVehicles[0]?.id ?? "",
  );
  const [isGalleryReady, setIsGalleryReady] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId) ?? null,
    [vehicles, selectedVehicleId],
  );

  useEffect(() => {
    const migrated = migrateLegacyEstimateStorage();
    const storedGalleries = migrated ?? loadGalleryStorage();
    const storedSelectedId = loadSelectedVehicleId();

    const merged = mergeWithGallerySeed(
      initialVehicles,
      seedGalleries,
      storedGalleries,
    );

    const selectedExists = merged.some((v) => v.id === storedSelectedId);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only gallery hydration
    setVehicles(merged);
    setSelectedVehicleId(
      selectedExists && storedSelectedId
        ? storedSelectedId
        : (merged[0]?.id ?? ""),
    );
    setIsGalleryReady(true);
  }, [initialVehicles, seedGalleries]);

  useEffect(() => {
    if (!isGalleryReady) return;
    saveGalleryStorage(vehicles);
    if (selectedVehicleId) {
      saveSelectedVehicleId(selectedVehicleId);
    }
  }, [vehicles, selectedVehicleId, isGalleryReady]);

  const handleAddProject = async (values: NewProjectFormValues) => {
    setIsCreatingProject(true);
    setSyncError(null);

    try {
      const created = await createVehicleViaApi(values);
      setVehicles((prev) => [created, ...prev]);
      setSelectedVehicleId(created.id);
    } catch (error) {
      setSyncError(
        error instanceof Error ? error.message : "プロジェクトの保存に失敗しました",
      );
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleAddPhotos = async (files: FileList) => {
    if (!selectedVehicleId) return;

    setIsUploadingPhotos(true);
    setSyncError(null);

    try {
      const images = await createGalleryImagesFromFiles(files);
      if (images.length === 0) return;

      const current = vehicles.find((v) => v.id === selectedVehicleId);
      if (!current) return;

      const nextStatus =
        current.status === "awaiting_intake" ? "photo_done" : current.status;

      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === selectedVehicleId
            ? {
                ...vehicle,
                galleryImages: [...vehicle.galleryImages, ...images],
                status: nextStatus,
              }
            : vehicle,
        ),
      );

      if (nextStatus !== current.status) {
        await updateVehicleViaApi(selectedVehicleId, { status: nextStatus });
      }
    } catch (error) {
      setSyncError(
        error instanceof Error ? error.message : "写真の保存に失敗しました",
      );
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  return (
    <div className="estimate-workspace-theme flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <EstimateWorkspaceTopBar
        appTitle={workspace.appTitle}
        aiAnalyzingPercent={workspace.dashboard.aiAnalyzingPercent}
      />
      {syncError ? (
        <div
          className="shrink-0 border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
          role="alert"
        >
          {syncError}
        </div>
      ) : null}
      <div className="flex min-h-0 flex-1 bg-canvas">
        <VehicleProjectListPane
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={setSelectedVehicleId}
          onAddProject={handleAddProject}
          isCreatingProject={isCreatingProject}
        />
        <ImageGalleryPane
          vehicle={selectedVehicle}
          onAddPhotos={handleAddPhotos}
          isUploading={isUploadingPhotos}
        />
        <EstimateAiTrainingPane vehicle={selectedVehicle} />
      </div>
    </div>
  );
}
