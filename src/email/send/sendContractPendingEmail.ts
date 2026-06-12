import ContractPendingEmail from "@/email/templates/ContractPendingEmail";

import { createTemplateSender } from "./createTemplateSender";

export const sendContractPendingEmail = createTemplateSender(
  ContractPendingEmail,
  ({ projectName }) => `Aguardando assinatura — ${projectName}`,
);
