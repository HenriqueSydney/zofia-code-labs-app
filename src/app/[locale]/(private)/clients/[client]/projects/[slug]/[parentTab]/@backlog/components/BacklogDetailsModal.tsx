"use client";

import { BacklogItemWithDetails } from "@/repositories/IBacklogItemsRepository";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, useState } from "react";
import { BacklogDetails } from "./BacklogDetails";
import { BacklogForm } from "./BacklogForm";

interface IBacklogDetails {
  item: BacklogItemWithDetails;
  children: ReactNode;
  canManageBacklog: boolean;
}
export function BacklogDetailsModal({
  item,
  children,
  canManageBacklog,
}: IBacklogDetails) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  function handleCloseModal() {
    setIsDialogOpen(false);
    setIsEditOpen(false);
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl">Detalhes da Tarefa</DialogTitle>
          <DialogDescription>
            Informações detalhadas do item no backlog.
          </DialogDescription>
        </DialogHeader>
        {!isEditOpen && (
          <BacklogDetails
            item={item}
            setIsDialogOpen={setIsDialogOpen}
            setIsEditOpen={setIsEditOpen}
            canManageBacklog={canManageBacklog}
          />
        )}

        {isEditOpen && canManageBacklog && (
          <BacklogForm
            backlog={item}
            handleCloseModal={handleCloseModal}
            projectId={item.projectId}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
