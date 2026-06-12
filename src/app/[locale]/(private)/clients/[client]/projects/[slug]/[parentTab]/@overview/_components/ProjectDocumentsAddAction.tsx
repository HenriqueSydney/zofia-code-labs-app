"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FilePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { uploadDocumentsAction } from "@/actions/documents/uploadDocumentsAction";
import { FormMultiFileUpload } from "@/components/form/FormMultiFileUpload";
import { useTranslations } from "next-intl";

interface IProjectDocumentsAddAction {
  projectId: string;
  variant?: "outline" | "default" | "ghost";
}

// Schema simples apenas para validar que existem arquivos
const createUploadSchema = (minFilesMessage: string) =>
  z.object({
    documents: z.array(z.instanceof(File)).min(1, minFilesMessage),
  });

type UploadSchemaType = z.infer<ReturnType<typeof createUploadSchema>>;

export function ProjectDocumentsAddAction({
  projectId,
  variant = "ghost",
}: IProjectDocumentsAddAction) {
  const t = useTranslations("projects.documents");
  const tCommon = useTranslations("common");
  const tActions = useTranslations("common.actions");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const uploadSchema = createUploadSchema(t("validationMinFiles"));

  const form = useForm<UploadSchemaType>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      documents: [],
    },
  });

  const onSubmit = (data: UploadSchemaType) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("projectId", projectId);

      // Anexa os arquivos ao FormData
      // Nota: O nome 'files' deve bater com o que seu Server Action espera receber
      data.documents.forEach((file) => {
        formData.append("files", file);
      });

      const result = await uploadDocumentsAction(formData);

      if (result.success) {
        toast.success(result.message);
        form.reset(); // Limpa o formulário
        setIsDialogOpen(false); // Fecha o modal
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Se fechar sem salvar, reseta o form para limpar os arquivos selecionados
      setTimeout(() => form.reset(), 300);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm" className="gap-1">
          <FilePlus className="h-4 w-4" />
          {t("add")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("addDialogTitle")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            {/* O componente novo substitui toda a lógica manual de Dropzone, 
              listagem, remoção e ícones. 
            */}
            <FormMultiFileUpload
              control={form.control}
              name="documents"
              label={t("filesLabel")}
              description={t("filesDescription")}
              maxFiles={10} // Ajuste conforme sua regra de negócio
              disabled={isPending}
              accept={{
                "application/pdf": [".pdf"],
                "image/*": [".png", ".jpg", ".jpeg"],
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                  [".docx"],
                "application/vnd.ms-excel": [".xls"],
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                  [".xlsx"],
              }}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isPending}
              >
                {tActions("cancel")}
              </Button>

              <Button
                type="submit"
                disabled={
                  !form.formState.isValid ||
                  isPending ||
                  form.watch("documents")?.length === 0
                }
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("uploading")}
                  </>
                ) : (
                  t("save")
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
