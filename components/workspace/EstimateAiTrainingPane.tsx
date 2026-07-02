"use client";

import { useRef } from "react";
import { MoreVertical, FileText, Upload } from "lucide-react";

import { type Vehicle } from "@/lib/estimate-schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function formatYen(amount: number) {
  if (amount === 0) {
    return "¥0";
  }
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(amount);
}

function AiLearningGauge({ value }: { value: number }) {
  const v = Math.min(100, Math.max(0, value));
  const r = 38;
  const c = 2 * Math.PI * r;
  const dash = c - (v / 100) * c;

  return (
    <div className="relative flex flex-col items-center">
      <svg
        className="size-28 -rotate-90 text-primary"
        viewBox="0 0 100 100"
        aria-hidden
        role="presentation"
      >
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          className="stroke-muted"
          strokeWidth="10"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          className="stroke-primary transition-[stroke-dashoffset] duration-500"
          strokeWidth="10"
          strokeDasharray={c}
          strokeDashoffset={dash}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center pt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
        {Math.round(v)}%
      </span>
    </div>
  );
}

function LearningTrendSparkline() {
  return (
    <svg
      viewBox="0 0 120 32"
      className="h-10 w-full text-primary"
      aria-hidden
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points="0,24 24,18 48,22 72,12 96,16 120,8"
      />
    </svg>
  );
}

type EstimateAiTrainingPaneProps = {
  vehicle: Vehicle | null;
  onUploadPdf?: (file: File) => Promise<void>;
  isUploadingPdf?: boolean;
};

export function EstimateAiTrainingPane({
  vehicle,
  onUploadPdf,
  isUploadingPdf = false,
}: EstimateAiTrainingPaneProps) {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  if (!vehicle) {
    return (
      <section className="flex w-[min(100%,380px)] shrink-0 flex-col bg-muted/40 lg:w-[380px]">
        <header className="flex h-11 shrink-0 items-center border-b border-border bg-card px-3">
          <h2 className="text-sm font-semibold text-foreground">
            見積＆AI学習
          </h2>
        </header>
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
          車両を選択してください。
        </div>
      </section>
    );
  }

  const pct = vehicle.aiLearning.progressPercent;
  const hasPdf = Boolean(vehicle.pdfUrl);

  const handleSelectPdf = () => {
    if (!isUploadingPdf) {
      pdfInputRef.current?.click();
    }
  };

  const handlePdfFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onUploadPdf) return;
    void onUploadPdf(file).finally(() => {
      event.target.value = "";
    });
  };

  return (
    <section className="flex w-[min(100%,380px)] shrink-0 flex-col bg-muted/40 lg:w-[380px]">
      <header className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-3">
        <h2 className="truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          見積＆AI学習
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="メニュー"
              >
                <MoreVertical className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>エクスポート（準備中）</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Card size="sm" className="py-3">
              <CardHeader className="border-0 px-3 pb-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {vehicle.mamoEstimate.title}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 px-3">
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  aria-hidden
                  tabIndex={-1}
                  onChange={handlePdfFileChange}
                />
                <div
                  className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-md bg-muted ring-1 ring-border"
                  role={hasPdf ? "img" : "button"}
                  tabIndex={hasPdf ? undefined : 0}
                  aria-label={
                    hasPdf
                      ? "PDF サムネイル"
                      : "PDF をアップロード（クリックしてファイルを選択）"
                  }
                  onClick={hasPdf ? undefined : handleSelectPdf}
                  onKeyDown={
                    hasPdf
                      ? undefined
                      : (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            handleSelectPdf();
                          }
                        }
                  }
                >
                  {isUploadingPdf ? (
                    <span className="px-2 text-center text-xs text-muted-foreground">
                      アップロード中…
                    </span>
                  ) : (
                    <>
                      {hasPdf ? (
                        <FileText className="size-10 text-primary" />
                      ) : (
                        <Upload className="size-10 text-muted-foreground" />
                      )}
                      <span className="px-2 text-center text-[10px] text-muted-foreground">
                        {vehicle.mamoEstimate.thumbnailCaption}
                      </span>
                    </>
                  )}
                </div>
                {hasPdf ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    render={
                      <a
                        href={vehicle.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    PDF を表示
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleSelectPdf}
                    disabled={isUploadingPdf || !onUploadPdf}
                  >
                    PDF をアップロード
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card size="sm" className="py-3">
              <CardHeader className="border-0 px-3 pb-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  AI学習進捗
                </p>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-2 px-3">
                <p className="text-[11px] text-muted-foreground">
                  学習済みモデル:{" "}
                  <span className="font-mono font-medium text-foreground tabular-nums">
                    {vehicle.aiLearning.modelsTrained}
                  </span>
                </p>
                <AiLearningGauge value={pct} />
                <Progress
                  value={pct}
                  className="w-full flex-col [&_[data-slot=progress-track]]:h-1.5"
                />
                <div className="w-full">
                  <p className="mb-1 text-[10px] text-muted-foreground">
                    直近トレンド（ダミー）
                  </p>
                  <LearningTrendSparkline />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card size="sm" className="py-3">
            <CardHeader className="border-b border-border px-3 pb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                AI生成見積（ドラフト）
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-0 px-0 pt-2 pb-0">
              {vehicle.aiDraftEstimate.lines.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                  ドラフト行がありません。
                </p>
              ) : (
                <div className="flex flex-col gap-0">
                  {vehicle.aiDraftEstimate.lines.map((line, i) => (
                    <div key={line.id}>
                      {i > 0 ? <Separator /> : null}
                      <div className="flex items-baseline justify-between gap-3 px-3 py-2">
                        <span className="min-w-0 flex-1 text-sm text-foreground">
                          {line.label}
                        </span>
                        <span className="shrink-0 font-mono text-sm tabular-nums text-foreground">
                          {formatYen(line.amountYen)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex items-baseline justify-between gap-3 bg-muted/50 px-3 py-2">
                    <span className="text-sm font-semibold text-foreground">
                      合計
                    </span>
                    <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                      {formatYen(vehicle.aiDraftEstimate.totalYen)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </section>
  );
}
