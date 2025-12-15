"use client";

import { SidebarInset } from "@/components/ui/sidebar";

export function SidebarInsetClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarInset>{children}</SidebarInset>;
}
