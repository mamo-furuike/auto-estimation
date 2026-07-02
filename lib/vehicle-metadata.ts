import { z } from "zod";

import { aiDraftLineSchema } from "@/lib/estimate-schema";

export const vehicleMetadataSchema = z.object({
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
  /** Vercel Blob にアップロードした画像 URL */
  images: z.array(z.string().url()).default([]),
  /** Vercel Blob にアップロードした見積 PDF URL */
  pdf_url: z.string().url().nullable().default(null),
});

export type VehicleMetadata = z.infer<typeof vehicleMetadataSchema>;

export const defaultVehicleMetadata: VehicleMetadata = {
  aiAnalysisSummary: "新規登録。写真・解析は未開始です。",
  mamoEstimate: {
    title: "マモさんの見積（PDF）",
    thumbnailCaption: "未アップロード",
  },
  aiLearning: {
    progressPercent: 0,
    modelsTrained: 14,
  },
  aiDraftEstimate: {
    lines: [],
    totalYen: 0,
  },
  images: [],
  pdf_url: null,
};
