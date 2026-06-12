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
import { Download,  Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface IProjectDocumentsActions {
  projectDocument: ProjectDocuments;
  canManage: boolean;
}

export function ProjectDocumentsActions({
  projectDocument,
  canManage,
}: IProjectDocumentsActions) {
  const t = useTranslations("projects.documents");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);
      window.open(url, "_blank");
    }
  };

  // const handleOpenExternal = (url: string) => {
  //   window.open(url, "_blank", "noopener,noreferrer");
  // };

  const handleRemoveDocument = async () => {
    const result = await removeDocument(
      projectDocument.id,
      projectDocument.projectId,
    );

    if (!result.success) {
      toast.error(t("removeError"));
      setIsDialogOpen(false);
      return;
    }

    toast.success(t("removeSuccess"));
    setIsDialogOpen(false);
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        title={t("downloadFile")}
        onClick={() =>
          handleDownload(
            projectDocument.documentUrlReference,
            `${projectDocument.name}.${projectDocument.extension}`,
          )
        }
      >
        <Download className="h-3.5 w-3.5" />
      </Button>

      {/* <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        title={t("openNewTab")}
        onClick={() => handleOpenExternal(projectDocument.documentUrlReference)}
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </Button> */}

      {canManage && (
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
              title={t("removeFile")}
            >
              <Trash className="h-3.5 w-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("removeConfirmTitle")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-8 py-4">
              <div>
                <p>{t("removeConfirmMessage")}</p>
                <p>
                  <strong>{t("nameLabel")}</strong> {projectDocument.name}
                </p>
              </div>
              <div className="w-full flex justify-center mt-4">
                <Button
                  variant="destructive"
                  title={t("removeFile")}
                  onClick={handleRemoveDocument}
                >
                  <Trash className="h-3.5 w-3.5" />
                  {t("removeButton")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
