import { randomUUID } from "node:crypto";

import { LoginHistory } from "@/generated/prisma/client";
import { date } from "@/lib/dayjs";
import {
  ICreateLoginHistoryDTO,
  ILoginHistoryRepository,
} from "../ILoginHistoryRepository";

export class InMemoryLoginHistoryRepository implements ILoginHistoryRepository {
  public items: LoginHistory[] = [];

  async create(data: ICreateLoginHistoryDTO): Promise<LoginHistory> {
    const loginHistory: LoginHistory = {
      id: randomUUID(),
      userId: data.userId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      device: data.device,
      city: data.city,
      country: data.country,
      region: data.region,
      createdAt: date().toDate(),
    };

    this.items.push(loginHistory);
    return loginHistory;
  }

  async findByUserId(userId: string): Promise<LoginHistory[]> {
    return this.items
      .filter((item) => item.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async shouldNotifyUnknownLogin(
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<boolean> {
    const userLogins = this.items.filter((item) => item.userId === userId);

    if (userLogins.length === 0) {
      return false;
    }

    const knownDevice = userLogins.some(
      (item) => item.ipAddress === ipAddress && item.userAgent === userAgent,
    );

    return !knownDevice;
  }
}
