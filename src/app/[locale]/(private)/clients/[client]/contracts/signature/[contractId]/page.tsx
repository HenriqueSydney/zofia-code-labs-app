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
        <ContractSigningContainer contractId={contractId} />
      </div>
    </div>
  );
}
