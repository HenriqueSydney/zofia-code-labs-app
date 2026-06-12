import { AppError } from "./AppError";
import { getPermissionInfo, PermissionString } from "@/constants/permissions";

export class UserDoesNotHavePermissionError extends AppError {
  constructor(requiredPermission: PermissionString) {
    const permissionInfo = getPermissionInfo(requiredPermission);
    super(
      `Acesso negado. Necessária permissão: ${permissionInfo.label} (${requiredPermission})`,
      403,
    );
    this.name = "UserDoesNotHavePermissionError";
  }
}
