import { filterInfisicalKeys } from "@/schemas/integration/integrationType";
import { ISecretManagementService } from "@/services/secretManagement/ISecretManagementService";

interface FetchInfisicalSecretValuesParams {
  secretManagementService: ISecretManagementService;
  path?: string | null;
  keys?: string[];
  fieldsSchema?: Record<string, unknown>[];
}

export async function fetchInfisicalSecretValues({
  secretManagementService,
  path,
  keys = [],
  fieldsSchema = [],
}: FetchInfisicalSecretValuesParams): Promise<Record<string, string>> {
  const secretValues: Record<string, string> = {};
  const infisicalKeys = filterInfisicalKeys(keys, fieldsSchema);

  if (!path || infisicalKeys.length === 0) {
    return secretValues;
  }

  for (const key of infisicalKeys) {
    const value = await secretManagementService.getSecret(key, { path });
    if (value) {
      secretValues[key] = value;
    }
  }

  return secretValues;
}
