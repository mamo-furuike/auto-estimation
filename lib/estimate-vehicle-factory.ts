import { type Vehicle } from "@/lib/estimate-schema";

export type NewProjectFormValues = {
  primeContractorName: string;
  customerName: string;
  vehicleName: string;
  plateInput: string;
  entryDate: string;
};

export function parsePlateInput(input: string): {
  plateOffice: string;
  plateClass: string;
  plateHiragana: string;
  plateNumber: string;
} {
  const trimmed = input.trim();
  const spaced = trimmed.split(/\s+/).filter(Boolean);

  if (spaced.length >= 4) {
    return {
      plateOffice: spaced[0] ?? "",
      plateClass: spaced[1] ?? "",
      plateHiragana: spaced[2] ?? "",
      plateNumber: spaced.slice(3).join(""),
    };
  }

  const compact = trimmed.replace(/\s/g, "");
  const match = compact.match(
    /^([\u4e00-\u9faf]{1,4})(\d{1,3})([ぁ-ん])(\d{1,4})$/u,
  );

  if (match) {
    return {
      plateOffice: match[1] ?? "",
      plateClass: match[2] ?? "",
      plateHiragana: match[3] ?? "",
      plateNumber: match[4] ?? "",
    };
  }

  return {
    plateOffice: trimmed,
    plateClass: "—",
    plateHiragana: "—",
    plateNumber: "—",
  };
}

export function nextVehicleIds(vehicles: Vehicle[]): {
  id: string;
  displayId: string;
} {
  const displayNums = vehicles
    .map((v) => Number.parseInt(v.displayId.replace(/^#/, ""), 10))
    .filter((n) => Number.isFinite(n));
  const nextNum = displayNums.length > 0 ? Math.max(...displayNums) + 1 : 1;

  return { id: `v-${nextNum}`, displayId: `#${nextNum}` };
}

export function createVehicleFromForm(
  values: NewProjectFormValues,
  existingVehicles: Vehicle[],
): Vehicle {
  const { id, displayId } = nextVehicleIds(existingVehicles);
  const plate = parsePlateInput(values.plateInput);
  const modelsTrained = existingVehicles[0]?.aiLearning.modelsTrained ?? 14;

  return {
    id,
    displayId,
    primeContractorName: values.primeContractorName.trim(),
    customerName: values.customerName.trim(),
    ...plate,
    vehicleName: values.vehicleName.trim(),
    entryDate: values.entryDate,
    status: "awaiting_intake",
    galleryImages: [],
    aiAnalysisSummary: "新規登録。写真・解析は未開始です。",
    mamoEstimate: {
      title: "マモさんの見積（PDF）",
      thumbnailCaption: "未アップロード",
    },
    aiLearning: {
      progressPercent: 0,
      modelsTrained,
    },
    aiDraftEstimate: {
      lines: [],
      totalYen: 0,
    },
  };
}
