import ClientPortalAccessEmail from "@/email/templates/ClientPortalAccessEmail";

import { createTemplateSender } from "./createTemplateSender";

export const sendClientPortalAccessEmail = createTemplateSender(
  ClientPortalAccessEmail,
  ({ clientName }) => `Acesso ao portal do cliente — ${clientName}`,
);
