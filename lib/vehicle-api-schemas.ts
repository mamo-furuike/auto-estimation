import { z } from "zod";

import { vehicleStatusSchema } from "@/lib/estimate-schema";

export const newProjectFormSchema = z.object({
  primeContractorName: z.string().min(1, "元請先名を入力してください"),
  customerName: z.string().min(1, "お客様名を入力してください"),
  vehicleName: z.string().min(1, "車名を入力してください"),
  plateInput: z.string().min(1, "ナンバーを入力してください"),
  entryDate: z.string().min(1, "入庫日を入力してください"),
});

export const vehiclePatchSchema = z
  .object({
    primeContractorName: z.string().min(1).optional(),
    customerName: z.string().min(1).optional(),
    vehicleName: z.string().min(1).optional(),
    plateOffice: z.string().optional(),
    plateClass: z.string().optional(),
    plateHiragana: z.string().optional(),
    plateNumber: z.string().optional(),
    entryDate: z.string().optional(),
    status: vehicleStatusSchema.optional(),
    aiAnalysisSummary: z.string().optional(),
    mamoEstimate: z
      .object({
        title: z.string(),
        thumbnailCaption: z.string(),
      })
      .optional(),
    aiLearning: z
      .object({
        progressPercent: z.number(),
        modelsTrained: z.number(),
      })
      .optional(),
    aiDraftEstimate: z
      .object({
        lines: z.array(
          z.object({
            id: z.string(),
            label: z.string(),
            amountYen: z.number(),
            lineKind: z.enum(["part", "labor", "other"]),
          }),
        ),
        totalYen: z.number(),
      })
      .optional(),
  })
  .strict();
