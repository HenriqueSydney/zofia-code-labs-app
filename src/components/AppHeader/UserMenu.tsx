"use client";

import { Building2, ChevronDown, LogOut, ShieldUser, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/twMerge"; // Assumindo que você tem o cn do shadcn
import { Session } from "next-auth";
import { Role } from "@/generated/prisma/enums";
import { canAccessOrganizationArea } from "@/lib/auth/organizationAccess";

// 1. Sub-componente para evitar duplicação da lógica de Avatar e Iniciais
interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  className?: string;
}

function UserAvatar({ name, image, className }: UserAvatarProps) {
  const userNames = name?.split(" ") || ["U"];
  const initials = (
    userNames[0].charAt(0) +
    (userNames.length > 1 ? userNames[userNames.length - 1].charAt(0) : "")
  ).toUpperCase();

  return (
    <Avatar className={cn("bg-primary border-2 border-primary", className)}>
      {image && <AvatarImage src={image} alt={`${name} avatar`} />}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}

interface IUserMenuProps {
  session: Session;
}

export function UserMenu({ session }: IUserMenuProps) {
  const t = useTranslations("header");
  const tUserMenu = useTranslations("navigation.userMenu");
  const tProfile = useTranslations("userProfile");

  const tCommon = useTranslations("common");
  const user = session.user;
  const userName = user.name || tCommon("user");

  const menuItems = [
    {
      label: tProfile("myProfile"),
      href: `/user/${user.id}`,
      icon: User,
    },
    {
      label: tUserMenu("myOrganization"),
      href: `/organization/${user.organizationId}`,
      icon: Building2,
      visible: canAccessOrganizationArea(user, user.organizationId),
    },
    // {
    //   label: tUserMenu("adminDashboard"),
    //   href: "/admin",
    //   icon: ShieldUser,
    //   visible: user.role === Role.OWNER,
    // },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="group hover:shadow-glow transition-all duration-300 gap-2 pl-1 pr-3"
        >
          <UserAvatar name={user.name} image={user.image} className="w-7 h-7" />

          <span className="hidden 2xl:block truncate max-w-[150px]">
            {userName}
          </span>

          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 px-2 pt-5 pb-2" align="end">
        {/* Cabeçalho do Dropdown */}
        <div className="flex flex-col items-center justify-center gap-2 mb-2">
          <UserAvatar
            name={user.name}
            image={user.image}
            className="w-20 h-20"
          />

          <div className="text-center">
            <p className="font-medium text-sm truncate max-w-[200px]">
              {userName}
            </p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {user.email}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Renderização dinâmica dos itens */}
        {menuItems.map((item) => {
          if (item.visible === false) return null;
          const Icon = item.icon;

          return (
            <DropdownMenuItem key={item.href} asChild>
              <Link href={item.href} className="cursor-pointer w-full">
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          data-testid="logout-button"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("logoutButton")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// 3. Skeleton extraído para manter o componente principal focado
function UserMenuSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-8 w-24 hidden 2xl:block" />
    </div>
  );
}
