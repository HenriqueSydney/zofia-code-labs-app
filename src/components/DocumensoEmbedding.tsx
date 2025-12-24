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
        // O css prop injeta estilos DENTRO do iframe (Platform/Self-hosted)
        css={`
          /* Garante que o container flex interno não centralize o conteúdo */
          .documenso-embed,
          .embed--Root,
          #document-container {
            justify-content: flex-start !important;
            align-items: center !important;
            padding-top: 0 !important;
            margin-top: 0 !important;
          }

          /* Ajusta a altura interna para evitar scroll excessivo dentro do iframe */
          body {
            overflow-y: auto !important;
          }
        `}
        cssVars={{
          "--documenso-primary": "hsl(var(--primary))",
          "--documenso-border-radius": "var(--radius)",
          "--documenso-bg-color": "hsl(var(--background))",
        }}
      />
    </div>
  );
};
