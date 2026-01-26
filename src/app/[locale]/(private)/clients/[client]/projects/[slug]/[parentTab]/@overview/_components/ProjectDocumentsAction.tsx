"use client";

import { removeDocument } from "@/actions/documents/removeDocumentAction";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectDocuments } from "@/generated/prisma/client";
import { Download, ExternalLink, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface IProjectDocumentsActions {
  projectDocument: ProjectDocuments;
}

export function ProjectDocumentsActions({
  projectDocument,
}: IProjectDocumentsActions) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename; // Define o nome do arquivo no download
      document.body.appendChild(link);
      link.click();

      // Limpeza
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Erro ao fazer download:", error);
      // Fallback: abre em nova aba se o fetch falhar (ex: erro de CORS)
      window.open(url, "_blank");
    }
  };

  const handleOpenExternal = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleRemoveDocument = async () => {
    const result = await removeDocument(
      projectDocument.id,
      projectDocument.projectId
    );

    if (!result.success) {
      toast.error("Falha ao remover o arquivo. Tente novamente mais tarde");
      setIsDialogOpen(false);
      return;
    }

    toast.error("Arquivo removido com sucesso");
    setIsDialogOpen(false);
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        title="Baixar arquivo"
        onClick={() =>
          handleDownload(
            projectDocument.documentUrlReference,
            `${projectDocument.name}.${projectDocument.extension}`
          )
        }
      >
        <Download className="h-3.5 w-3.5" />
      </Button>

      {/* Botão de Link Externo */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        title="Abrir em nova aba"
        onClick={() => handleOpenExternal(projectDocument.documentUrlReference)}
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </Button>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-red-500 text-red-400"
            title="Remover Arquivo"
          >
            <Trash className="h-3.5 w-3.5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirmação de remoção de arquivo</DialogTitle>
          </DialogHeader>
          <div className="space-y-8 py-4">
            <div>
              <p>Confirma que deseja remover o arquivo abaixo informado?</p>
              <p>
                <strong>Nome:</strong> {projectDocument.name}
              </p>
            </div>
            <div className="w-full flex justify-center mt-4">
              <Button
                variant="destructive"
                title="Remover Arquivo"
                onClick={handleRemoveDocument}
              >
                <Trash className="h-3.5 w-3.5" />
                Remover arquivo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
