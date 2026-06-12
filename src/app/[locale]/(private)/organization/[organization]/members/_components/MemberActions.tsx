"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  UserCog,
  Trash2,
  Shield,
  LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

// Importe seus componentes
import { EditMemberRoleDialog } from "./EditMemberRoleDialog";
import { RemoveMemberAlertDialog } from "./RemoveMemberAlertDialog";
import { GivePermissionToUserForm } from "./GivePermissionToUserForm";
import { CustomRoleWithUsage } from "@/repositories/IOrganizationRepository";
import {
  DropdownMenu,
  DrowpdownMenuItemsType,
} from "@/components/DropdownMenu";

interface MemberActionsProps {
  orgId: string;
  customRolesList: CustomRoleWithUsage[];
  member: any; // Substituir pela tipagem correta (Prisma/Types)
  canManage?: boolean;
}

export function MemberActions({
  orgId,
  member,
  customRolesList,
  canManage = true,
}: MemberActionsProps) {
  const t = useTranslations("organization.members.actions");
  const tCommon = useTranslations("common.actions");
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);

  // Configuração do Menu (Map)
  const menuItems: DrowpdownMenuItemsType[] = [
    {
      type: "action",
      label: t("changeRole"),
      icon: UserCog,
      onClick: () => setIsEditRoleOpen(true),
    },
    {
      type: "action",
      label: t("grantPermissions"),
      icon: Shield,
      onClick: () => setIsPermissionsOpen(true),
    },
    {
      type: "separator",
    },
    {
      type: "action",
      label: t("removeFromTeam"),
      icon: Trash2,
      onClick: () => setIsRemoveOpen(true),
      className: "text-destructive focus:text-destructive",
    },
  ];

  if (!canManage) {
    return null;
  }

  return (
    <>
      <DropdownMenu label={tCommon("label")} menuItems={menuItems} />

      {/* Renderização dos Modais */}
      <EditMemberRoleDialog
        open={isEditRoleOpen}
        onOpenChange={setIsEditRoleOpen}
        member={member}
        orgId={orgId}
        customRolesList={customRolesList}
      />

      <GivePermissionToUserForm
        open={isPermissionsOpen} // Você precisará adaptar o componente para receber 'open' via props se ainda não tiver
        onOpenChange={setIsPermissionsOpen} // Adapte o componente para aceitar este callback
        orgId={orgId}
        member={member}
      />

      <RemoveMemberAlertDialog
        open={isRemoveOpen}
        onOpenChange={setIsRemoveOpen}
        member={member}
        orgId={orgId}
      />
    </>
  );
}
