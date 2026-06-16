import { PERMISSIONS } from "@/constants/permissions";
import {
  MemberRole,
  MemberStatus,
  Role,
  type PrismaClient,
} from "@/generated/prisma/client";
import type { CustomRoleIds, UserIds } from "./types";
import { log } from "./utils";
import { hash } from "bcryptjs";

type MemberConfig = {
  email: string;
  name: string;
  passwordHash?: string;
  role: Role;
  memberRole: MemberRole;
  customRoleKey: keyof CustomRoleIds;
  specificPermissions?: string[];
};

export async function seedUsersAndMembers(
  prisma: PrismaClient,
  organizationId: string,
  customRoles: CustomRoleIds,
): Promise<UserIds> {
  log("👥 Sincronizando usuários e membros...");

  const passwordHash = await hash("sei_muito_bem", 6);
  const passwordHashTesterAdmin = await hash("usuario_ceub_admin", 6);
  const passwordHashTesterMember = await hash("usuario_ceub_user", 6);

  const membersConfig: MemberConfig[] = [
    {
      email: "henriquesydneylima@gmail.com",
      name: "Henrique Sydney Ribeiro Lima",
      passwordHash,
      role: Role.OWNER,
      memberRole: MemberRole.TENANT_MEMBER,
      customRoleKey: "seniorDeveloper",
      specificPermissions: [PERMISSIONS.SETTINGS.MANAGE_MEMBERS],
    },
    {
      email: "mcristinaas.cruz@gmail.com",
      name: "Maria Cristina Araújo Silva Cruz",
      passwordHash,
      role: Role.OWNER,
      memberRole: MemberRole.TENANT_ADMIN,
      customRoleKey: "admin",
    },
    {
      email: "teste_admin@zofiacodelabs.com",
      name: "Usuario CEUB Total",
      passwordHash: passwordHashTesterAdmin,
      role: Role.USER,
      memberRole: MemberRole.TENANT_MEMBER,
      customRoleKey: "ceubAdmin",
    },
    {
      email: "teste_member@zofiacodelabs.com",
      name: "Usuario CEUB Member",
      passwordHash: passwordHashTesterMember,
      role: Role.USER,
      memberRole: MemberRole.TENANT_MEMBER,
      customRoleKey: "projectManager",
    },
  ];

  const userIds: Partial<UserIds> = {};

  for (const config of membersConfig) {
    let user = await prisma.user.findFirst({
      where: { email: config.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          organizationId,
          name: config.name,
          email: config.email,
          passwordHash: config.passwordHash,
          emailVerified: new Date(),
          role: config.role,
        },
      });
      log(`   ✅ Usuário criado: ${config.name}`);
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: config.role,
          ...(config.passwordHash ? { passwordHash: config.passwordHash } : {}),
        },
      });
      log(`   🔄 Usuário atualizado: ${config.name}`);
    }

    const customRoleId = customRoles[config.customRoleKey];

    await prisma.member.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
      update: {
        role: config.memberRole,
        customRoleId,
        specificPermissions: config.specificPermissions ?? [],
        status: MemberStatus.ACTIVE,
      },
      create: {
        organizationId,
        userId: user.id,
        role: config.memberRole,
        customRoleId,
        specificPermissions: config.specificPermissions ?? [],
        status: MemberStatus.ACTIVE,
      },
    });

    log(
      `   ✅ Membro: ${config.name} (${config.memberRole} / ${config.customRoleKey})`,
    );

    if (config.email === "henriquesydneylima@gmail.com") {
      userIds.henrique = user.id;
    } else if (config.email === "mcristinaas.cruz@gmail.com") {
      userIds.cristina = user.id;
    } else if (config.email === "teste_admin@zofiacodelabs.com") {
      userIds.ceubAdmin = user.id;
    } else if (config.email === "teste_member@zofiacodelabs.com") {
      userIds.ceubMember = user.id;
    }
  }

  return userIds as UserIds;
}
