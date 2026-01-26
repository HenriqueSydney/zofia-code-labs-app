"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import { ProjectNotesWithDetails } from "@/repositories/IProjectNotesRepository";
import { Edit, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ProjectNotesForm } from "./ProjectNotesForm";
import { removeProjectNoteAction } from "@/actions/projectNotes/removeProjectNoteAction";

interface IProjectNotesActions {
  note: ProjectNotesWithDetails;
  userId?: string;
}

export function ProjectNotesActions({ note, userId }: IProjectNotesActions) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleDelete(id: string) {
    setIsRemoving(true);
    const result = await removeProjectNoteAction(note.projectId, { id });
    setIsRemoving(false);
    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success("Observação excluída com sucesso!");
  }
  const canEdit = note.updatedAt
    ? date().diff(date(note.updatedAt), "minute") < 30
    : date().diff(date(note.createdAt), "minute") < 30;

  const isSameUser = userId === note.userId;

  if (!canEdit || !isSameUser) return null;

  return (
    <div className="flex">
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={isRemoving}
            className="flex items-center justify-center"
          >
            <Edit className="h-4 w-4 " />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Observação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4"></div>
          <ProjectNotesForm
            projectId={note.projectId}
            note={note}
            handleCloseModal={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={isRemoving}
        onClick={() => handleDelete(note.id)}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
