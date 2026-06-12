import { LoginHistory } from "@/generated/prisma/client";

export interface ICreateLoginHistoryDTO {
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
  device: string | null;
  city: string | null;
  country: string | null;
  region: string | null;
}

export interface ILoginHistoryRepository {
  create(data: ICreateLoginHistoryDTO): Promise<LoginHistory>;
  findByUserId(userId: string): Promise<LoginHistory[]>;
  shouldNotifyUnknownLogin(
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<boolean>;
}
