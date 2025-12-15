"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import { UserMenu } from "./UserMenu";

export function SidebarHeader() {
  return (
    <header className="border-b border-border bg-card sticky top-0 z-10">
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger size="icon" className="cursor-pointer" />
          <Image
            src="/zofia-logo.webp"
            alt="Zofia Code Labs"
            width={100}
            height={100}
            priority
          />
        </div>

        <div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
