"use client";

import { Bell, Car, Files } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type EstimateWorkspaceTopBarProps = {
  appTitle: string;
  aiAnalyzingPercent: number;
};

export function EstimateWorkspaceTopBar({
  appTitle,
  aiAnalyzingPercent,
}: EstimateWorkspaceTopBarProps) {
  const pct = Math.min(100, Math.max(0, Math.round(aiAnalyzingPercent)));

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card px-3">
      <div className="flex min-w-0 shrink-0 items-center gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Car className="size-4" aria-hidden />
        </div>
        <span className="truncate text-sm font-semibold text-foreground">
          {appTitle}
        </span>
      </div>

      <div className="mx-auto flex min-w-0 max-w-xl flex-1 flex-col gap-1 px-2">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[11px] font-medium text-muted-foreground">
            AI 解析中…
          </span>
          <span className="shrink-0 tabular-nums text-[11px] text-muted-foreground">
            {pct}%
          </span>
        </div>
        <Progress value={pct} className="w-full flex-col gap-0" />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="ドキュメント一覧（ダミー）"
              >
                <Files className="size-4" />
              </Button>
            }
          />
          <TooltipContent>ドキュメント</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="relative"
                aria-label="通知（ダミー）"
              >
                <Bell className="size-4" />
                <Badge
                  variant="destructive"
                  size="xs"
                  className="absolute -top-0.5 -right-0.5 min-w-[1rem] px-0.5"
                >
                  2
                </Badge>
              </Button>
            }
          />
          <TooltipContent>通知</TooltipContent>
        </Tooltip>
        <Avatar className="size-8">
          <AvatarFallback className="bg-secondary text-xs text-secondary-foreground">
            MK
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
