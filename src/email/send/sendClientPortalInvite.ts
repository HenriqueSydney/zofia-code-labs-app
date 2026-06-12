import { randomBytes } from "crypto";

import { date } from "@/lib/dayjs";
import { prisma } from "@/lib/prisma";

import { sendClientPortalAccessEmail } from "./sendClientPortalAccessEmail";

type SendClientPortalInviteParams = {
  email: string;
  inviteeName: string;
  inviterName: string;
  organizationName: string;
  clientName: string;
  roleLabel?: string;
};

export async function sendClientPortalInvite({
  email,
  inviteeName,
  organizationName,
  clientName,
}: SendClientPortalInviteParams): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expires = date().add(24, "hour").toDate();

  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  const inviteLink = `${baseUrl}/auth/login?callbackUrl=${encodeURIComponent("/minhas-empresas")}`;

  await sendClientPortalAccessEmail({
    to: email,
    inviteeName,
    organizationName,
    clientName,
    inviteLink,
    userEmail: email,
  });
}
