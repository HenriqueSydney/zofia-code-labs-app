import { PermissionString } from "@/constants/permissions";
import { Role } from "@/generated/prisma/enums";

// 1. Helper para extrair o que vem depois do ":"
// Se T for "project:create", isso retorna "create"
type ExtractAction<T extends string> = T extends `${string}:${infer Action}`
  ? Action
  : never;

// 2. Converte para Uppercase para manter seu padrão (CREATE, READ, SIGN...)
export type Operation = Uppercase<ExtractAction<PermissionString>>;

export interface UserContext {
  id: string;
  organizationId: string;
  role: Role;
  permissions: string[];
}

// Interface genérica para qualquer estratégia
export interface IPermissionStrategy<T> {
  validate(user: UserContext, asset: T, operation: Operation): void;
}
