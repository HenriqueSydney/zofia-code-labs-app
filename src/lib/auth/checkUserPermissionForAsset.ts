// lib/auth/permissions.ts
import { makeUserRepository } from "@/repositories/factories/makeUserRepository";
import { AuthProjectNotesStrategy } from "./strategies/auth-project-notes-strategy";
import { AuthProjectStrategy } from "./strategies/auth-project-strategy";
import { AppError } from "@/errors/AppError";
import { Operation } from "./strategies/types";
import { AuthProjectDocumentsStrategy } from "./strategies/auth-project-documents-strategy copy";
import { AuthDocumentTemplateStrategy } from "./strategies/auth-document-template-strategy";
import { AuthProposalStrategy } from "./strategies/auth-proposal-strategy";

// Mapa de estratégias
const strategies = {
  project: new AuthProjectStrategy(),
  projectNotes: new AuthProjectNotesStrategy(),
  documents: new AuthProjectDocumentsStrategy(),
  documentTemplate: new AuthDocumentTemplateStrategy(),
  proposal: new AuthProposalStrategy(),
  contract: new AuthProposalStrategy(),
  backlog: new AuthProposalStrategy(),
  client: new AuthProposalStrategy(),
  clientEmployee: new AuthProposalStrategy(),
  expenseCategory: new AuthProposalStrategy(),
  integrationType: new AuthProposalStrategy(),
  organizationIntegration: new AuthProposalStrategy(),
  // comment: new CommentStrategy(),
} as const; // 'as const' ajuda na tipagem

type ResourceType = keyof typeof strategies;

export async function checkUserPermissionForAsset<T extends ResourceType>(
  resourceType: T,
  userId: string,
  asset: any,
  operation: Operation = "READ"
) {
  const userRepository = makeUserRepository();
  const user = await userRepository.findUserById(userId);

  if (!user) throw new AppError("Usuário não localizado");

  if (asset && user.organizationId !== asset.organizationId) {
    throw new AppError("Usuário não autorizado para atualizar recurso");
  }

  const strategy = strategies[resourceType];

  if (!strategy) {
    throw new Error(
      `Estratégia de segurança não definida para: ${resourceType}`
    );
  }

  // Executa a validação
  strategy.validate(user, asset, operation);
}
