"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { DropzoneUpload } from "@/components/DropzoneUpload";
import { FilePlus, FileText, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadDocumentsAction } from "@/actions/documents/uploadDocumentsAction";

interface IProjectDocumentsAddAction {
  projectId: string;
}

// Função utilitária para formatar bytes (caso não tenha uma global)
function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function ProjectDocumentsAddAction({
  projectId,
}: IProjectDocumentsAddAction) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;

    const formData = new FormData();
    formData.append("projectId", projectId);

    // Anexa todos os arquivos ao FormData
    files.forEach((file) => {
      formData.append("files", file);
    });

    startTransition(async () => {
      const result = await uploadDocumentsAction(formData);

      if (result.success) {
        toast.success(result.message);
        setFiles([]); // Limpa a lista
        setIsDialogOpen(false); // Fecha o modal
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setFiles([]); // Limpa arquivos ao fechar sem salvar
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <FilePlus className="h-4 w-4" />
          Adicionar
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Adicionar arquivos ao projeto</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Área de Upload */}
          <div className="space-y-4">
            <DropzoneUpload
              value={files}
              onChange={setFiles} // Atualiza o estado local
              multiple={true}
              maxFiles={5}
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

            {/* Lista de Arquivos Selecionados */}
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Arquivos selecionados ({files.length}):
                </p>
                <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-2">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between p-3 border rounded-md bg-background hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 rounded bg-primary/10 text-primary">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col truncate">
                          <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-[280px]">
                            {file.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatBytes(file.size)}
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                        onClick={() => handleRemoveFile(index)}
                        disabled={isPending}
                      >
                        <X className="w-4 h-4" />
                        <span className="sr-only">Remover arquivo</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={files.length === 0 || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Salvar Arquivos"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
