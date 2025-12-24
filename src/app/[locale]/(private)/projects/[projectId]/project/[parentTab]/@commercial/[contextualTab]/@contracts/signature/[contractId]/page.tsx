import { getContractAction } from "@/actions/contract/getContract";
import { DocumensoEmbedding } from "@/components/DocumensoEmbedding";
import { SectionHeading } from "@/components/SectionHeading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { envVariables } from "@/env";
import { AppError } from "@/errors/AppError";
import { Link } from "@/i18n/navigation";
import { operationWrapper } from "@/lib/operationWrapper";
import { ContractWithDetails } from "@/repositories/IContractRepository";
import { makeDocumentSignService } from "@/services/documenso/makeDocumentSignService";
import { AlertCircle, ArrowLeft } from "lucide-react";

interface ISignature {
  params: Promise<{ contractId: string }>;
}

export default async function Signature({ params }: ISignature) {
  const { contractId } = await params;

  const [error, success] = await operationWrapper<ContractWithDetails>(
    "action",
    "getContractAction",
    () => {
      return getContractAction(contractId);
    },
    {
      cache: "no-cache",
    }
  );

  if (error) {
    throw error;
  }

  if (!success.externalSignId) {
    throw new AppError("Identificador de assinatura não localizado");
  }

  const signService = makeDocumentSignService();
  const tokens = await signService.getSigningTokens(success.externalSignId);

  const host = envVariables.DOCUMENSO_API_URL.split("/api")[0];

  return (
    <div className="space-y-4">
      <div className="flex gap-10">
        <Link
          href={`/projects/${success.projectId}/project/commercial/contracts/`}
          prefetch={false}
        >
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <SectionHeading
          title="Assinatura de Contrato"
          description="Verifique o documento e assine o contrato para liberação do projeto para pagamento"
        />
      </div>
      <div className="flex flex-col items-center justify-center space-y-6">
        <Alert className="bg-accent/10 border-accent/30 max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>
            Abaixo é apresentado o contrato para assinatura, na forma que o
            cliente verá ao acessar. O cliente não terá acesso às informações do
            projeto enquanto não realizar o pagamento inicial. O acesso será
            concedido automáticamente, no momento do reconhecimento da
            respectiva quitação.
          </AlertDescription>
        </Alert>

        <Separator />

        <Card className="w-full max-w-6xl shadow-lg border-t-4 border-t-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Assinatura de Contrato
            </CardTitle>
            <CardDescription className="text-base">
              Olá! Para iniciarmos nossa parceria no projeto{" "}
              <strong>{success.project.client.tradeName}</strong>, por favor
              revise e assine o documento abaixo.
            </CardDescription>
          </CardHeader>
          <Separator />

          <CardContent className="pt-6">
            <div className="bg-background rounded-[var(--radius)] border overflow-hidden h-[700px]">
              <DocumensoEmbedding signingToken={tokens[0].token} host={host} />
            </div>
          </CardContent>
          <CardFooter className="w-full flex flex-col align-center justify-center">
            <Separator />
            <p className="mt-4 text-sm text-muted-foreground">
              Ambiente seguro e autenticado por <strong>Zofia Code Labs</strong>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
