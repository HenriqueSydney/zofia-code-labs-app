import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import { UserMenu } from "./UserMenu";
import { ThemeToggle } from "./ThemeToogle";
import { auth } from "@/auth";
import { InternalizationSelect } from "./InternalizationSelect";

export async function SidebarHeader() {
  const session = await auth();

  return (
    <header className="border-b border-border bg-card sticky top-0 z-10">
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger size="icon" className="cursor-pointer" />
          <Image
            src="/zofia-logo.webp"
            alt="Zofia Code Labs"
            width={677}
            height={369}
            className="h-14 w-auto"
            priority
          />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <InternalizationSelect />
          {session && <UserMenu session={session} />}
        </div>
      </div>
    </header>
  );
}
