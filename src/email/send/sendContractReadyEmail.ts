import ContractReadyEmail from "@/email/templates/ContractReadyEmail";

import { createTemplateSender } from "./createTemplateSender";

export const sendContractReadyEmail = createTemplateSender(
  ContractReadyEmail,
  ({ projectName }) => `Contrato disponível para assinatura — ${projectName}`,
);
