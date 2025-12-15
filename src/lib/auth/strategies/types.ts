import { Role } from "@/generated/prisma/enums";

export type Operation = "CREATE" | "READ" | "UPDATE" | "DELETE" | "ARCHIVE";

export interface UserContext {
  id: string;
  organizationId: string;
  role: Role;
}

// Interface genérica para qualquer estratégia
export interface IPermissionStrategy<T> {
  validate(user: UserContext, asset: T, operation: Operation): void;
}
