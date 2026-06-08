"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const BUTTON_VARIANTS = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const;

const BUTTON_SIZES = [
  "default",
  "xs",
  "sm",
  "lg",
] as const;

const BUTTON_ICON_SIZES = ["icon", "icon-xs", "icon-sm", "icon-lg"] as const;

const BADGE_VARIANTS = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "ghost",
  "link",
] as const;

const BADGE_SIZES = ["default", "xs"] as const;

export function CatalogShowcase() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col gap-10 bg-background px-4 py-10 text-foreground">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-xl font-semibold tracking-tight">
              shadcn/ui カタログ
            </h1>
            <p className="text-sm text-muted-foreground">
              このリポジトリの <code className="rounded bg-muted px-1 py-0.5 text-xs">Button</code>{" "}
              と <code className="rounded bg-muted px-1 py-0.5 text-xs">Badge</code>{" "}
              の variant / size を一覧します（Base UI 版）。
            </p>
          </div>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "no-underline",
            )}
          >
            見積ワークスペースへ
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle emphasis="prominent">Button · variant</CardTitle>
          <CardDescription>ラベルは variant 名（開発時の指定値）。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-wrap gap-3">
            {BUTTON_VARIANTS.map((v) => (
              <Button key={v} type="button" variant={v} size="default">
                {v}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle emphasis="prominent">Button · size</CardTitle>
          <CardDescription>
            variant は <code className="rounded bg-muted px-1 py-0.5 text-xs">outline</code>{" "}
            固定で、高さとタイポのみ比較。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-wrap items-center gap-3">
            {BUTTON_SIZES.map((s) => (
              <Button key={s} type="button" variant="outline" size={s}>
                {s}
              </Button>
            ))}
          </div>
          <Separator />
          <p className="text-xs font-medium text-muted-foreground">
            アイコン専用サイズ（中身はすべて Sparkles）
          </p>
          <div className="flex flex-wrap items-center gap-3">
            {BUTTON_ICON_SIZES.map((s) => (
              <Button
                key={s}
                type="button"
                variant="secondary"
                size={s}
                aria-label={s}
              >
                <Sparkles />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle emphasis="prominent">Button · 見積画面の例</CardTitle>
          <CardDescription>
            実際の見積ペインでは、学習キュー送りにこのボタンを使っています。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="default" size="sm">
              <Sparkles className="size-3.5" />
              AI学習！
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle emphasis="prominent">Badge · variant</CardTitle>
          <CardDescription>
            名札・タグ用途。デフォルトは <code className="rounded bg-muted px-1 py-0.5 text-xs">span</code>。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-wrap gap-3">
            {BADGE_VARIANTS.map((v) => (
              <Badge key={v} variant={v}>
                {v}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle emphasis="prominent">Badge · size</CardTitle>
          <CardDescription>variant は secondary 固定。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex flex-wrap items-center gap-3">
            {BADGE_SIZES.map((s) => (
              <Badge key={s} variant="secondary" size={s}>
                {s}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
