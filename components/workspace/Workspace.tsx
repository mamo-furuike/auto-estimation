"use client";

/**
 * Workspace: 見積アプリ向け 3 ペイン（車両一覧 / 画像ギャラリー / 見積＆AI学習）
 *
 * 左端のアプリサイドバーは非表示とし、3 列を全幅で表示する。
 *
 * ライトキャンバス + ネイビーアクセントは `.estimate-workspace-theme`（globals.css）
 */

import { useEffect, useMemo, useState } from "react";

import {
  type Vehicle,
  type EstimateWorkspaceMeta,
} from "@/lib/estimate-schema";
import {
  createVehicleFromForm,
  type NewProjectFormValues,
} from "@/lib/estimate-vehicle-factory";
import { createGalleryImagesFromFiles } from "@/lib/gallery-upload";
import {
  loadEstimateStorage,
  saveEstimateStorage,
} from "@/lib/estimate-storage";
import { EstimateWorkspaceTopBar } from "@/components/workspace/EstimateWorkspaceTopBar";
import { VehicleProjectListPane } from "@/components/workspace/VehicleProjectListPane";
import { ImageGalleryPane } from "@/components/workspace/ImageGalleryPane";
import { EstimateAiTrainingPane } from "@/components/workspace/EstimateAiTrainingPane";

type WorkspaceProps = {
  initialVehicles: Vehicle[];
  workspace: EstimateWorkspaceMeta;
};

export function Workspace({ initialVehicles, workspace }: WorkspaceProps) {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    () => initialVehicles[0]?.id ?? "",
  );
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId) ?? null,
    [vehicles, selectedVehicleId],
  );

  useEffect(() => {
    const stored = loadEstimateStorage();
    if (stored) {
      // localStorage はクライアントのみ。マウント後に復元する（SSR との hydration 分離）
      // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only storage hydration
      setVehicles(stored.vehicles);
      setSelectedVehicleId(stored.selectedVehicleId);
    }
    setIsStorageReady(true);
  }, []);

  useEffect(() => {
    if (!isStorageReady) return;
    saveEstimateStorage({ vehicles, selectedVehicleId });
  }, [vehicles, selectedVehicleId, isStorageReady]);

  const handleAddProject = (values: NewProjectFormValues) => {
    const nextVehicle = createVehicleFromForm(values, vehicles);
    setVehicles((prev) => [nextVehicle, ...prev]);
    setSelectedVehicleId(nextVehicle.id);
  };

  const handleAddPhotos = async (files: FileList) => {
    if (!selectedVehicleId) return;

    setIsUploadingPhotos(true);
    try {
      const images = await createGalleryImagesFromFiles(files);
      if (images.length === 0) return;

      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.id === selectedVehicleId
            ? {
                ...vehicle,
                galleryImages: [...vehicle.galleryImages, ...images],
                status:
                  vehicle.status === "awaiting_intake"
                    ? "photo_done"
                    : vehicle.status,
              }
            : vehicle,
        ),
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
      <div className="flex min-h-0 flex-1 bg-canvas">
        <VehicleProjectListPane
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={setSelectedVehicleId}
          onAddProject={handleAddProject}
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
