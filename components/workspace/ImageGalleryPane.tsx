"use client";

import { useRef, useState } from "react";
import { Copy, ImagePlus, MoreVertical, Settings } from "lucide-react";

import { type GalleryImage, type Vehicle } from "@/lib/estimate-schema";
import { getAiAnalysisTabDisplay } from "@/lib/estimate-ai-analysis";
import {
  VEHICLE_STATUS_LABEL,
  vehicleStatusBadgeVariant,
} from "@/lib/estimate-labels";
import { GALLERY_ACCEPT_INPUT } from "@/lib/gallery-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ImageGalleryPaneProps = {
  vehicle: Vehicle | null;
  onAddPhotos: (files: FileList) => Promise<void>;
  isUploading?: boolean;
};

export function ImageGalleryPane({
  vehicle,
  onAddPhotos,
  isUploading = false,
}: ImageGalleryPaneProps) {
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!vehicle) {
    return (
      <section className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-border bg-background">
        <header className="flex h-11 shrink-0 items-center border-b border-border px-3">
          <h2 className="text-sm font-semibold text-foreground">ギャラリー</h2>
        </header>
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
          左の一覧から車両を選択してください。
        </div>
      </section>
    );
  }

  const handleCopyId = () => {
    void navigator.clipboard.writeText(vehicle.displayId);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleSelectPhotos = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files || files.length === 0) return;
    void onAddPhotos(files).finally(() => {
      event.target.value = "";
    });
  };

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-border bg-background">
      <Tabs defaultValue="gallery" className="flex min-h-0 flex-1 flex-col gap-0">
        <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-border px-2">
          <TabsList variant="line" className="h-9 bg-transparent p-0">
            <TabsTrigger value="gallery" className="text-xs uppercase">
              IMAGE GALLERY
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs uppercase">
              AI ANALYSIS
            </TabsTrigger>
          </TabsList>
          <div className="flex shrink-0 items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="表示設定（ダミー）"
                  >
                    <Settings className="size-4" />
                  </Button>
                }
              />
              <TooltipContent>設定</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2">
          <span className="font-mono text-sm font-medium tabular-nums text-foreground">
            {vehicle.displayId}
          </span>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={handleCopyId}
                    aria-label="車両IDをコピー"
                  >
                    <Copy className="size-4" />
                  </Button>
                }
              />
              <TooltipContent>
                {copied ? "コピーしました" : "IDをコピー"}
              </TooltipContent>
            </Tooltip>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="その他メニュー（ダミー）"
            >
              <MoreVertical className="size-4" />
            </Button>
          </div>
        </div>

        <TabsContent
          value="gallery"
          className="mt-0 min-h-0 flex-1 overflow-hidden outline-none"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={GALLERY_ACCEPT_INPUT}
            multiple
            className="sr-only"
            aria-hidden
            tabIndex={-1}
            onChange={handleFileChange}
          />
          <ScrollArea className="h-full min-h-[200px]">
            <div className="flex flex-col gap-3 p-3">
              <div className="flex shrink-0 items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  JPG · PNG · HEIC（複数選択可）
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSelectPhotos}
                  disabled={isUploading}
                >
                  <ImagePlus className="size-4" />
                  写真を追加
                </Button>
              </div>

              {vehicle.galleryImages.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <p className="text-center text-sm text-muted-foreground">
                    写真はまだありません。
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSelectPhotos}
                    disabled={isUploading}
                  >
                    <ImagePlus className="size-4" />
                    写真を追加
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {vehicle.galleryImages.map((img) => (
                    <GalleryImageTile key={img.id} image={img} />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent
          value="analysis"
          className="mt-0 min-h-0 flex-1 overflow-hidden outline-none"
        >
          <AiAnalysisTabContent vehicle={vehicle} />
        </TabsContent>
      </Tabs>
    </section>
  );
}

function AiAnalysisTabContent({ vehicle }: { vehicle: Vehicle }) {
  const { photoCount, damageBullets, statusNote } =
    getAiAnalysisTabDisplay(vehicle);

  return (
    <ScrollArea className="h-full min-h-[200px]">
      <div className="flex flex-col gap-3 p-3">
        <Card size="sm">
          <CardHeader className="border-b">
            <CardTitle>アップロード写真</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">
                {photoCount}
              </span>
              <span className="text-sm text-muted-foreground">枚</span>
              <Badge variant={vehicleStatusBadgeVariant(vehicle.status)}>
                {VEHICLE_STATUS_LABEL[vehicle.status]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              IMAGE GALLERY に登録された写真の合計（アップロード・初期データ含む）
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader className="border-b">
            <CardTitle>損傷サマリー</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {damageBullets.length > 0 ? (
              <ul className="flex list-disc flex-col gap-1.5 pl-4 text-sm leading-relaxed text-foreground">
                {damageBullets.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                {statusNote ??
                  "写真を追加すると、AI が損傷を要約します（ダミー表示）。"}
              </p>
            )}
            {damageBullets.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                ※ ダミーデータです。本番では解析 API の結果を表示します。
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

function GalleryImageTile({ image }: { image: GalleryImage }) {
  return (
    <figure className="relative flex aspect-square flex-col overflow-hidden rounded-lg bg-muted ring-1 ring-border">
      <div className="relative flex flex-1 overflow-hidden">
        {image.src ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob URL from local upload
          <img
            src={image.src}
            alt={image.imageAlt}
            className="size-full object-cover"
          />
        ) : (
          <div
            className="flex size-full flex-col items-center justify-center p-2"
            role="img"
            aria-label={image.imageAlt}
          >
            <span className="text-[10px] text-muted-foreground">
              プレースホルダー
            </span>
          </div>
        )}
        <span className="absolute top-2 left-2 rounded bg-background/90 px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums text-foreground shadow-sm">
          {image.capturedAtDisplay}
        </span>
      </div>
      <figcaption className="border-t border-border bg-card px-1.5 py-1 text-center text-[10px] leading-tight text-muted-foreground">
        {image.caption}
      </figcaption>
    </figure>
  );
}
