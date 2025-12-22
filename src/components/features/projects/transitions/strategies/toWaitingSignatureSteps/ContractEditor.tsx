// src/components/features/projects/transitions/strategies/steps/ContractEditor.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProposalDetails } from "@/components/ProposalDetail";
import { Link } from "@/i18n/navigation";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Eye } from "lucide-react";
import { date } from "@/lib/dayjs";
import { AttachmentIcon } from "@/components/AttachmentIcon";
import { changeContractStatusAction } from "@/actions/contract/changeContractStatus";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ContractEditor({ project, onSuccess, contract }: any) {
  const [loading, setLoading] = useState(false);

  const handleSendToAproval = async () => {
    setLoading(true);
    try {
      const result = await changeContractStatusAction(contract.id, "REVIEW");

      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(
        result.message ?? "Contrato encaminhado para aprovação com sucesso"
      );
      onSuccess();
    } catch (error) {
      toast.error(
        "Erro inesperado ao encaminhar a contrato para aprovação. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };
  const isTemplate = contract.sourceType === "SYSTEM_TEMPLATE";
  return (
    <div className="space-y-6">
      <div className="h-10 space-y-4 mb-6">
        <h3 className="text-lg font-medium">Revisão da Contrato Gerada</h3>

        <Separator className="my-4" />
      </div>
      {isTemplate && (
        <div>
          <Alert className="bg-accent/10 border-accent/30 mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              Esta contrato foi gerada a partir de um Modelo de Documento de
              Contrato padrão. Revise-o
              <Link
                href={`/projects/${project.id}/project/commercial/contracts/${contract.id}`}
                className="hover:underline"
              >
                ("Acessar o Rascunho")
              </Link>{" "}
              antes de confirma e encaminhá-lo para aprovação
            </AlertDescription>
          </Alert>
          <Separator className="my-4" />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documento Gerado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 text-sm text-muted-foreground">
            <strong>Origem:</strong>
            <span>
              {isTemplate ? "Modelo de Documento" : "Upload de arquivo"}
            </span>
          </div>
          <Separator />
          <Link href={contract.fileUrl ?? ""} target="_blank">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <AttachmentIcon extension="pdf" />
                <div>
                  <p className="text-sm font-medium line-clamp-1">
                    Visualizar PDF
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {date(contract.createdAt).format("DD/MM/YYYY")}
                  </p>
                </div>
              </div>
              <Eye className="w-4 h-4 text-muted-foreground" />
            </div>
          </Link>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 ">
        <Link
          href={`/projects/${project.id}/project/commercial/contracts/${contract.id}`}
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
