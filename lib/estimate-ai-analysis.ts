import { type Vehicle, type VehicleStatus } from "@/lib/estimate-schema";

export type AiAnalysisTabDisplay = {
  photoCount: number;
  damageBullets: string[];
  /** 写真なし・解析前などの補足（vehicle.aiAnalysisSummary を流用） */
  statusNote: string | null;
};

/** AI ANALYSIS タブ用の表示データ（損傷サマリーはダミー） */
export function getAiAnalysisTabDisplay(vehicle: Vehicle): AiAnalysisTabDisplay {
  const photoCount = vehicle.galleryImages.length;
  const statusNote =
    photoCount === 0 || vehicle.status === "awaiting_intake"
      ? vehicle.aiAnalysisSummary
      : null;

  return {
    photoCount,
    damageBullets: buildDummyDamageBullets(vehicle),
    statusNote,
  };
}

function buildDummyDamageBullets(vehicle: Vehicle): string[] {
  const { galleryImages, status } = vehicle;
  const count = galleryImages.length;

  if (count === 0) {
    return [];
  }

  return DUMMY_DAMAGE_BY_STATUS[status](vehicle);
}

type DamageBulletBuilder = (vehicle: Vehicle) => string[];

const DUMMY_DAMAGE_BY_STATUS: Record<VehicleStatus, DamageBulletBuilder> = {
  awaiting_intake: () => [],
  photo_done: (vehicle) => [
    `${vehicle.galleryImages.length} 枚の写真をアップロード済み`,
    "損傷部位の自動検出はキュー待ち（ダミー）",
    "全体前・右サイド・リヤの各角度から要約予定",
  ],
  ai_analyzing: () => [
    "フロントバンパー（左）: キズ「深」・へこみ「中」",
    "左フロントフェンダー: 線状キズ",
    "塗装: 割れの疑い（要現地確認）",
    "ドア交換: 不要と推定",
  ],
};
