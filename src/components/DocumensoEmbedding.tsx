"use client";

import { EmbedSignDocument } from "@documenso/embed-react";
import { useRouter } from "next/navigation";
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
  return (
    <div className="overflow-y-auto">
      <EmbedSignDocument
        darkModeDisabled={true}
        token={signingToken}
        host={host}
        lockName={false}
        onDocumentCompleted={() => {
          toast.success("Documento assinado com sucesso!");
          router.refresh();
        }}
        onDocumentError={(error) => {
          console.error("Erro no Documenso:", error);
          toast.error("Ocorreu um erro ao carregar o contrato.");
        }}
        className="w-full min-h-[800px] bg-background flex flex-col justify-start"
       
      />
    </div>
  );
};
