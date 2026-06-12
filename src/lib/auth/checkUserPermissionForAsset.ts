import { auth } from "@/auth";
import { makeUserRepository } from "@/repositories/factories/makeUserRepository";
import {
  ConfigurationError,
  ResourceNotFoundError,
  ValidationError,
} from "@/errors";
import { Operation, UserContext } from "./strategies/types";

// Importação das Strategies
import { AuthProjectStrategy } from "./strategies/auth-project-strategy";
import { AuthProposalStrategy } from "./strategies/auth-proposal-strategy";
import { AuthContractStrategy } from "./strategies/auth-contract-strategy";
import { AuthBacklogStrategy } from "./strategies/auth-backlog-strategy";
import { AuthClientStrategy } from "./strategies/auth-client-strategy";
import { AuthInstanceSettingsStrategy } from "./strategies/auth-instance-senttings-strategy";
import { AuthSaasOwnerStrategy } from "./strategies/auth-saas-owner-strategy";
import { AuthFinancialStrategy } from "./strategies/auth-financial-strategy";
import { AuthServiceStrategy } from "./strategies/auth-service-strategy";
import { AuthOrganizationStrategy } from "./strategies/auth-organization-strategy";
import { AuthServiceBacklogStrategy } from "./strategies/auth-service-backlog-strategy";
import {
  buildSystemActorUserContext,
  isSystemActor,
} from "@/constants/systemActors";

const projectStrategy = new AuthProjectStrategy();
const proposalStrategy = new AuthProposalStrategy();
const contractStrategy = new AuthContractStrategy();
const backlogStrategy = new AuthBacklogStrategy();
const clientStrategy = new AuthClientStrategy();
const saasOwnerStrategy = new AuthSaasOwnerStrategy();
const serviceStrategy = new AuthServiceStrategy();
const organizationStrategy = new AuthOrganizationStrategy();

const userRepository = makeUserRepository();
// 2. Mapeamos os recursos para as instâncias reaproveitadas
const strategies = {
  project: projectStrategy,
  projectNotes: projectStrategy,
  documents: projectStrategy,

  proposal: proposalStrategy,
  contract: contractStrategy,
  backlog: backlogStrategy,

  client: clientStrategy,
  clientEmployee: clientStrategy,
  organization: organizationStrategy,

  expenseCategory: new AuthInstanceSettingsStrategy("EXPENSE_CATEGORY"),
  organizationIntegration: new AuthInstanceSettingsStrategy("INTEGRATION"),

  integrationType: saasOwnerStrategy,

  invoice: new AuthFinancialStrategy("INVOICE"),
  expense: new AuthFinancialStrategy("EXPENSE"),

  serviceCategory: serviceStrategy,
  serviceType: serviceStrategy,
  servicesBacklog: new AuthServiceBacklogStrategy(),
} as const;

type ResourceType = keyof typeof strategies;

async function resolveUserContext(
  userId: string,
  organizationId: string,
): Promise<UserContext> {
  if (isSystemActor(userId)) {
    return buildSystemActorUserContext(userId, organizationId);
  }

  const session = await auth();

  if (
    session?.user?.id === userId &&
    session.user.organizationId === organizationId &&
    Array.isArray(session.user.permissions)
  ) {
    return {
      id: session.user.id,
      organizationId: session.user.organizationId,
      role: session.user.role,
      permissions: session.user.permissions,
      memberRole: session.user.memberRole ?? null,
    };
  }

  const user = await userRepository.findUserById(userId, organizationId);

  if (!user) throw new ResourceNotFoundError("Usuário não localizado");

  return {
    id: user.id,
    organizationId: user.organizationId,
    role: user.role,
    permissions: user.permissions,
    memberRole: user.memberRole ?? null,
  };
}

export async function checkUserPermissionForAsset<T extends ResourceType>(
  resourceType: T,
  userId: string,
  asset: any,
  operation: Operation = "READ",
) {
  const organizationId = asset?.organizationId;

  if (!organizationId) {
    throw new ValidationError(
      "Não foi possível validar permissão: organização do recurso não informada.",
    );
  }

  const user = await resolveUserContext(userId, organizationId);

  const strategy = strategies[resourceType];

  if (!strategy) {
    throw new ConfigurationError(
      `Estratégia de segurança não definida para: ${resourceType}`,
    );
  }

  return strategy.validate(user, asset, operation);
}
