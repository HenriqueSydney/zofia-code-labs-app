import { InfisicalService } from "./InfisicalService";
import { ISecretManagementService } from "./ISecretManagementService";

let secretManagementService: ISecretManagementService | null = null;

export function makeSecretManagementService() {
  if (!secretManagementService) {
    secretManagementService = new InfisicalService();
  }
  return secretManagementService;
}
