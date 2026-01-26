"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, useState } from "react";
import { BacklogForm } from "./BacklogForm";
import { ServiceDefaultBacklogItemWithDetails } from "@/repositories/IServiceDefaultBacklogItemsRepository";
import { BacklogDetails } from "./BacklogDetails";

interface IBacklogDetails {
  item: ServiceDefaultBacklogItemWithDetails;
  children: ReactNode;
}
export function BacklogDetailsModal({ item, children }: IBacklogDetails) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  function handleCloseModal() {
    setIsDialogOpen(false);
    setIsEditOpen(false);
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
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
          />
        )}

        {isEditOpen && (
          <BacklogForm
            backlog={item}
            handleCloseModal={handleCloseModal}
            serviceId={item.serviceTypeId}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
