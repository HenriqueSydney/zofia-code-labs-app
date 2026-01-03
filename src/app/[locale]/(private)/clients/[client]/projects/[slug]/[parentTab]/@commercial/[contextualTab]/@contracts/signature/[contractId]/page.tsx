import { ContractSigningContainer } from "@/components/ContractSigningContainer";
import { SectionHeading } from "@/components/SectionHeading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";

interface ISignature {
  params: Promise<{ contractId: string; slug: string }>;
}

export default async function Signature({ params }: ISignature) {
  const { contractId, slug } = await params;

  return (
    <div className="space-y-4">
      <div className="flex gap-10">
        <Link
          href={`/projects/${slug}/project/commercial/contracts/`}
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
        <ContractSigningContainer contractId={contractId} />
      </div>
    </div>
  );
}
