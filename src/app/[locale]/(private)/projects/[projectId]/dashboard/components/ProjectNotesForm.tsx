"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Loader2 } from "lucide-react";
import {
  createProjectNoteSchema,
  CreateProjectNoteSchemaValues,
} from "@/schemas/projectNote/createProjectNoteSchema";
import { toast } from "sonner";
import { createProjectNoteAction } from "@/actions/projectNotes/createProjectNoteAction";
import { ProjectNotesWithDetails } from "@/repositories/IProjectNotesRepository";
import { updateProjectNoteAction } from "@/actions/projectNotes/updateProjectNoteAction";

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

      toast.success(
        "Observação atualizada com sucesso! O usuário possui 30 minutos para editá-la se desejar."
      );

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

    toast.success(
      "Observação criada com sucesso! O usuário possui 30 minutos para editá-la se desejar."
    );

    form.reset();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4  w-full"
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                {/* O {...field} substitui o value e onChange manuais */}
                <Textarea
                  placeholder="Adicionar nova observação..."
                  className="resize-y"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Observação
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
