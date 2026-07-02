import { z } from "zod";

export const vehicleStatusSchema = z.enum([
  "awaiting_intake",
  "photo_done",
  "ai_analyzing",
]);

export const galleryImageSchema = z.object({
  id: z.string(),
  capturedAtDisplay: z.string(),
  caption: z.string(),
  imageAlt: z.string(),
  /** アップロード画像の object URL（JSON ダミーデータには含まれない） */
  src: z.string().optional(),
});

export const aiDraftLineSchema = z.object({
  id: z.string(),
  label: z.string(),
  amountYen: z.number(),
  lineKind: z.enum(["part", "labor", "other"]),
});

export const vehicleSchema = z.object({
  id: z.string(),
  displayId: z.string(),
  primeContractorName: z.string(),
  customerName: z.string(),
  plateOffice: z.string(),
  plateClass: z.string(),
  plateHiragana: z.string(),
  plateNumber: z.string(),
  vehicleName: z.string(),
  entryDate: z.string(),
  status: vehicleStatusSchema,
  galleryImages: z.array(galleryImageSchema),
  aiAnalysisSummary: z.string(),
  mamoEstimate: z.object({
    title: z.string(),
    thumbnailCaption: z.string(),
  }),
  aiLearning: z.object({
    progressPercent: z.number(),
    modelsTrained: z.number(),
  }),
  aiDraftEstimate: z.object({
    lines: z.array(aiDraftLineSchema),
    totalYen: z.number(),
  }),
  /** Vercel Blob にアップロードした見積 PDF URL */
  pdfUrl: z.string().url().optional(),
});

export const vehiclesDataSchema = z.object({
  vehicles: z.array(vehicleSchema),
});

export const estimateWorkspaceSchema = z.object({
  name: z.string(),
  icon: z.string(),
  appTitle: z.string(),
  dashboard: z.object({
    aiAnalyzingPercent: z.number(),
  }),
});

export type VehicleStatus = z.infer<typeof vehicleStatusSchema>;
export type GalleryImage = z.infer<typeof galleryImageSchema>;
export type AiDraftLine = z.infer<typeof aiDraftLineSchema>;
export type Vehicle = z.infer<typeof vehicleSchema>;
export type VehiclesData = z.infer<typeof vehiclesDataSchema>;
export type EstimateWorkspaceMeta = z.infer<typeof estimateWorkspaceSchema>;

export function formatPlate(v: Vehicle): string {
  return `${v.plateOffice} ${v.plateClass} ${v.plateHiragana} ${v.plateNumber}`;
}
