import InviteUserEmail from "@/email/templates/InviteUserEmail";

import { createTemplateSender } from "./createTemplateSender";

export const sendInviteUserEmail = createTemplateSender(
  InviteUserEmail,
  ({ organizationName }) => `Convite para colaborar — ${organizationName}`,
);
