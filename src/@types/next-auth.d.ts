import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";
import {
  ClientEmployeeRole,
  ClientEmployeeStatus,
  MemberRole,
  Role,
} from "@/generated/prisma/enums";

export type SessionClientMembership = {
  clientId: string;
  clientSlug: string;
  tradeName: string;
  companyName: string;
  employeeRole: ClientEmployeeRole;
  status: ClientEmployeeStatus;
};

declare module "next-auth" {
  interface User extends DefaultUser {
    role: Role;
    organizationId: string;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      organizationId: string;
      permissions: string[];
      memberRole: MemberRole | null;
      roleName: string | null;
      customRoleId: string | null;
      clientMemberships: SessionClientMembership[];
      clientMembershipSlugs: string[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: Role;
    organizationId: string;
    permissions: string[];
    memberRole: MemberRole | null;
    roleName: string | null;
    customRoleId: string | null;
    clientMemberships: SessionClientMembership[];
    clientMembershipSlugs: string[];
  }
}
