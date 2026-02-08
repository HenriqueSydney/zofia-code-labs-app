import { makeUserRepository } from "@/repositories/factories/makeUserRepository";
import { AppError } from "@/errors/AppError";
import { Operation } from "./strategies/types";

// Importação das Strategies
import { AuthProjectStrategy } from "./strategies/auth-project-strategy";
import { AuthDocumentTemplateStrategy } from "./strategies/auth-document-template-strategy";
import { AuthProposalStrategy } from "./strategies/auth-proposal-strategy";
import { AuthContractStrategy } from "./strategies/auth-contract-strategy";
import { AuthBacklogStrategy } from "./strategies/auth-backlog-strategy";
import { AuthClientStrategy } from "./strategies/auth-client-strategy";
import { AuthInstanceSettingsStrategy } from "./strategies/auth-instance-senttings-strategy";
import { AuthSaasOwnerStrategy } from "./strategies/auth-saas-owner-strategy";
import { AuthFinancialStrategy } from "./strategies/auth-financial-strategy";
import { AuthServiceStrategy } from "./strategies/auth-service-strategy";

const projectStrategy = new AuthProjectStrategy();
const documentTemplateStrategy = new AuthDocumentTemplateStrategy();
const proposalStrategy = new AuthProposalStrategy();
const contractStrategy = new AuthContractStrategy();
const backlogStrategy = new AuthBacklogStrategy();
const clientStrategy = new AuthClientStrategy();
const saasOwnerStrategy = new AuthSaasOwnerStrategy();
const serviceStrategy = new AuthServiceStrategy();

const userRepository = makeUserRepository();
// 2. Mapeamos os recursos para as instâncias reaproveitadas
const strategies = {
  project: projectStrategy,
  projectNotes: projectStrategy,
  documents: projectStrategy,

  documentTemplate: documentTemplateStrategy,
  proposal: proposalStrategy,
  contract: contractStrategy,
  backlog: backlogStrategy,

  client: clientStrategy,
  clientEmployee: clientStrategy,

  expenseCategory: new AuthInstanceSettingsStrategy("EXPENSE_CATEGORY"),
  organizationIntegration: new AuthInstanceSettingsStrategy("INTEGRATION"),

  integrationType: saasOwnerStrategy,

  invoice: new AuthFinancialStrategy("INVOICE"),
  expense: new AuthFinancialStrategy("EXPENSE"),

  services: serviceStrategy,
  servicesBacklog: serviceStrategy,
} as const;

type ResourceType = keyof typeof strategies;

export async function checkUserPermissionForAsset<T extends ResourceType>(
  resourceType: T,
  userId: string,
  asset: any,
  operation: Operation = "READ",
) {
  const user = await userRepository.findUserById(userId, asset.organizationId);

  if (!user) throw new AppError("Usuário não localizado");

  const strategy = strategies[resourceType];

  if (!strategy) {
    throw new Error(
      `Estratégia de segurança não definida para: ${resourceType}`,
    );
  }

  // Executa a validação específica da estratégia
  // Se a strategy for síncrona, mantenha assim. Se for assíncrona, adicione o await.
  return strategy.validate(user, asset, operation);
}
