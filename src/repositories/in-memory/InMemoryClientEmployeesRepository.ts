import { randomUUID } from "node:crypto";

import {
  ClientEmployees,
  ClientEmployeeStatus,
  LoginHistory,
  Prisma,
  User,
} from "../../generated/prisma/client";
import { date } from "../../lib/dayjs";
import {
  ClientEmployeesWithDetails,
  IClientEmployeesRepository,
} from "../IClientEmployeesRepository";

export class InMemoryClientEmployeesRepository
  implements IClientEmployeesRepository
{
  public items: ClientEmployees[] = [];
  public users: User[] = [];
  public loginHistories: LoginHistory[] = [];

  async create(
    data: Prisma.ClientEmployeesUncheckedCreateInput,
  ): Promise<ClientEmployees> {
    const now = date().toDate();

    const employee: ClientEmployees = {
      id: randomUUID(),
      organizationId: data.organizationId,
      clientId: data.clientId,
      permissionRole: data.permissionRole,
      jobTitle: data.jobTitle,
      userId: data.userId,
      status: data.status ?? ClientEmployeeStatus.PENDING,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    this.items.push(employee);

    return employee;
  }

  async update(
    id: string,
    data: Prisma.ClientEmployeesUncheckedUpdateInput,
  ): Promise<ClientEmployees> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new Error("ClientEmployee not found");
    }

    const current = this.items[index];
    const updated: ClientEmployees = {
      ...current,
      organizationId:
        typeof data.organizationId === "string"
          ? data.organizationId
          : current.organizationId,
      clientId:
        typeof data.clientId === "string" ? data.clientId : current.clientId,
      permissionRole:
        typeof data.permissionRole === "string"
          ? data.permissionRole
          : current.permissionRole,
      jobTitle:
        typeof data.jobTitle === "string" ? data.jobTitle : current.jobTitle,
      userId: typeof data.userId === "string" ? data.userId : current.userId,
      status:
        typeof data.status === "string" ? data.status : current.status,
      deletedAt:
        data.deletedAt !== undefined
          ? (data.deletedAt as Date | null)
          : current.deletedAt,
      updatedAt: date().toDate(),
    };

    this.items[index] = updated;

    return updated;
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      return;
    }

    this.items[index] = {
      ...this.items[index],
      deletedAt: date().toDate(),
      status: ClientEmployeeStatus.INACTIVE,
      updatedAt: date().toDate(),
    };
  }

  async findById(id: string): Promise<ClientEmployees | null> {
    return (
      this.items.find((item) => item.id === id && item.deletedAt === null) ??
      null
    );
  }

  async findByClientAndUser(
    clientId: string,
    userId: string,
  ): Promise<ClientEmployees | null> {
    return (
      this.items.find(
        (item) =>
          item.clientId === clientId &&
          item.userId === userId &&
          item.deletedAt === null,
      ) ?? null
    );
  }

  async findByClientAndEmail(
    clientId: string,
    email: string,
  ): Promise<ClientEmployees | null> {
    const normalizedEmail = email.toLowerCase();

    const user = this.users.find(
      (u) => u.email.toLowerCase() === normalizedEmail,
    );

    if (!user) {
      return null;
    }

    return (
      this.items.find(
        (item) =>
          item.clientId === clientId &&
          item.userId === user.id &&
          item.deletedAt === null,
      ) ?? null
    );
  }

  async listByClient(clientId: string): Promise<ClientEmployeesWithDetails[]> {
    const employees = this.items
      .filter((item) => item.clientId === clientId && item.deletedAt === null)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return employees
      .map((employee) => {
        const user = this.users.find((u) => u.id === employee.userId);

        if (!user) {
          return null;
        }

        const histories = this.loginHistories
          .filter((history) => history.userId === user.id)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 1)
          .map(({ createdAt }) => ({ createdAt }));

        return {
          ...employee,
          user: {
            name: user.name ?? "",
            email: user.email,
            image: user.image ?? "",
            loginHistories: histories,
          },
        };
      })
      .filter((item): item is ClientEmployeesWithDetails => item !== null);
  }
}
