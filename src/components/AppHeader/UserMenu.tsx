"use client";

import { ChevronDown, LogOut, ShieldUser, User } from "lucide-react";
import { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "../ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "../ui/skeleton";

export function UserMenu() {
  const { data: session, status } = useSession();

  const router = useRouter();
  const t = useTranslations("header");

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-24 hidden 2xl:block" />
      </div>
    );
  }

  if (!session) return null;

  const userNames = session.user.name
    ? session.user.name.split(" ")
    : ["Usuário", "Desconhecido"];
  const userName = `${userNames[0]} ${userNames[userNames.length - 1] ?? ""}`;
  const avatar = session.user.image;
  const fallbackAvatar = `${userNames[0].charAt(0)} ${
    userNames[userNames.length - 1].charAt(0) ?? ""
  }`.toUpperCase();

  function handleSignOut() {
    signOut();
    router.push("/auth/login");
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Button
          variant="outline"
          className=" hover:shadow-glow transition-all duration-300"
        >
          <Avatar className="w-7 h-7 bg-primary cursor-pointer border-2 border-primary">
            {avatar && <AvatarImage src={avatar} alt={`${userName} avatar`} />}
            <AvatarFallback>{fallbackAvatar}</AvatarFallback>
          </Avatar>
          <div className="hidden 2xl:flex">{userName}</div>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 bg-card px-2 pt-5 pb-2" align="end">
        <div className="w-full flex flex-col items-center justify-center">
          <Avatar className="w-24 h-24 bg-primary cursor-pointer border-2 border-primary">
            {avatar && <AvatarImage src={avatar} alt={`${userName} avatar`} />}
            <AvatarFallback>{fallbackAvatar}</AvatarFallback>
          </Avatar>

          <DropdownMenuLabel className="w-full flex flex-col items-center justify-center">
            <p className="font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">
              {session.user.email}
            </p>
          </DropdownMenuLabel>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/user/${session.user.id}`} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Meu Perfil</span>
          </Link>
        </DropdownMenuItem>
        {session.user.role === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link href={"/admin"} className="cursor-pointer">
              <ShieldUser className="mr-2 h-4 w-4" />
              <span>Admin Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleSignOut}
          data-testid="logout-button"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("logoutButton")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
