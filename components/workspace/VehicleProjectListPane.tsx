"use client";

import { useState } from "react";
import { MoreVertical, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatPlate, type Vehicle } from "@/lib/estimate-schema";
import {
  VEHICLE_STATUS_LABEL,
  vehicleStatusBadgeVariant,
} from "@/lib/estimate-labels";
import { type NewProjectFormValues } from "@/lib/estimate-vehicle-factory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DeleteConfirmDialog } from "@/components/workspace/DeleteConfirmDialog";
import { NewProjectDialog } from "@/components/workspace/NewProjectDialog";

function formatEntryDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

type VehicleProjectListPaneProps = {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onSelectVehicle: (id: string) => void;
  onAddProject: (values: NewProjectFormValues) => void | Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  isCreatingProject?: boolean;
  isDeletingProject?: boolean;
};

export function VehicleProjectListPane({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onAddProject,
  onDeleteProject,
  isCreatingProject = false,
  isDeletingProject = false,
}: VehicleProjectListPaneProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget || isDeletingProject) return;

    try {
      await onDeleteProject(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      // Workspace 側で syncError を表示
    }
  };

  return (
    <section className="flex w-[300px] shrink-0 flex-col border-r border-border bg-card">
      <header className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
        <h2 className="truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          プロジェクト（車両 ID）
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
            <DropdownMenuItem disabled>並び替え（準備中）</DropdownMenuItem>
            <DropdownMenuItem disabled>フィルター（準備中）</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-2 p-3">
          {vehicles.map((v) => {
            const active = v.id === selectedVehicleId;
            return (
              <Card
                key={v.id}
                size="sm"
                className={cn(
                  "cursor-pointer py-3 transition-shadow ring-offset-background",
                  active
                    ? "ring-2 ring-primary ring-offset-2"
                    : "hover:shadow-sm",
                )}
                onClick={() => onSelectVehicle(v.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectVehicle(v.id);
                  }
                }}
                aria-current={active ? "true" : undefined}
              >
                <CardContent className="flex flex-col gap-3 px-3">
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-sm font-semibold text-foreground">
                        {v.displayId} {v.vehicleName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {v.customerName} · {v.primeContractorName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatPlate(v)} · 入庫 {formatEntryDate(v.entryDate)}
                      </span>
                    </div>
                    <div
                      className="shrink-0"
                      onClick={(event) => event.stopPropagation()}
                      onMouseDown={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`${v.displayId} のメニュー`}
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={isDeletingProject}
                            onClick={() => {
                              // Base UI Menu は onSelect 非対応。メニュー閉鎖後にダイアログを開く。
                              window.setTimeout(() => {
                                setDeleteTarget(v);
                              }, 0);
                            }}
                          >
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={vehicleStatusBadgeVariant(v.status)}
                      className="w-fit"
                    >
                      {VEHICLE_STATUS_LABEL[v.status]}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      <footer className="shrink-0 border-t border-border p-3">
        <Button
          type="button"
          className="w-full"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="size-4" />
          新規プロジェクト
        </Button>
      </footer>

      <NewProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={onAddProject}
        isSubmitting={isCreatingProject}
      />

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isDeletingProject) {
            setDeleteTarget(null);
          }
        }}
        title="プロジェクトを削除"
        itemName={
          deleteTarget
            ? `${deleteTarget.displayId} ${deleteTarget.vehicleName}`
            : ""
        }
        onConfirm={handleConfirmDelete}
        isConfirming={isDeletingProject}
      />
    </section>
  );
}
