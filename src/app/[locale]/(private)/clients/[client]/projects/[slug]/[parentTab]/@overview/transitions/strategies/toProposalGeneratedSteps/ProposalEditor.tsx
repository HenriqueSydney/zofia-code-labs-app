// src/components/features/projects/transitions/strategies/steps/ProposalEditor.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProposalDetails } from "@/components/ProposalDetail";
import { Link } from "@/i18n/navigation";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Eye } from "lucide-react";
import { date } from "@/lib/dayjs";
import { AttachmentIcon } from "@/components/AttachmentIcon";
import { changeProposalStatusAction } from "@/actions/proposal/changeProposalStatus";
import { toast } from "sonner";

export function ProposalEditor({ project, onSuccess, contextData }: any) {
  const [loading, setLoading] = useState(false);

  const handleSendToAproval = async () => {
    setLoading(true);
    try {
      const result = await changeProposalStatusAction(contextData.id, "REVIEW");

      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result.message ?? "Proposta encaminhada para aprovação com sucesso"
      );
      onSuccess();
    } catch (error) {
      toast.error(
        "Erro inesperado ao encaminhar a proposta para aprovação. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">
        Revisão da Proposta Gerada
      </h3>
      <ProposalDetails proposal={contextData} />

      <Separator className="my-4" />
      {contextData.sourceType === "SYSTEM_TEMPLATE" && (
        <Alert className="bg-accent/10 border-accent/30">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>
            Esta proposta foi gerada a partir de um Modelo de Documento de
            Proposta padrão. Revise-o{" "}
            <Link
              href={`/projects/${project.id}/project/commercial/proposals/${contextData.id}`}
              className="hover:underline"
            >
              ("Acessar o Rascunho")
            </Link>{" "}
            antes de confirma e encaminhá-lo para aprovação
          </AlertDescription>
        </Alert>
      )}

      {contextData.sourceType === "MANUAL_UPLOAD" && (
        <div className="space-y-4">
          <div>
            <h3>Proposta Comercial</h3>
            <span className="text-sm font-medium leading-none text-muted-foreground">
              Verifique a proposta antes de encaminhar para aprovação
            </span>
          </div>

          <Link href={contextData.fileUrl ?? ""} className="cursor-pointer">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <AttachmentIcon extension="pdf" />
                <div>
                  <p className="text-sm font-medium line-clamp-1">
                    Proposta Comercial Gerada
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {date(contextData.createdAt).format("DD/MM/YYYY HH:mm")}
                  </p>
                </div>
              </div>
              <Button variant="ghost">
                <Eye className="w-4 y-4" />
              </Button>
            </div>
          </Link>
        </div>
      )}

      <div className="flex justify-end gap-2 ">
        <Link
          href={`/projects/${project.id}/project/commercial/proposals/${contextData.id}`}
        >
          <Button variant="outline" disabled={loading}>
            Acessar o Rascunho
          </Button>
        </Link>
        <Button onClick={handleSendToAproval} disabled={loading}>
          Confirmar e encaminhar para aprovação
        </Button>
      </div>
    </div>
  );
}
