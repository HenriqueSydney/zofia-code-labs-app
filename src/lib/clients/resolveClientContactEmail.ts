import { Client } from "@/generated/prisma/client";

export type ClientContactEmailSource = Pick<Client, "email"> & {
  responsibleEmail?: string | null;
};

export function resolveClientContactEmail(
  client: ClientContactEmailSource,
): string | null {
  const email = (client.responsibleEmail ?? client.email)?.trim().toLowerCase();
  return email || null;
}
