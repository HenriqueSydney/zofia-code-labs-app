"use server";

import { auth } from "@/auth";
import { UnauthorizedError, ValidationError } from "@/errors";
import { makeGetOrganizationUseCase } from "@/useCases/organization/factories/makeGetOrganizationUseCase";
import { OrganizationIdentifierType } from "@/useCases/organization/GetOrganizationUseCase"; // Importe o tipo se necessário

interface IParams {
  slug?: string;
  organizationId?: string;
  cnpj?: string;
}

export async function getOrganizationAction(params: IParams) {
  const session = await auth();

  if (!session) {
    throw new UnauthorizedError("notLoggedIn");
  }

  // 1. Helper para resolver qual identificador usar (Prioridade: ID > Slug > CNPJ)
  const { identifier, type } = resolveIdentifier(params);

  const useCase = makeGetOrganizationUseCase();

  const { organization } = await useCase.execute({
    userId: session.user.id,
    identifier,
    identifierType: type,
  });

  // Serializa os dados para passar do Server Component para o Client Component (se necessário)
  return { organization: organization };
}

// Função auxiliar para limpar a lógica principal
function resolveIdentifier(params: IParams): {
  identifier: string;
  type: OrganizationIdentifierType;
} {
  if (params.organizationId) {
    return { identifier: params.organizationId, type: "id" };
  }

  if (params.slug) {
    return { identifier: params.slug, type: "slug" };
  }

  if (params.cnpj) {
    // Remove formatação se vier mascarado, para bater com o banco (opcional, depende de como salva)
    const rawCnpj = params.cnpj.replace(/\D/g, "");
    return { identifier: rawCnpj, type: "cnpj" };
  }

  throw new ValidationError("Nenhum identificador da organização informado.");
}
