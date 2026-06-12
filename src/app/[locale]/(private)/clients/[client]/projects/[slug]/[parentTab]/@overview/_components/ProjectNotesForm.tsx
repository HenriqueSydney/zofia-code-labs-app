"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Plus, Loader2 } from "lucide-react";
import {
  createProjectNoteSchema,
  CreateProjectNoteSchemaValues,
} from "@/schemas/projectNote/createProjectNoteSchema";
import { toast } from "sonner";
import { createProjectNoteAction } from "@/actions/projectNotes/createProjectNoteAction";
import { ProjectNotesWithDetails } from "@/repositories/IProjectNotesRepository";
import { updateProjectNoteAction } from "@/actions/projectNotes/updateProjectNoteAction";
import { FormTextarea } from "@/components/form/FormTextarea";
import { useTranslations } from "next-intl";

interface ProjectNotesForm {
  projectId: string;
  note?: ProjectNotesWithDetails;
  handleCloseModal?: () => void;
}

export function ProjectNotesForm({
  projectId,
  note,
  handleCloseModal,
}: ProjectNotesForm) {
  const t = useTranslations("projects.notes");
  const tCommon = useTranslations("common");
  // Simulação de estado de loading (substitua pela sua lógica real)
  const isPending = false;

  // 2. Inicialização do Form
  const form = useForm<CreateProjectNoteSchemaValues>({
    resolver: zodResolver(createProjectNoteSchema),
    defaultValues: {
      content: note?.content ?? "",
    },
  });

  // 3. Função de Submit
  async function onSubmit(data: CreateProjectNoteSchemaValues) {
    if (note) {
      const result = await updateProjectNoteAction(projectId, {
        id: note.id,
        ...data,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(t("toastUpdated"));

      if (handleCloseModal) {
        handleCloseModal();
      }

      form.setValue("content", data.content);
      return;
    }
    const result = await createProjectNoteAction(projectId, data);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(t("toastCreated"));

    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4  w-full"
      >
        <FormTextarea
          control={form.control}
          name="content"
          placeholder={t("placeholder")}
          className="resize-y"
          rows={4}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tCommon("saving")}
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                {t("addButton")}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
