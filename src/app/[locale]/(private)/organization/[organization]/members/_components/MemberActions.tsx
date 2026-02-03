"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2, UserCog } from "lucide-react";
import { useState } from "react";
// Importar seus modais de edição/deleção aqui

interface MemberActionsProps {
  orgId: string;
  member: any; // Tipar corretamente com o retorno do Prisma
}

export function MemberActions({ orgId, member }: MemberActionsProps) {
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => setIsEditRoleOpen(true)}>
            <UserCog className="mr-2 h-4 w-4" />
            Alterar Perfil/Cargo
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setIsRemoveOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remover da Equipe
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modais de controle */}
      {/* <EditMemberRoleDialog open={isEditRoleOpen} ... /> */}
      {/* <RemoveMemberAlertDialog open={isRemoveOpen} ... /> */}
    </>
  );
}
