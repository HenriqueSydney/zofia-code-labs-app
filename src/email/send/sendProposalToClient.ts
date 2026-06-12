import ProposalSentEmail from "@/email/templates/ProposalSentEmail";

import { createTemplateSender } from "./createTemplateSender";

export const sendProposalToClient = createTemplateSender(
  ProposalSentEmail,
  ({ projectName }) => `Proposta comercial — ${projectName}`,
);
