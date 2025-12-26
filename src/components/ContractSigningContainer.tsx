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

interface IContractSigningContainer {
  contractId: string;
}

export async function ContractSigningContainer({
  contractId,
}: IContractSigningContainer) {
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

  const [_, proposalSuccess] = await operationWrapper<ProposalWithDetails>(
    "action",
    "getProposalAction",
    () => {
      return getProposalAction(success.proposalId);
    },
    {
      cache: "no-cache",
    }
  );

  const signService = makeDocumentSignService();

  const [tokens, status] = await Promise.all([
    signService.getSigningTokens(success.externalSignId),
    signService.getDocumentStatus(success.externalSignId),
  ]);

  console.log(status);

  const host = envVariables.DOCUMENSO_API_URL.split("/api")[0];
  return (
    <Card
      className={cn(
        "w-full shadow-lg border-t-4 border-t-primary",
        status.status === "COMPLETED" ? "max-w-7xl" : "max-w-6xl"
      )}
    >
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Assinatura de Contrato
        </CardTitle>
        <CardDescription className="text-base">
          <p>
            Olá! Para iniciarmos nossa parceria no projeto{" "}
            <strong>{success.project.client.tradeName}</strong>, por favor
            revise e assine o contrato abaixo.
          </p>
          {proposalSuccess && (
            <p className="text-muted-foreground">
              Ao final do documento, é apresentado o resumo da proposta que
              consta no contrato para facilitar a compreensão
            </p>
          )}
        </CardDescription>
      </CardHeader>
      <Separator />

      <CardContent className="pt-6 space-y-6">
        <div
          className={cn(
            "bg-background rounded-[var(--radius)] border overflow-hidden ",
            status.status === "COMPLETED" ? "" : "h-[800px]"
          )}
        >
          {status.status !== "COMPLETED" && (
            <DocumensoEmbedding signingToken={tokens[1].token} host={host} />
          )}

          {status.status === "COMPLETED" && <ContractSigningDetails />}
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
