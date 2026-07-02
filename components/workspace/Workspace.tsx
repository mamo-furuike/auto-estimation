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
 * - 写真 URL → Neon metadata.images + ギャラリー表示用 localStorage キャッシュ
 */

import { useEffect, useMemo, useState } from "react";

import {
  type GalleryImage,
  type Vehicle,
  type EstimateWorkspaceMeta,
} from "@/lib/estimate-schema";
import { type NewProjectFormValues } from "@/lib/estimate-vehicle-factory";
import { uploadGalleryFilesToBlob } from "@/lib/gallery-upload";
import { uploadPdfFileToBlob } from "@/lib/pdf-upload";
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
  addProjectImagesViaApi,
  setProjectPdfViaApi,
  deleteProjectPdfViaApi,
  deleteProjectViaApi,
  fetchVehiclesFromApi,
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
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [isDeletingPdf, setIsDeletingPdf] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
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
      const urls = await uploadGalleryFilesToBlob(files);
      if (urls.length === 0) return;

      const updated = await addProjectImagesViaApi(selectedVehicleId, urls);

      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === selectedVehicleId ? updated : vehicle,
        ),
      );
    } catch (error) {
      setSyncError(
        error instanceof Error ? error.message : "写真の保存に失敗しました",
      );
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const handleUploadPdf = async (file: File) => {
    if (!selectedVehicleId) return;

    setIsUploadingPdf(true);
    setSyncError(null);

    try {
      const url = await uploadPdfFileToBlob(file);
      const updated = await setProjectPdfViaApi(selectedVehicleId, url);

      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === selectedVehicleId ? updated : vehicle,
        ),
      );
    } catch (error) {
      setSyncError(
        error instanceof Error
          ? error.message
          : "PDF の保存に失敗しました",
      );
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleDeletePdf = async () => {
    if (!selectedVehicleId) return;

    setIsDeletingPdf(true);
    setSyncError(null);

    try {
      const updated = await deleteProjectPdfViaApi(selectedVehicleId);

      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === selectedVehicleId ? updated : vehicle,
        ),
      );
    } catch (error) {
      setSyncError(
        error instanceof Error
          ? error.message
          : "PDF の削除に失敗しました",
      );
    } finally {
      setIsDeletingPdf(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    setIsDeletingProject(true);
    setSyncError(null);

    try {
      await deleteProjectViaApi(id);

      const refreshed = await fetchVehiclesFromApi();
      const storedGalleries = loadGalleryStorage();
      const merged = mergeWithGallerySeed(
        refreshed,
        seedGalleries,
        storedGalleries,
      );

      setVehicles(merged);
      setSelectedVehicleId((current) => {
        if (merged.some((vehicle) => vehicle.id === current)) {
          return current;
        }
        return merged[0]?.id ?? "";
      });
    } catch (error) {
      setSyncError(
        error instanceof Error
          ? error.message
          : "プロジェクトの削除に失敗しました",
      );
      throw error;
    } finally {
      setIsDeletingProject(false);
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
          onDeleteProject={handleDeleteProject}
          isCreatingProject={isCreatingProject}
          isDeletingProject={isDeletingProject}
        />
        <ImageGalleryPane
          vehicle={selectedVehicle}
          onAddPhotos={handleAddPhotos}
          isUploading={isUploadingPhotos}
        />
        <EstimateAiTrainingPane
          vehicle={selectedVehicle}
          onUploadPdf={handleUploadPdf}
          onDeletePdf={handleDeletePdf}
          isUploadingPdf={isUploadingPdf}
          isDeletingPdf={isDeletingPdf}
        />
      </div>
    </div>
  );
}
