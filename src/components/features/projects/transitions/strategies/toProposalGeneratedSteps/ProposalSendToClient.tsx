import { useState } from "react";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ProposalDetails } from "@/components/ProposalDetail";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "@/i18n/navigation";
import { date } from "@/lib/dayjs";
import { AttachmentIcon } from "@/components/AttachmentIcon";
import { changeProposalStatusAction } from "@/actions/proposal/changeProposalStatus";
import { toast } from "sonner";

interface ProposalSendToClientProps {
  proposal: any;
  onSuccess: () => void;
  onBack?: () => void;
}

export function ProposalSendToClient({
  proposal,
  onSuccess,
}: ProposalSendToClientProps) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const result = await changeProposalStatusAction(proposal.id, "APPROVED");

      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Proposta aprovada com sucesso");
      onSuccess();
    } catch (error) {
      toast.error(
        "Erro inesperado ao encaminhar a proposta ao cliente. Tente novamente mais tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  const isTemplate = proposal.sourceType === "SYSTEM_TEMPLATE";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Cabeçalho de Status */}
      <Alert className="bg-accent/10 border-accent/30">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Aprovação Pendente</AlertTitle>
        <AlertDescription>
          Revise os dados abaixo. Após a aprovação, a proposta estará pronta
          para ser enviada ao cliente.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna Principal - Detalhes */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Conteúdo da Proposta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProposalDetails proposal={proposal} />
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral - Resumo e Ações */}
        <div className="flex flex-col space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Proposta comercial Gerada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-2 text-sm text-muted-foreground">
                  <strong>Origem:</strong>
                  {isTemplate && <span>Modelo de Documento</span>}
                  {!isTemplate && <span>Upload de arquivo</span>}
                </div>
                <Separator />
                <div className="space-y-4">
                  <Link
                    href={proposal.fileUrl ?? ""}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <AttachmentIcon extension="pdf" />
                        <div>
                          <p className="text-sm font-medium line-clamp-1">
                            Proposta Comercial Gerada
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {date(proposal.createdAt).format(
                              "DD/MM/YYYY HH:mm"
                            )}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost">
                        <Eye className="w-4 y-4" />
                      </Button>
                    </div>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="flex flex-col flex-1">
            <CardHeader>
              <CardTitle className="text-base">Canal de comunicação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <Separator />

              <div className="pt-2 h-full flex flex-col justify-between items-center">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  onClick={handleApprove}
                  disabled={loading}
                >
                  {loading ? (
                    "Processando..."
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Aprovar Proposta
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
