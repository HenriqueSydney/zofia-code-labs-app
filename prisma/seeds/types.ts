import type { BacklogPriority, BacklogStatus } from "@/generated/prisma/client";

export interface CustomRoleIds {
  admin: string;
  projectManager: string;
  financialManager: string;
  seniorDeveloper: string;
  ceubAdmin: string;
}

export interface UserIds {
  henrique: string;
  cristina: string;
  ceubAdmin: string;
  ceubMember: string;
}

export interface SeedContext {
  organizationId: string;
  customRoles: CustomRoleIds;
  categoryMap: Record<string, string>;
  users: UserIds;
}

export type BacklogSeedItem = {
  title: string;
  description: string;
  status: BacklogStatus;
  priority: BacklogPriority;
  points: number;
  order: number;
  checklist?: string[];
};
