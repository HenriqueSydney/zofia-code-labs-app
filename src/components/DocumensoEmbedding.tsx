"use client";

import { EmbedSignDocument } from "@documenso/embed-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface IDocumensoEmbedding {
  signingToken: string;
  host: string;
}

export const DocumensoEmbedding = ({
  signingToken,
  host,
}: IDocumensoEmbedding) => {
  const router = useRouter();
  const t = useTranslations("common.documenso");
  return (
    <div className="overflow-y-auto">
      <EmbedSignDocument
        darkModeDisabled={true}
        token={signingToken}
        host={host}
        lockName={false}
        onDocumentCompleted={() => {
          toast.success(t("documentSignedSuccess"));
          router.refresh();
        }}
        onDocumentError={(error) => {
          console.error("Erro no Documenso:", error);
          toast.error(t("loadContractError"));
        }}
        className="w-full min-h-[800px] bg-background flex flex-col justify-start"
       
      />
    </div>
  );
};
