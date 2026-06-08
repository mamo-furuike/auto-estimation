import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UI カタログ",
  description: "Button / Badge の variant・size 一覧（workspace-ui-kit）",
};

export default function CatalogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
