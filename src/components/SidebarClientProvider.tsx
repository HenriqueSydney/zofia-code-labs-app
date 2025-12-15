"use client";

import { SidebarProvider } from "@/components/ui/sidebar";

export function SidebarClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
