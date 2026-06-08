"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, LayoutDashboard, Palette } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Pane1Toggle } from "@/components/workspace/Pane1Toggle";

type EstimateNavPaneProps = {
  workspaceName: string;
};

export function EstimateNavPane({ workspaceName }: EstimateNavPaneProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isCatalog = pathname === "/catalog";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border [&_[data-slot=sidebar-container]]:bg-sidebar"
    >
      <SidebarHeader className="border-b border-sidebar-border p-0">
        <div className="flex h-12 items-center justify-between gap-2 px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 group-data-[state=expanded]:px-5">
          <h2 className="truncate text-sm font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            {workspaceName}
          </h2>
          <Pane1Toggle />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1 py-3 group-data-[collapsible=icon]:hidden">
        <SidebarGroup className="px-1">
          <SidebarGroupLabel className="px-2 text-xs font-semibold tracking-wide text-sidebar-foreground/70 uppercase">
            メニュー
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isHome}
                  aria-current={isHome ? "page" : undefined}
                  render={<Link href="/" />}
                  tooltip="見積一覧"
                >
                  <Car />
                  <span>見積一覧</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isCatalog}
                  aria-current={isCatalog ? "page" : undefined}
                  render={<Link href="/catalog" />}
                  tooltip="UI カタログ"
                >
                  <Palette />
                  <span>UI カタログ</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton type="button">
                  <LayoutDashboard />
                  <span>ダッシュボード（予定）</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
