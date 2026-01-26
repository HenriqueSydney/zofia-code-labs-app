"use server";
import { getContractAction } from "@/actions/contract/getContract";
import { getProposalAction } from "@/actions/proposal/getProposal";
import { envVariables } from "@/env";
import { AppError } from "@/errors/AppError";
import { operationWrapper } from "@/lib/operationWrapper";
import { ContractWithDetails } from "@/repositories/IContractRepository";
import { ProposalWithDetails } from "@/repositories/IProposalRepository";
import { makeDocumentSignService } from "@/services/documenso/makeDocumentSignService";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DocumensoEmbedding } from "@/components/DocumensoEmbedding";
import { ProposalDetails } from "@/components/ProposalDetail";
import { Separator } from "./ui/separator";
import { ContractSigningDetails } from "./ContractSigningDetails";
import { cn } from "@/lib/utils";
import { auth } from "@/auth";

interface IContractSigningContainer {
  contractId: string;
}

export async function ContractSigningContainer({
  contractId,
}: IContractSigningContainer) {
  const [contractResponse, authData] = await Promise.all([
    operationWrapper<ContractWithDetails>(
      "action",
      "getContractAction",
      () => {
        return getContractAction(contractId);
      },
      {
        cache: "no-cache",
      },
    ),

    auth(),
  ]);

  const [error, success] = contractResponse;

  if (error) {
    throw error;
  }

  if (!success.externalSignId) {
    throw new AppError("Identificador de assinatura não localizado");
  }

  const [_, proposalSuccess] = await operationWrapper<ProposalWithDetails>(
    "action",
    "getProposalAction",
    () => {
      return getProposalAction(success.proposalId);
    },
    {
      cache: "no-cache",
    },
  );

  const signService = makeDocumentSignService();

  const document = await signService.getDocumentInfo(success.externalSignId);

  const host = envVariables.DOCUMENSO_API_URL.split("/api")[0];

  const signingToken = document.recipients.find(
    (recipient) =>
      // recipient.email === authData?.user.email &&
      recipient.role === "SIGNER" && recipient.signingStatus === "NOT_SIGNED",
  );


  return (
    <Card
      className={cn(
        "w-full shadow-lg border-t-4 border-t-primary",
        document.status === "COMPLETED" ? "max-w-7xl" : "max-w-6xl",
      )}
    >
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Assinatura de Contrato
        </CardTitle>
        <CardDescription className="text-base">
          Olá! Para iniciarmos nossa parceria no projeto{" "}
          <strong>{success.project.client.tradeName}</strong>, por favor revise
          e assine o contrato abaixo.
          {proposalSuccess && (
            <span className="text-muted-foreground">
              <br />
              Ao final do documento, é apresentado o resumo da proposta que
              consta no contrato para facilitar a compreensão
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <Separator />

      <CardContent className="pt-6 space-y-6">
        <div
          className={cn(
            "bg-background rounded-[var(--radius)] border overflow-hidden ",
            document.status === "COMPLETED" ? "" : "h-[800px]",
          )}
        >
          {document.status !== "COMPLETED" && signingToken && (
            <DocumensoEmbedding signingToken={signingToken.token} host={host} />
          )}

          {(document.status === "COMPLETED" || !signingToken) && (
            <ContractSigningDetails signingDocument={document} />
          )}
        </div>
        <Separator />
        {proposalSuccess && (
          <div className="mt-10 border rounded-md p-4 space-y-6">
            <h4 className="text-xl font-bold tracking-tight">
              Detalhes da proposta
            </h4>
            <ProposalDetails proposal={proposalSuccess} />
          </div>
        )}
      </CardContent>
      <CardFooter className="w-full flex flex-col align-center justify-center">
        <Separator />
        <p className="mt-4 text-sm text-muted-foreground">
          Ambiente seguro e autenticado por <strong>Zofia Code Labs</strong>
        </p>
      </CardFooter>
    </Card>
  );
}
