"use client";

import { Dispatch, ReactNode, SetStateAction } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "./ui/dialog";

interface IModal {
  children: ReactNode;
  modalTitle: string;
  setIsModalOpen: Dispatch<SetStateAction<any | null>>;
  isModalOpen: boolean;
}

export function Modal({
  children,
  modalTitle,
  setIsModalOpen,
  isModalOpen,
}: IModal) {
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-w-5xl w-full p-0 bg-background/95 backdrop-blur-sm p-5">
        <DialogTitle className="DialogTitle absolute top-5 left-5">
          {modalTitle}
        </DialogTitle>
        <DialogClose
          asChild
          className="absolute right-4 cursor-pointer top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <div>
            <span className="sr-only">Fechar</span>
          </div>
        </DialogClose>
        <div className="mt-10">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
